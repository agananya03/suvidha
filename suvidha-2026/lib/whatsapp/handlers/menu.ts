import { WhatsAppHandlerInput, WhatsAppHandlerResult } from '@/lib/whatsapp/types'

export async function handleMenu(_input: WhatsAppHandlerInput): Promise<WhatsAppHandlerResult> {
  return {
    replyText: [
      'Welcome to Suvidha WhatsApp Bot.',
      '',
      'Please choose an option:',
      '1. Option 1',
      '2. Option 2',
      '3. Option 3',
      '4. Help',
    ].join('\n'),
    nextIntent: 'MENU',
  }
}
