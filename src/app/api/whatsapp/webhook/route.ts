import { NextRequest, NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/lib/whatsappBot';

/**
 * 🚀 TWILIO WHATSAPP WEBHOOK (Vercel-Compatible)
 * 
 * Architecture:
 * 1. Webhook returns empty TwiML immediately (fast response)
 * 2. Background handler (handleWhatsAppMessage) sends all messages via Twilio API
 * 3. This avoids timeouts and ensures proper response handling
 * 
 * Message flow:
 * - Text input → AI processes → Sends reply via Twilio API
 * - Media upload → Processes → Sends token via Twilio API
 */

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

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

    // ✅ Always return empty TwiML immediately for Vercel
    // The background handler sends all messages via Twilio API
    if (!from) {
      console.warn('[SUVIDHA Webhook] Missing From field');
      return twimlResponse();
    }

    console.log('[SUVIDHA Webhook] Received:', {
      from,
      hasBody: !!body,
      hasMedia: !!mediaUrl,
    });

    // 🔥 Fire-and-forget: Process message in background
    // DO NOT await - return response immediately for Vercel
    handleWhatsAppMessage(from, body, mediaUrl, mediaContentType).catch((err) =>
      console.error('[SUVIDHA Webhook] Handler error:', err)
    );

    // ✅ Return empty TwiML immediately
    // All message responses are sent by background handler via Twilio API
    return twimlResponse();

  } catch (err) {
    console.error('[SUVIDHA Webhook] Unhandled error:', err);
    // Even on error, return valid TwiML so Twilio doesn't retry
    return twimlResponse();
  }
}

export async function GET(): Promise<NextResponse> {
  return twimlResponse();
}

/**
 * Helper: Return empty TwiML response
 * All user-facing messages are sent via background handler using Twilio API
 */
function twimlResponse(): NextResponse {
  return new NextResponse(EMPTY_TWIML, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}