'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';

const IDLE_MS = 60_000; // 60 seconds
const CARD_INTERVAL_MS = 3_000;

const FEATURE_CARDS = [
    { icon: '⚡', text: 'Pay your electricity bill in under 2 minutes' },
    { icon: '📋', text: 'File a complaint — get WhatsApp updates' },
    { icon: '📍', text: 'Check your live queue position' },
];

const QUEUE_STATUS = [
    { label: 'Electricity', status: 'LOW', color: 'bg-green-500' },
    { label: 'Gas', status: 'MEDIUM', color: 'bg-yellow-400' },
    { label: 'Municipal', status: 'LOW', color: 'bg-green-500' },
];

export function AttractLoop() {
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [currentCard, setCurrentCard] = useState(0);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (isVisible) return; // already showing — don't reset
        idleTimerRef.current = setTimeout(() => {
            if (pathname !== '/kiosk') setIsVisible(true);
        }, IDLE_MS);
    }, [isVisible, pathname]);

    // Attach interaction listeners
    useEffect(() => {
        const events = ['mousemove', 'mousedown', 'touchstart', 'keydown'] as const;
        events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
        resetTimer(); // start on mount
        return () => {
            events.forEach(e => window.removeEventListener(e, resetTimer));
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [resetTimer]);

    // Rotate cards while visible
    useEffect(() => {
        if (!isVisible) return;
        const iv = setInterval(() => {
            setCurrentCard(c => (c + 1) % FEATURE_CARDS.length);
        }, CARD_INTERVAL_MS);
        return () => clearInterval(iv);
    }, [isVisible]);

    // If pathname changes to /kiosk (e.g. user navigates home), hide
    useEffect(() => {
        if (pathname === '/kiosk') setIsVisible(false);
    }, [pathname]);

    const dismiss = () => {
        setIsVisible(false);
        router.push('/kiosk');
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-gradient-to-b from-[#003087] to-[#001a4d] flex flex-col items-center justify-between overflow-hidden cursor-pointer select-none"
            onClick={dismiss}
            onTouchStart={dismiss}
        >
            {/* ── TOP THIRD: rotating feature cards ── */}
            <div className="flex-1 flex items-center justify-center w-full px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCard}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center text-center max-w-xl"
                    >
                        <span className="text-8xl mb-6 leading-none">
                            {FEATURE_CARDS[currentCard].icon}
                        </span>
                        <p className="text-white font-bold text-3xl lg:text-4xl leading-snug">
                            {FEATURE_CARDS[currentCard].text}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── MIDDLE: live queue status strip ── */}
            <div className="flex flex-col items-center gap-3 pb-6">
                <p className="text-xs uppercase tracking-widest text-blue-400 font-bold">
                    Current Wait Times
                </p>
                <div className="flex gap-3">
                    {QUEUE_STATUS.map(q => (
                        <div
                            key={q.label}
                            className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5"
                        >
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${q.color}`} />
                            <span className="text-white text-sm font-semibold">{q.label}</span>
                            <span className="text-blue-300 text-xs font-bold">{q.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── BOTTOM: touch to start ── */}
            <div className="pb-12 flex flex-col items-center gap-3">
                <div className="animate-pulse">
                    <p className="text-white text-2xl font-bold text-center">
                        👆 Touch Anywhere to Start
                    </p>
                </div>
                <p className="text-blue-400 text-sm text-center">
                    8:00 AM – 8:00 PM · Monday to Saturday
                </p>
            </div>
        </div>
    );
}
