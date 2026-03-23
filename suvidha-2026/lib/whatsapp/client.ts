import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM

let twilioClient: ReturnType<typeof twilio> | null = null

function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN')
  }

  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken)
  }

  return twilioClient
}

export async function sendWhatsAppMessage(to: string, body: string) {
  if (!fromWhatsApp) {
    throw new Error('Missing TWILIO_WHATSAPP_FROM env var')
  }

  const client = getTwilioClient()

  return client.messages.create({
    from: fromWhatsApp,
    to,
    body,
  })
}
