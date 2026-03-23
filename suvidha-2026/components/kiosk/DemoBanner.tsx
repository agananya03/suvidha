'use client';

import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

export function DemoBanner() {
    const { t } = useDynamicTranslation();
    
    return (
        <div className="w-full bg-accent text-white text-center py-1 font-bold text-sm tracking-wider uppercase z-[110] relative">
            {t('DEMO MODE - C-DAC Smart City Challenge 2026')}
        </div>
    );
}
