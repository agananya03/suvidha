import { getPendingActions, markDone, markFailed, incrementRetry } from '@/lib/offlineDb';

export async function flushSyncQueue(): Promise<void> {
  const pending = await getPendingActions();
  if (pending.length === 0) return;

  console.log(`[SUVIDHA] Flushing ${pending.length} queued action(s)`);

  for (const item of pending) {
    if (item.retryCount >= 5) {
      await markFailed(item.id);
      continue;
    }

    try {
      let endpoint = '';
      if (item.type === 'complaint') endpoint = '/api/complaints/submit';
      if (item.type === 'payment_intent') endpoint = '/api/payments/process';

      if (!endpoint) continue;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(item.hmacSignature && {
            'X-SUVIDHA-Signature': item.hmacSignature,
          }),
        },
        body: JSON.stringify(item.payload),
      });

      if (res.ok) {
        await markDone(item.id);
        console.log(`[SUVIDHA] Synced item ${item.id}`);
      } else {
        await incrementRetry(item.id);
        console.warn(`[SUVIDHA] Failed item ${item.id} — retry ${item.retryCount + 1}/5`);
      }
    } catch {
      await incrementRetry(item.id);
    }
  }
}

