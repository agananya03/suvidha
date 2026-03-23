"use client";

import React, { useEffect, useState } from 'react';
import { useKioskStore } from '@/store/useKioskStore';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

export function KioskHeader() {
    const { isAuthenticated, sessionStartTime } = useKioskStore();
    const { t } = useDynamicTranslation();
    const [timeLeft, setTimeLeft] = useState<string>('');

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    useEffect(() => {
        if (!isAuthenticated || !sessionStartTime) {
            setTimeLeft('');
            return;
        }

        const calculateTimeLeft = () => {
            const expiry = new Date(sessionStartTime).getTime() + (24 * 60 * 60 * 1000); // 24 hours JWT expiry
            const now = Date.now();
            const diff = expiry - now;

            if (diff <= 0) {
                return '00:00:00';
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, [isAuthenticated, sessionStartTime]);

    return (
        <header className="kiosk-header z-30 relative shrink-0">
            {/* Government emblem + SUVIDHA branding left-aligned */}
            <div className="brand">
                <div className="bg-white p-1 rounded-full flex items-center justify-center w-10 h-10">
                    <svg viewBox="0 0 100 100" className="w-8 h-8 text-[#1a3a6b]">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
                        <circle cx="50" cy="50" r="8" fill="currentColor" />
                        {Array.from({ length: 24 }).map((_, i) => (
                            <line
                                key={i}
                                x1="50" y1="50" x2="50" y2="5"
                                stroke="currentColor"
                                strokeWidth="2"
                                transform={`rotate(${i * 15} 50 50)`}
                            />
                        ))}
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold">{t('Government of India')} | C-DAC</span>
                    <span className="text-sm font-medium opacity-90">SUVIDHA 2026 Kiosk</span>
                </div>
            </div>

            {/* Right side nav / info */}
            <div className="flex items-center gap-4">
                {isAuthenticated && timeLeft && (
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-xs uppercase tracking-widest opacity-80">{t('Session Expires')}</span>
                        <span className="text-sm font-mono font-bold tracking-wider">
                            {timeLeft}
                        </span>
                    </div>
                )}
                <div className="kiosk-nav-link" onClick={() => window.location.href = '/kiosk'}>
                    {t('Home')}
                </div>
            </div>

            {isDemoMode && (
                <div className="absolute top-full left-0 w-full bg-[#ffbe2e] text-[#4a3000] font-bold text-center py-2 text-sm uppercase tracking-widest shadow-sm">
                    {t('DEMO MODE — OTP displayed on screen')}
                </div>
            )}
        </header>
    );
}
