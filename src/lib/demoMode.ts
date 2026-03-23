import { useKioskStore } from '@/store/useKioskStore';
import { useStore } from '@/lib/store';

export const DEMO_USER = {
    id: 'demo-user-001',
    name: 'Rahul Sharma',
    mobile: '9999999999',
    address: '12 Civil Lines, Nagpur, Maharashtra',
    preferredLanguage: 'en',
    accessibilityMode: 'standard',
} as const;

export const DEMO_TOKEN = 'demo-jwt-token-suvidha-2026';

export async function activateDemoMode(): Promise<void> {
    // Set Zustand kiosk store — simulate full login
    const kioskStore = useKioskStore.getState();
    kioskStore.login(
        DEMO_TOKEN,
        {
            id: DEMO_USER.id,
            mobile: DEMO_USER.mobile,
            name: DEMO_USER.name,
            address: DEMO_USER.address,
            preferredLanguage: DEMO_USER.preferredLanguage,
            accessibilityMode: DEMO_USER.accessibilityMode,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Parameters<typeof kioskStore.login>[1],
        'FULL_ACCESS',
    );

    // Set global store preferences
    const globalStore = useStore.getState();
    globalStore.setLanguage('en');
    globalStore.setHighContrast(false);
    globalStore.setFontSize('normal');

    // Pre-seed discovered services so dashboard shows linked count
    kioskStore.setServices([
        { id: 'S1', type: 'ELECTRICITY', name: 'MSEDCL Power' },
        { id: 'S2', type: 'WATER', name: 'Nagpur Jal' },
        { id: 'S3', type: 'MUNICIPAL', name: 'NMC Prop Tax' },
    ]);

    // Write demo citizen to IndexedDB so offline mode works
    try {
        const { getDb } = await import('@/lib/offlineDb');
        const db = await getDb();
        await db.put('citizen', {
            mobile: DEMO_USER.mobile,
            name: DEMO_USER.name,
            cachedAt: Date.now(),
        });
    } catch {
        // Non-fatal — offline DB not critical for demo start
        console.warn('[Demo] Could not seed IndexedDB');
    }
}
