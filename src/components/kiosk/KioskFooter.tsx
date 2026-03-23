'use client';

import React from 'react';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

export function KioskFooter() {
    const { t } = useDynamicTranslation();
    return (
        <footer className="w-full bg-[#e8e8e8] text-[#5c5c5c] py-4 px-8 border-t border-[#adadad] flex flex-col flex-wrap md:flex-row items-center justify-between text-sm mt-auto z-40">
            <div className="flex items-center gap-4 font-medium">
                <span>{t('Powered by C-DAC')}</span>
                <span className="w-1 h-1 rounded-full bg-[#adadad]"></span>
                <span>{t('Government of India Initiative')}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 md:mt-0 font-medium">
                <span className="flex items-center gap-2 text-[#00a91c]">
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {t('Available 24/7')}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#adadad]"></span>
                <span className="text-[#1a3a6b]"><strong>{t('Toll Free')}:</strong> 1800-XXX-XXXX</span>
            </div>
        </footer>
    );
}
