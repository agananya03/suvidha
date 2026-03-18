import { createHmac } from 'crypto';

export function verifyHmacSignature(
  payload: unknown,
  receivedSignature: string
): boolean {
  const key = process.env.NEXT_PUBLIC_KIOSK_HMAC_KEY;
  if (!key) {
    console.error('[SUVIDHA] HMAC key not configured on server');
    return false;
  }

  try {
    const expected = createHmac('sha256', key)
      .update(JSON.stringify(payload))
      .digest('base64');
    return expected === receivedSignature;
  } catch {
    return false;
  }
}
