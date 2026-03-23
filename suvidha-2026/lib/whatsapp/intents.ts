import { WhatsAppIntent } from '@/lib/whatsapp/types'

export function detectIntent(messageBody: string): WhatsAppIntent {
  const text = messageBody.toLowerCase().trim()

  if (!text || text === 'menu' || text === 'hi' || text === 'hello') {
    return 'MENU'
  }

  if (text === '1' || text.includes('option 1')) {
    return 'OPTION_1'
  }

  if (text === '2' || text.includes('option 2')) {
    return 'OPTION_2'
  }

  if (text === '3' || text.includes('option 3')) {
    return 'OPTION_3'
  }

  if (text === '4' || text.includes('help')) {
    return 'HELP'
  }

  return 'UNKNOWN'
}
