import { WhatsAppHandlerInput, WhatsAppHandlerResult } from '@/lib/whatsapp/types'

export async function handleOption1(_input: WhatsAppHandlerInput): Promise<WhatsAppHandlerResult> {
  return {
    replyText: 'Option 1 placeholder. Implement your own input/output logic here.',
    nextIntent: 'OPTION_1',
  }
}
