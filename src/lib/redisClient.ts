import Redis from 'ioredis';

// In-memory fallback if no REDIS_URL is provided locally
class InMemoryRedis {
  private store = new Map<string, string>();
  
  async get(key: string) {
    return this.store.get(key) || null;
  }
  
  async set(key: string, value: string, mode?: string, duration?: number) {
    this.store.set(key, value);
    if (duration) {
      setTimeout(() => this.store.delete(key), duration * 1000);
    }
    return 'OK';
  }
  
  async del(key: string) {
    this.store.delete(key);
    return 1;
  }
  
  on() {} 
}

const globalForRedis = globalThis as unknown as { redis: Redis | InMemoryRedis | undefined };

export const redis =
  globalForRedis.redis ??
  (process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
    : new InMemoryRedis());

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Session helpers — keyed by phone number
// TTL: 30 minutes of inactivity resets the conversation

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface WhatsAppSession {
  step: 'WELCOME' | 'ASKED_SERVICE' | 'ASKED_DOCS' | 'WAITING_UPLOAD' | 'DONE';
  serviceType: 'electricity' | 'gas' | 'water' | 'complaint' | 'queue' | null;
  phone: string;
  uploadedToken?: string;
  history: ConversationMessage[];
  language?: string;
}

export async function getSession(phone: string): Promise<WhatsAppSession> {
  const raw = await redis.get(`wa_session:${phone}`);
  if (raw) {
    const parsed = JSON.parse(raw) as WhatsAppSession;
    if (!parsed.history) parsed.history = [];
    return parsed;
  }
  return { step: 'WELCOME', serviceType: null, phone, history: [] };
}

export async function saveSession(
  phone: string,
  session: WhatsAppSession
): Promise<void> {
  await redis.set(
    `wa_session:${phone}`,
    JSON.stringify(session),
    'EX',
    1800 // 30 min TTL
  );
}

export async function clearSession(phone: string): Promise<void> {
  await redis.del(`wa_session:${phone}`);
}
