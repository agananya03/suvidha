export type WhatsAppIntent =
  | 'MENU'
  | 'OPTION_1'
  | 'OPTION_2'
  | 'OPTION_3'
  | 'HELP'
  | 'UNKNOWN'

export interface WhatsAppInboundMessage {
  messageSid: string
  from: string
  to: string
  body: string
  profileName?: string
  numMedia: number
}

export interface WhatsAppSession {
  lastIntent: WhatsAppIntent
  updatedAt: string
  context?: Record<string, string>
}

export interface WhatsAppHandlerInput {
  message: WhatsAppInboundMessage
  session: WhatsAppSession | null
}

export interface WhatsAppHandlerResult {
  replyText: string
  nextIntent?: WhatsAppIntent
  sessionContext?: Record<string, string>
}
