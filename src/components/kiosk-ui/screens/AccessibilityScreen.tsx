"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useKioskStore } from '@/store/useKioskStore';
import { UserRound, Volume2, Hand, ALargeSmall, CheckCircle2 } from 'lucide-react';

export function AccessibilityScreen() {
    const { accessibilityMode, setAccessibilityMode, setScreen } = useKioskStore();

    const modes = [
        {
            id: 'standard', title: 'Standard Mode', desc: 'Default layout and touch experience.', icon: <UserRound size={80} />
        },
        {
            id: 'simplified', title: 'Senior Mode', desc: '150% font size, maximum contrast, simplified navigation.', icon: <ALargeSmall size={80} />
        },
        {
            id: 'voice', title: 'Voice-Guided Mode', desc: 'Audio prompts for every action, visual waveform indicator.', icon: <Volume2 size={80} />
        },
        {
            id: 'visual', title: 'Sign Language Mode', desc: 'ISL video overlay in corner, slower transitions.', icon: <Hand size={80} />
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            className="absolute inset-0 z-50 flex items-center justify-center p-12 bg-kiosk-bg/90 backdrop-blur-3xl"
        >
            <div className="w-full max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-6xl font-display font-bold text-white mb-6 drop-shadow-lg">Choose Accessibility Mode</h2>
                    <p className="text-3xl text-white/80 font-medium">Select the experience that works best for you</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {modes.map((mode) => {
                        const isActive = accessibilityMode === mode.id;
                        return (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={mode.id}
                                onClick={() => {
                                    setAccessibilityMode(mode.id as any);
                                    setTimeout(() => setScreen('HOME'), 600);
                                }}
                                className={`flex flex-col items-center text-center p-12 rounded-[24px] border-4 transition-all relative overflow-hidden min-h-[360px] justify-center ${
                                    isActive 
                                        ? 'border-secondary bg-surface/10 shadow-[0_0_50px_rgba(245,166,35,0.2)]'
                                        : 'border-white/10 bg-surface/5 hover:bg-surface/10'
                                }`}
                            >
                                {isActive && (
                                    <div className="absolute top-6 right-6 text-secondary bg-black/30 rounded-full">
                                        <CheckCircle2 size={56} fill="currentColor" className="text-white" />
                                    </div>
                                )}
                                <div className={`p-6 rounded-full mb-8 ${isActive ? 'bg-secondary/20 text-secondary' : 'bg-white/10 text-white'}`}>
                                    {mode.icon}
                                </div>
                                <h3 className={`text-4xl font-display font-bold mb-4 ${isActive ? 'text-secondary' : 'text-white'}`}>{mode.title}</h3>
                                <p className="text-2xl text-white/70 leading-relaxed font-medium">{mode.desc}</p>
                            </motion.button>
                        );
                    })}
                </div>
                
                <div className="mt-20 flex justify-center">
                    <button 
                        onClick={() => setScreen('HOME')}
                        className="px-16 py-6 rounded-full border-2 border-white/20 text-white text-3xl font-bold hover:bg-white/10 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
