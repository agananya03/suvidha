"use client";

import React, { useEffect, useState } from 'react';
import { useKioskStore } from '@/store/useKioskStore';

export function KioskHeader() {
    const { isAuthenticated, sessionStartTime } = useKioskStore();
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
        <header className="w-full flex flex-col z-30 relative shrink-0">
            <div className="bg-[#003087] text-white w-full flex items-center justify-between px-6 py-4 shadow-md">

                {/* Left Side: SVG + Gov Text */}
                <div className="flex items-center gap-4">
                    <div className="bg-white p-1 rounded-full flex items-center justify-center w-16 h-16">
                        <svg viewBox="0 0 100 100" className="w-14 h-14 text-[#003087]">
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
                        <span className="text-2xl font-bold tracking-wide">Government of India</span>
                        <span className="text-lg text-blue-200">Ministry of Electronics & IT</span>
                    </div>
                </div>

                {/* Center Side: SUVIDHA 2026 */}
                <div className="flex flex-col items-center">
                    <h1 className="text-5xl font-extrabold tracking-tight">SUVIDHA <span className="text-[#FF9933]">2026</span></h1>
                    <span className="text-base font-medium text-blue-100 tracking-wider">Smart Urban Virtual Interface for Digital Helpdesk</span>
                </div>

                {/* Right Side: Timer, CDAC, Tricolor */}
                <div className="flex items-center gap-8">
                    {isAuthenticated && timeLeft && (
                        <div className="flex flex-col items-end">
                            <span className="text-sm text-blue-200 uppercase tracking-widest">Session Expires</span>
                            <span className="text-2xl font-mono font-bold text-red-100 bg-black/30 px-3 py-1 rounded">
                                {timeLeft}
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col items-end">
                        <span className="text-3xl font-bold tracking-widest text-[#FFF]">C-DAC</span>
                    </div>

                    <div className="flex flex-col h-20 w-4 rounded overflow-hidden shadow-sm">
                        <div className="flex-1 bg-[#FF9933]"></div>
                        <div className="flex-1 bg-white"></div>
                        <div className="flex-1 bg-[#138808]"></div>
                    </div>
                </div>

            </div>

            {isDemoMode && (
                <div className="w-full bg-[#FF9933] text-black font-bold text-center py-2 text-base md:text-lg uppercase tracking-widest shadow-inner border-y border-orange-600/50">
                    DEMO MODE — OTP displayed on screen for demonstration purposes
                </div>
            )}
        </header>
    );
}
