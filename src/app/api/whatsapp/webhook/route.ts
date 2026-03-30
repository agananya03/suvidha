import { NextRequest, NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/lib/whatsappBot';

/**
 * 🚀 TWILIO WHATSAPP WEBHOOK (Vercel-Compatible)
 * 
 * Architecture:
 * 1. Text messages: Webhook awaits AI response, returns immediately in TwiML
 * 2. Media uploads: Webhook returns "processing..." in TwiML, processes async in background
 * 3. Tokens: Sent via Twilio API after media processing completes
 */

function twimlResponse(message?: string): NextResponse {
  const twiml = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();

    const from = (formData.get('From') as string) ?? '';
    const body = (formData.get('Body') as string) ?? '';
    const numMedia = parseInt((formData.get('NumMedia') as string) ?? '0', 10);

    const mediaUrl =
      numMedia > 0 ? (formData.get('MediaUrl0') as string) : undefined;

    const mediaContentType =
      numMedia > 0
        ? (formData.get('MediaContentType0') as string)
        : undefined;

    if (!from) {
      console.warn('[SUVIDHA Webhook] Missing From field');
      return twimlResponse();
    }

    console.log('[SUVIDHA Webhook] Received:', {
      from,
      hasBody: !!body,
      hasMedia: !!mediaUrl,
    });

    // ✅ Await handler to get the response message
    const responseMessage = await handleWhatsAppMessage(from, body, mediaUrl, mediaContentType);

    // ✅ Return response in TwiML for user to see immediately
    return twimlResponse(responseMessage);

  } catch (err) {
    console.error('[SUIVIDHA Webhook] Unhandled error:', err);
    // Even on error, return valid TwiML
    return twimlResponse();
  }
}

export async function GET(): Promise<NextResponse> {
  return twimlResponse();
}