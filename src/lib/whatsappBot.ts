import { getSession, saveSession, WhatsAppSession } from '@/lib/redisClient';
import { sendWhatsAppMessage } from '@/lib/messaging';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const DONE_MSG = (token: string) =>
  `✅ *Document received & encrypted!*\n\n🔐 *Your Secure Token:* \`${token}\`\n⏰ Valid for exactly *48 hours*\n\nAt the kiosk:\n1. Select your service\n2. When asked for documents, enter token *${token}*\n3. Your file loads instantly — no scanning needed!\n\n❓ Cannot travel? Reply *HOME VISIT* to book a mobile agent (₹50 fee).\n\n_SUVIDHA — One visit. Everything done._`;

export async function handleWhatsAppMessage(
  fromPhone: string,
  messageBody: string,
  mediaUrl?: string,
  mediaContentType?: string
): Promise<void> {
  const session = await getSession(fromPhone);

  // Direct media upload — handle without AI
  if (session.step === 'WAITING_UPLOAD' && mediaUrl && mediaContentType) {
    try {
      await sendWhatsAppMessage(fromPhone,
        '⏳ Got your document! Processing securely...');

      const credentials = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64');

      const mediaRes = await fetch(mediaUrl, {
        headers: { Authorization: `Basic ${credentials}` },
      });
      if (!mediaRes.ok) throw new Error('Media download failed');

      const buffer = Buffer.from(await mediaRes.arrayBuffer());
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

      const uploadRes = await fetch(
        `${BASE_URL}/api/documents/upload`,
        { method: 'POST', body: formData }
      );
      if (!uploadRes.ok) throw new Error('Upload API failed');

      const { token } = await uploadRes.json() as { token: string };

      session.uploadedToken = token;
      session.step = 'DONE';
      session.history.push(
        { role: 'user', content: '[Citizen sent a document via WhatsApp]' },
        { role: 'assistant', content: `Document received. Token: ${token}` }
      );
      await saveSession(fromPhone, session);
      await sendWhatsAppMessage(fromPhone, DONE_MSG(token));
      return;

    } catch (err) {
      console.error('[Bot] Media upload error:', err);
      await sendWhatsAppMessage(fromPhone,
        `❌ Could not process your document. Try again or use:\n${BASE_URL}/upload/${encodeURIComponent(fromPhone)}`
      );
      return;
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
    await sendWhatsAppMessage(fromPhone, finalReply);

  } catch (err) {
    console.error('[Bot] Gemini error:', err);
    await sendWhatsAppMessage(fromPhone,
      `Sorry, I'm having trouble right now. Please call *1800-111-2026* or type *MENU* to try again.`
    );
  }
}
