import { getSession, saveSession, WhatsAppSession } from '@/lib/redisClient';
import { sendWhatsAppMessage } from '@/lib/messaging';

  // Construct BASE_URL with Vercel support
const getBaseUrl = () => {
  // Vercel environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Explicit env variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Localhost fallback
  return 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();

const DONE_MSG = (token: string) =>
  `✅ *Document received & encrypted!*\n\n🔐 *Your Secure Token:* \`${token}\`\n⏰ Valid for exactly *48 hours*\n\nAt the kiosk:\n1. Select your service\n2. When asked for documents, enter token *${token}*\n3. Your file loads instantly — no scanning needed!\n\n❓ Cannot travel? Reply *HOME VISIT* to book a mobile agent (₹50 fee).\n\n_SUVIDHA — One visit. Everything done._`;

export async function handleWhatsAppMessage(
  fromPhone: string,
  messageBody: string,
  mediaUrl?: string,
  mediaContentType?: string
): Promise<string> {
  const session = await getSession(fromPhone);

  // Direct media upload — handle without AI
  if (session.step === 'WAITING_UPLOAD' && mediaUrl && mediaContentType) {
    try {
      const immediateResponse = '⏳ Got your document! Processing securely...';
      
      // Process media upload in background (fire-and-forget)
      processMediaUpload(fromPhone, mediaUrl, mediaContentType, session, BASE_URL).catch((err) => {
        console.error('[Bot] Background processing failed:', err);
      });

      return immediateResponse;

    } catch (err) {
      console.error('[Bot] Media upload error:', err);
      return `❌ Could not process your document. Try again or use:\n${BASE_URL}/upload/${encodeURIComponent(fromPhone)}`;
    }
  }

  // All text messages — use Gemini AI
  try {
    const { getAiResponse } = await import('@/lib/suvidhaAiBot');
    const aiResponse = await getAiResponse(session, messageBody);

    session.step = aiResponse.newStep;
    if (aiResponse.serviceType) session.serviceType = aiResponse.serviceType;
    if (aiResponse.detectedLanguage) session.language = aiResponse.detectedLanguage;

    let finalReply = aiResponse.reply;
    if (aiResponse.readyForUpload && session.step === 'WAITING_UPLOAD') {
      finalReply += `\n\n📎 *Two ways to upload:*\n1️⃣ Send photo/PDF directly here\n2️⃣ Use link: ${BASE_URL}/upload/${encodeURIComponent(fromPhone)}`;
    }

    session.history.push(
      { role: 'user', content: messageBody },
      { role: 'assistant', content: aiResponse.reply }
    );
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }

    await saveSession(fromPhone, session);
    
    // Return response for TwiML
    return finalReply;

  } catch (err) {
    console.error('[Bot] Gemini error:', err);
    return `Sorry, I'm having trouble right now. Please call *1800-111-2026* or type *MENU* to try again.`;
  }
}

/**
 * Background task to process media upload
 * Runs asynchronously without blocking the webhook response
 * For Vercel serverless compatibility, use Promise chain (not setImmediate)
 */
async function processMediaUpload(
  fromPhone: string,
  mediaUrl: string,
  mediaContentType: string,
  session: WhatsAppSession,
  baseUrl: string
): Promise<void> {
  try {
    console.log('[Bot] Starting media upload processing for:', fromPhone);
    
    const credentials = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString('base64');

    console.log('[Bot] Downloading media from:', mediaUrl);
    const mediaRes = await fetch(mediaUrl, {
      headers: { Authorization: `Basic ${credentials}` },
    });
    if (!mediaRes.ok) {
      throw new Error(`Media download failed: ${mediaRes.status} ${mediaRes.statusText}`);
    }

    const buffer = Buffer.from(await mediaRes.arrayBuffer());
    console.log('[Bot] Downloaded media, size:', buffer.length, 'bytes');
    
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/png': 'png',
      'application/pdf': 'pdf', 'image/webp': 'webp',
    };
    const ext = extMap[mediaContentType] ?? 'bin';
    const filename = `wa-doc-${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append(
      'file',
      new Blob([buffer], { type: mediaContentType }),
      filename
    );
    formData.append('serviceType', session.serviceType ?? '');

    console.log('[Bot] Uploading to:', `${baseUrl}/api/documents/upload`);
    const uploadRes = await fetch(
      `${baseUrl}/api/documents/upload`,
      { method: 'POST', body: formData }
    );
    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(`Upload API failed: ${uploadRes.status} ${uploadRes.statusText} - ${errorText}`);
    }

    const { token } = await uploadRes.json() as { token: string };
    console.log('[Bot] Upload successful, token:', token);

    // Update session
    session.uploadedToken = token;
    session.step = 'DONE';
    session.history.push(
      { role: 'user', content: '[Citizen sent a document via WhatsApp]' },
      { role: 'assistant', content: `Document received. Token: ${token}` }
    );
    await saveSession(fromPhone, session);
    console.log('[Bot] Session saved, now sending token message');

    // Send token to user
    await sendWhatsAppMessage(fromPhone, DONE_MSG(token));
    console.log('[Bot] Token message sent successfully');

  } catch (err) {
    console.error('[Bot] Background media processing error:', {
      phone: fromPhone,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    
    try {
      await sendWhatsAppMessage(fromPhone,
        `❌ Could not process your document. Try again or use:\n${baseUrl}/upload/${encodeURIComponent(fromPhone)}`
      );
    } catch (sendErr) {
      console.error('[Bot] Failed to send error message:', sendErr);
    }
  }
}
