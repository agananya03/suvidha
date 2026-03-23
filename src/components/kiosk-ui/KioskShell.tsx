"use client";

import React, { useEffect, useState } from 'react';
import { useKioskStore } from '@/store/useKioskStore';
import { Accessibility, Volume2, Users, Activity } from 'lucide-react';

export function KioskShell({ children }: { children: React.ReactNode }) {
    const { language, setLanguage, sessionTimer, setSessionTimer, accessibilityMode } = useKioskStore();
    const [time, setTime] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const languages = [
        { code: 'en', label: 'EN' },
        { code: 'hi', label: 'हिं' },
        { code: 'mr', label: 'मराठी' },
        { code: 'ta', label: 'தமிழ்' },
        { code: 'te', label: 'తెలుగు' },
        { code: 'bn', label: 'বাংলা' },
    ];

    // Hydration safe time rendering trick (only render formatted time after mount)
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div className="w-full h-screen flex items-center justify-center bg-black">
            <div className="kiosk-root shadow-2xl overflow-hidden ring-4 ring-zinc-800">
                {/* PERSISTENT HEADER */}
                <header className="h-[120px] bg-white/10 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 text-white z-50 shrink-0">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span className="text-5xl font-display font-bold text-secondary">SUVIDHA</span>
                            <span className="bg-primary px-4 py-1.5 rounded-full text-sm font-bold tracking-widest border border-white/20">2026</span>
                        </div>
                        <span className="text-xl font-medium text-white/80">सुविधा — आपकी सेवा में</span>
                    </div>

                    <div className="flex flex-col items-center">
                        {mounted && (
                            <>
                                <span className="text-4xl font-mono font-bold tracking-wider">{time.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                <span className="text-xl text-secondary font-medium tracking-wide">{time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {languages.map((l) => (
                            <button
                                key={l.code}
                                onClick={() => setLanguage(l.code)}
                                className={`h-[68px] w-[68px] rounded-full text-2xl font-bold transition-all duration-200 border-[3px] shadow-lg ${language === l.code ? 'bg-secondary text-white border-secondary scale-110' : 'bg-surface/10 text-white border-white/20 hover:bg-surface/20'}`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="flex-1 relative overflow-hidden">
                    {children}
                </div>

                {/* BOTTOM SCROLLING STRIP */}
                <footer className="h-16 bg-primary text-white flex items-center overflow-hidden px-4 border-t border-white/10 shrink-0 z-50">
                    <div className="flex animate-marquee gap-16 font-medium text-2xl tracking-wide min-w-full">
                        <span className="flex items-center gap-3 whitespace-nowrap"><Activity size={28} className="text-accent" /> Wheelchair Mode Available</span>
                        <span className="flex items-center gap-3 whitespace-nowrap"><Volume2 size={28} className="text-secondary" /> Voice Guide: {accessibilityMode === 'voice' ? 'ON' : 'Available'}</span>
                        <span className="flex items-center gap-3 whitespace-nowrap"><Users size={28} className="text-blue-300" /> Queue: 12 people waiting</span>
                        <span className="flex items-center gap-3 whitespace-nowrap"><Accessibility size={28} className="text-purple-300" /> Need Help? See nearest associate</span>
                        {/* Repeat for continuous effect */}
                        <span className="flex items-center gap-3 whitespace-nowrap"><Activity size={28} className="text-accent" /> Wheelchair Mode Available</span>
                        <span className="flex items-center gap-3 whitespace-nowrap"><Volume2 size={28} className="text-secondary" /> Voice Guide: {accessibilityMode === 'voice' ? 'ON' : 'Available'}</span>
                        <span className="flex items-center gap-3 whitespace-nowrap"><Users size={28} className="text-blue-300" /> Queue: 12 people waiting</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
