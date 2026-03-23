import { WhatsAppHandlerInput, WhatsAppHandlerResult } from '@/lib/whatsapp/types'

export async function handleOption2(_input: WhatsAppHandlerInput): Promise<WhatsAppHandlerResult> {
  return {
    replyText: 'Option 2 placeholder. Implement your own input/output logic here.',
    nextIntent: 'OPTION_2',
  }
}
