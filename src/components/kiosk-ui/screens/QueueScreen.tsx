"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useKioskStore } from '@/store/useKioskStore';
import { Users, X } from 'lucide-react';

export function QueueScreen() {
    const { setScreen } = useKioskStore();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 50 }}
            className="w-full h-full flex flex-col items-center justify-center p-12 text-center relative"
        >
            <div className="w-full max-w-3xl bg-surface/10 border border-white/10 p-16 rounded-[60px] backdrop-blur-3xl shadow-2xl relative">
                <button 
                    onClick={() => setScreen('HOME')} 
                    className="absolute top-10 right-10 text-white/50 hover:text-white bg-white/5 p-4 rounded-full transition-colors border border-white/10 hover:bg-danger/80"
                >
                    <X size={40} />
                </button>

                <div className="bg-primary/50 w-40 h-40 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-white/20 shadow-inner">
                    <Users size={80} className="text-white" />
                </div>

                <h2 className="text-5xl font-display font-medium text-white/90 mb-4">You are currently</h2>
                <div className="text-[140px] leading-tight font-display font-bold text-secondary mb-6 drop-shadow-[0_0_30px_rgba(245,166,35,0.4)]">
                    #4
                </div>
                <h2 className="text-5xl font-display font-medium text-white/90 mb-16">in the queue</h2>

                <div className="flex items-center justify-center gap-6 bg-black/40 p-8 rounded-[32px] border border-white/5 mb-16">
                    <span className="text-3xl text-white/70">Estimated Wait Time:</span>
                    <span className="text-4xl text-white font-bold ml-2">~12 minutes</span>
                </div>

                {/* Animated Queue Line */}
                <div className="flex justify-center gap-6 mt-8">
                    {[1, 2, 3, 4, 5].map((pos) => (
                        <div key={pos} className="flex flex-col items-center gap-4">
                            <motion.div 
                                animate={pos === 4 ? { y: [-8, 8, -8] } : {}}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-colors
                                    ${pos < 4 ? 'bg-primary border-primary text-white/50' : 
                                      pos === 4 ? 'bg-secondary border-secondary text-white shadow-[0_0_30px_var(--secondary)] scale-110' : 
                                      'bg-white/5 border-white/20 text-white/30'}`}
                            >
                                <Users size={36} />
                            </motion.div>
                            <span className={`text-2xl font-bold ${pos === 4 ? 'text-secondary' : 'text-white/30'}`}>
                                {pos === 4 ? 'YOU' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-16 w-full max-w-3xl bg-blue-900/60 p-10 rounded-[32px] border border-blue-400/30 text-left flex gap-8 items-center shadow-2xl backdrop-blur-sm">
                <div className="bg-blue-500/20 p-6 rounded-full text-blue-300 relative">
                    <div className="absolute inset-0 rounded-full animate-ping bg-blue-400/20" />
                    <div className="w-6 h-6 rounded-full bg-blue-400" />
                </div>
                <div>
                    <h4 className="text-3xl font-display font-bold text-blue-100 mb-3 tracking-wide">Did you know?</h4>
                    <p className="text-2xl text-blue-200/80 leading-relaxed font-medium">You can pay most bills from home via the SUVIDHA mobile app without waiting in line.</p>
                </div>
            </div>
        </motion.div>
    );
}
