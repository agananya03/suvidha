import twilio from 'twilio'
import { NextRequest } from 'next/server'

export async function isValidTwilioSignature(request: NextRequest): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!authToken) {
    return false
  }

  const signature = request.headers.get('x-twilio-signature')
  if (!signature) {
    return false
  }

  const formData = await request.clone().formData()
  const payload: Record<string, string> = {}

  formData.forEach((value, key) => {
    payload[key] = String(value)
  })

  return twilio.validateRequest(authToken, signature, request.url, payload)
}
