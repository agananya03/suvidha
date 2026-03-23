import { redis } from '@/lib/redis'
import { WhatsAppIntent, WhatsAppSession } from '@/lib/whatsapp/types'

const SESSION_TTL_SECONDS = 60 * 60

function sessionKey(from: string) {
  return `wa:session:${from}`
}

export async function getWhatsAppSession(from: string): Promise<WhatsAppSession | null> {
  return redis.get<WhatsAppSession>(sessionKey(from))
}

export async function setWhatsAppSession(
  from: string,
  lastIntent: WhatsAppIntent,
  context?: Record<string, string>
): Promise<void> {
  const payload: WhatsAppSession = {
    lastIntent,
    updatedAt: new Date().toISOString(),
    context,
  }

  await redis.set(sessionKey(from), payload, { ex: SESSION_TTL_SECONDS })
}

export async function clearWhatsAppSession(from: string): Promise<void> {
  await redis.del(sessionKey(from))
}
