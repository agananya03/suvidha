/*
 * SUVIDHA WhatsApp Webhook (FIXED)
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/lib/whatsappBot';

// Twilio sends webhook as application/x-www-form-urlencoded
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

    // Run your logic in background (optional)
    handleWhatsAppMessage(from, body, mediaUrl, mediaContentType).catch(
      (err) => console.error('[SUVIDHA Webhook] Error:', err)
    );

    // ✅ IMPORTANT: Send reply via TwiML
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
       <Response>
         <Message>Hello from Suvidha 🚀</Message>
       </Response>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  } catch (err) {
    console.error('[SUVIDHA Webhook] Unhandled error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Twilio also sends GET for verification
export async function GET(): Promise<NextResponse> {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
     <Response>
       <Message>Webhook is live 🚀</Message>
     </Response>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    }
  );
}