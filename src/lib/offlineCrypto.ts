'use client';

export async function signPayload(payload: unknown): Promise<string> {
  const key = process.env.NEXT_PUBLIC_KIOSK_HMAC_KEY;
  if (!key) {
    throw new Error('[SUVIDHA] NEXT_PUBLIC_KIOSK_HMAC_KEY is not set');
  }

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const data = new TextEncoder().encode(JSON.stringify(payload));
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return btoa(Array.from(new Uint8Array(signature), (b) => String.fromCharCode(b)).join(''));
}

export async function createSignedSyncItem(
  type: 'complaint' | 'payment_intent' | 'document_upload',
  payload: unknown
): Promise<{
  type: 'complaint' | 'payment_intent' | 'document_upload';
  payload: unknown;
  hmacSignature: string;
}> {
  const id = crypto.randomUUID();
  const createdAt = Date.now();

  const hmacSignature = await signPayload({ type, payload, id, createdAt });

  return {
    type,
    payload,
    hmacSignature,
  };
}
