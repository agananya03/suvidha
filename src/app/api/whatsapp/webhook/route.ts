import { NextRequest, NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/lib/whatsappBot';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();

    const from = formData.get('From') as string;
    const body = (formData.get('Body') as string) ?? '';
    const numMedia = parseInt((formData.get('NumMedia') as string) ?? '0');

    const mediaUrl =
      numMedia > 0 ? (formData.get('MediaUrl0') as string) : undefined;

    const mediaContentType =
      numMedia > 0
        ? (formData.get('MediaContentType0') as string)
        : undefined;

    if (!from) {
      return new NextResponse('Missing From', { status: 400 });
    }

    // ✅ DO NOT await (important for Twilio timeout)
    handleWhatsAppMessage(
      from,
      body,
      mediaUrl,
      mediaContentType
    ).catch((err) =>
      console.error('[SUVIDHA Webhook] Error:', err)
    );

    // ✅ ONLY thing Twilio needs: valid empty TwiML
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );

  } catch (err) {
    console.error('[SUVIDHA Webhook] Unhandled error:', err);

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    }
  );
}