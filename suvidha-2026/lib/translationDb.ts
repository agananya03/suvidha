import { getDb } from '@/lib/offlineDb';

export async function getCachedTranslation(
  key: string
): Promise<string | null> {
  try {
    const db = await getDb();
    const entry = await db.get('translations', key);
    return entry?.value ?? null;
  } catch {
    return null;
  }
}

export async function setCachedTranslation(
  key: string,
  value: string
): Promise<void> {
  try {
    const db = await getDb();
    await db.put('translations', { key, value, cachedAt: Date.now() });
  } catch (err) {
    console.warn('[SUVIDHA] Could not persist translation:', err);
  }
}

export async function getCachedTranslationsForLanguage(
  languageCode: string
): Promise<Record<string, string>> {
  try {
    const db = await getDb();
    const all = await db.getAll('translations');
    const result: Record<string, string> = {};
    const prefix = `${languageCode}__`;
    for (const entry of all) {
      if (entry.key.startsWith(prefix)) {
        result[entry.key] = entry.value;
      }
    }
    return result;
  } catch {
    return {};
  }
}
