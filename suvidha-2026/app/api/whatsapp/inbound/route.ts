import { NextRequest, NextResponse } from 'next/server'
import { detectIntent } from '@/lib/whatsapp/intents'
import { parseInboundFormData } from '@/lib/whatsapp/parser'
import { getWhatsAppSession, setWhatsAppSession } from '@/lib/whatsapp/session'
import { isValidTwilioSignature } from '@/lib/whatsapp/verify-signature'
import { handleMenu } from '@/lib/whatsapp/handlers/menu'
import { handleOption1 } from '@/lib/whatsapp/handlers/option1'
import { handleOption2 } from '@/lib/whatsapp/handlers/option2'
import { handleOption3 } from '@/lib/whatsapp/handlers/option3'
import { handleHelp } from '@/lib/whatsapp/handlers/help'
import { WhatsAppHandlerInput } from '@/lib/whatsapp/types'

function buildTwimlMessage(text: string): string {
  const escaped = text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`
}

export async function POST(request: NextRequest) {
  const enforceSignatureCheck = process.env.TWILIO_VALIDATE_SIGNATURE !== 'false'

  if (enforceSignatureCheck) {
    const isValid = await isValidTwilioSignature(request)
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid Twilio signature' }, { status: 401 })
    }
  }

  const formData = await request.formData()
  const message = parseInboundFormData(formData)

  const session = await getWhatsAppSession(message.from)
  const intent = detectIntent(message.body)
  const input: WhatsAppHandlerInput = { message, session }

  let result

  switch (intent) {
    case 'MENU':
      result = await handleMenu(input)
      break
    case 'OPTION_1':
      result = await handleOption1(input)
      break
    case 'OPTION_2':
      result = await handleOption2(input)
      break
    case 'OPTION_3':
      result = await handleOption3(input)
      break
    case 'HELP':
      result = await handleHelp(input)
      break
    default:
      result = await handleMenu(input)
      break
  }

  if (result.nextIntent) {
    await setWhatsAppSession(message.from, result.nextIntent, result.sessionContext)
  }

  return new NextResponse(buildTwimlMessage(result.replyText), {
    status: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
