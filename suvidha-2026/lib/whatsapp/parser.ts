import { WhatsAppInboundMessage } from '@/lib/whatsapp/types'

export function parseInboundFormData(formData: FormData): WhatsAppInboundMessage {
  return {
    messageSid: String(formData.get('MessageSid') || ''),
    from: String(formData.get('From') || ''),
    to: String(formData.get('To') || ''),
    body: String(formData.get('Body') || '').trim(),
    profileName: String(formData.get('ProfileName') || ''),
    numMedia: Number(formData.get('NumMedia') || 0),
  }
}
