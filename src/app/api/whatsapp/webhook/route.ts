/*
 * SUVIDHA WhatsApp Webhook
 *
 * LOCAL TESTING SETUP:
 * 1. Install ngrok: npm install -g ngrok
 * 2. Run: ngrok http 3000
 * 3. Copy the https URL (e.g. https://abc123.ngrok.io)
 * 4. Go to Twilio Console → Messaging → WhatsApp Sandbox Settings
 * 5. Set "When a message comes in" to:
 *    https://abc123.ngrok.io/api/whatsapp/webhook
 * 6. Save
 * 7. Text "join <your-sandbox-word>" to +14155238886 on WhatsApp
 * 8. Now text any message — your bot will respond!
 *
 * PRODUCTION:
 * Set NEXT_PUBLIC_BASE_URL to your deployed URL
 * Update Twilio webhook to your production URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleWhatsAppMessage } from '@/lib/whatsappBot';

// Twilio sends webhook as application/x-www-form-urlencoded
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();

    const from = formData.get('From') as string;
    const body = formData.get('Body') as string ?? '';
    const numMedia = parseInt(formData.get('NumMedia') as string ?? '0');
    const mediaUrl = numMedia > 0
      ? (formData.get('MediaUrl0') as string)
      : undefined;
    const mediaContentType = numMedia > 0
      ? (formData.get('MediaContentType0') as string)
      : undefined;

    if (!from) {
      return new NextResponse('Missing From', { status: 400 });
    }

    // Process in background — Twilio expects fast response
    // Use waitUntil if available, else just don't await
    handleWhatsAppMessage(from, body, mediaUrl, mediaContentType).catch(err =>
      console.error('[SUVIDHA Webhook] Error:', err)
    );

    // Twilio expects empty TwiML or 200 response within 15 seconds
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
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
    `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
    { status: 200, headers: { 'Content-Type': 'text/xml' } }
  );
}
