import { openDB, type IDBPDatabase, type DBSchema } from 'idb';

export interface SyncItem {
  id: string;
  type: 'complaint' | 'payment_intent' | 'document_upload';
  payload: unknown;
  createdAt: number;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'DONE' | 'FAILED';
  hmacSignature?: string;
}

export interface CitizenRecord {
  mobile: string;
  name?: string;
  email?: string;
  address?: string;       // last used address
  lastVisitAt?: number;   // timestamp of last kiosk visit
  visitCount?: number;    // how many times they have visited
  cachedAt: number;
}

export interface BillRecord {
  consumerNumber: string;
  data: unknown;
  cachedAt: number;
}

export interface ComplaintRecord {
  id: string;
  data: unknown;
  cachedAt: number;
}

interface SuvidhaDB extends DBSchema {
  citizen: {
    key: string;
    value: CitizenRecord;
  };
  syncQueue: {
    key: string;
    value: SyncItem;
    indexes: { 'by-status': string; 'by-createdAt': number };
  };
  bills: {
    key: string;
    value: BillRecord;
  };
  complaints: {
    key: string;
    value: ComplaintRecord;
  };
  translations: {
    key: string;
    value: { key: string; value: string; cachedAt: number };
  };
}

let dbInstance: IDBPDatabase<SuvidhaDB> | null = null;

export async function getDb(): Promise<IDBPDatabase<SuvidhaDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<SuvidhaDB>('suvidha-offline', 1, {
    upgrade(db) {
      db.createObjectStore('citizen', { keyPath: 'mobile' });
      const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
      syncStore.createIndex('by-status', 'status');
      syncStore.createIndex('by-createdAt', 'createdAt');
      db.createObjectStore('bills', { keyPath: 'consumerNumber' });
      db.createObjectStore('complaints', { keyPath: 'id' });
      db.createObjectStore('translations', { keyPath: 'key' });
    },
  });
  return dbInstance;
}

export async function queueAction(
  item: Omit<SyncItem, 'id' | 'retryCount' | 'status' | 'createdAt'>
): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const full: SyncItem = {
    ...item,
    id,
    createdAt: Date.now(),
    retryCount: 0,
    status: 'PENDING',
  };
  await db.put('syncQueue', full);
  return id;
}

export async function getPendingActions(): Promise<SyncItem[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex('syncQueue', 'by-status', 'PENDING');
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function markDone(id: string): Promise<void> {
  const db = await getDb();
  const item = await db.get('syncQueue', id);
  if (!item) return;
  await db.put('syncQueue', { ...item, status: 'DONE' });
}

export async function markFailed(id: string): Promise<void> {
  const db = await getDb();
  const item = await db.get('syncQueue', id);
  if (!item) return;
  await db.put('syncQueue', { ...item, status: 'FAILED' });
}

export async function incrementRetry(id: string): Promise<void> {
  const db = await getDb();
  const item = await db.get('syncQueue', id);
  if (!item) return;
  await db.put('syncQueue', { ...item, retryCount: item.retryCount + 1 });
}

export async function clearSessionData(): Promise<void> {
  const db = await getDb();
  await db.clear('citizen');
  await db.clear('bills');
  await db.clear('complaints');
  // syncQueue is intentionally NOT cleared — pending actions survive logout
}
