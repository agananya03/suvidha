import { NextRequest, NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/lib/whatsappBot';

const TWIML_RESPONSE = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>✅ Got your message! Processing...</Message>
</Response>`;

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

    // ✅ Always return TwiML, even for missing data
    if (!from) {
      console.warn('[SUVIDHA Webhook] Missing From field');
      return twimlResponse();
    }

    // ✅ DO NOT await (important for Vercel timeout)
    handleWhatsAppMessage(
      from,
      body,
      mediaUrl,
      mediaContentType
    ).catch((err) =>
      console.error('[SUVIDHA Webhook] Handler error:', err)
    );

    // ✅ Return TwiML immediately
    return twimlResponse();

  } catch (err) {
    console.error('[SUVIDHA Webhook] Unhandled error:', err);
    // Even on error, return valid TwiML
    return twimlResponse();
  }
}

export async function GET(): Promise<NextResponse> {
  return twimlResponse();
}

// Helper function for consistent TwiML responses
function twimlResponse(): NextResponse {
  return new NextResponse(TWIML_RESPONSE, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}