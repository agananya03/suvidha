"use client";

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

interface BackButtonProps {
    onClick: () => void;
    /** 'dark' for kiosk-shell screens (dark BG), 'light' for route pages (white BG) */
    variant?: 'dark' | 'light';
    className?: string;
}

/**
 * Kiosk-wide Back button.
 * Fixed top-left, 56px tall (well above 48px WCAG tap target).
 * Automatically flips styles when highContrast mode is active.
 * Label translates via useDynamicTranslation.
 */
export function BackButton({ onClick, variant = 'dark', className = '' }: BackButtonProps) {
    const highContrast = useStore((state) => state.highContrast);
    const { t } = useDynamicTranslation();

    const base =
        'fixed top-6 left-6 z-50 flex items-center gap-2 min-h-[56px] px-5 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-lg select-none';

    const style = highContrast
        ? 'bg-white text-black border-2 border-black'
        : variant === 'dark'
        ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-md'
        : 'bg-black/5 text-gray-800 border border-gray-200 hover:bg-black/10';

    return (
        <button
            onClick={onClick}
            className={`${base} ${style} ${className}`}
            aria-label={t('Back')}
        >
            <ChevronLeft size={32} />
            <span>{t('Back')}</span>
        </button>
    );
}
