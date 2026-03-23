import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'

interface SendMessageBody {
  to: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SendMessageBody

    if (!body.to || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Both to and message are required' },
        { status: 400 }
      )
    }

    const twilioMessage = await sendWhatsAppMessage(body.to, body.message)

    return NextResponse.json({
      success: true,
      sid: twilioMessage.sid,
      status: twilioMessage.status,
    })
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send WhatsApp message' },
      { status: 500 }
    )
  }
}
