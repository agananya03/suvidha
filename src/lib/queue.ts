import Queue, { Queue as QueueType } from 'bull';

const redisUrl = process.env.REDIS_URL;

export const serviceQueue = (!redisUrl && process.env.NODE_ENV !== 'production')
    ? ({
        add: async (...args: unknown[]) => { console.log('[Mock Queue] Job added', args); return { id: 'mock-job-123' }; },
        process: () => { console.log('[Mock Queue] Worker registered'); },
        on: () => { return this; },
        isReady: async () => { return this; },
      } as unknown as QueueType)
    : new Queue('service-requests', redisUrl || 'redis://127.0.0.1:6379');
