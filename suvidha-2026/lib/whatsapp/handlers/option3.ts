import { WhatsAppHandlerInput, WhatsAppHandlerResult } from '@/lib/whatsapp/types'

export async function handleOption3(_input: WhatsAppHandlerInput): Promise<WhatsAppHandlerResult> {
  return {
    replyText: 'Option 3 placeholder. Implement your own input/output logic here.',
    nextIntent: 'OPTION_3',
  }
}
