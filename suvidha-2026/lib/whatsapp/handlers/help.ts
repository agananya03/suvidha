import { WhatsAppHandlerInput, WhatsAppHandlerResult } from '@/lib/whatsapp/types'

export async function handleHelp(_input: WhatsAppHandlerInput): Promise<WhatsAppHandlerResult> {
  return {
    replyText: 'Help flow placeholder. Implement your own input/output logic here.',
    nextIntent: 'HELP',
  }
}
