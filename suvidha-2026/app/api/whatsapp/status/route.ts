import { NextRequest, NextResponse } from 'next/server'
import { isValidTwilioSignature } from '@/lib/whatsapp/verify-signature'

export async function POST(request: NextRequest) {
  const enforceSignatureCheck = process.env.TWILIO_VALIDATE_SIGNATURE !== 'false'

  if (enforceSignatureCheck) {
    const isValid = await isValidTwilioSignature(request)
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid Twilio signature' }, { status: 401 })
    }
  }

  const formData = await request.formData()

  const payload = {
    messageSid: String(formData.get('MessageSid') || ''),
    messageStatus: String(formData.get('MessageStatus') || ''),
    to: String(formData.get('To') || ''),
    from: String(formData.get('From') || ''),
    errorCode: String(formData.get('ErrorCode') || ''),
    errorMessage: String(formData.get('ErrorMessage') || ''),
  }

  // Placeholder for persistence/analytics.
  console.log('[WhatsApp Status Callback]', payload)

  return NextResponse.json({ success: true })
}
