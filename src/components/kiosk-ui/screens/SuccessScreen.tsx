"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useKioskStore } from '@/store/useKioskStore';
import { CheckCircle2, Printer, Smartphone, Home } from 'lucide-react';

export function SuccessScreen() {
    const { setScreen, citizen } = useKioskStore();
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) {
                    clearInterval(timer);
                    setScreen('HOME');
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [setScreen]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            className="w-full h-full flex flex-col items-center justify-center p-12 text-center"
        >
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                className="bg-accent/20 p-10 rounded-full mb-12 text-accent shadow-[0_0_120px_rgba(46,204,143,0.4)] border-4 border-accent/30"
            >
                <CheckCircle2 size={160} strokeWidth={3} />
            </motion.div>

            <h1 className="text-7xl font-display font-bold text-white mb-6 drop-shadow-lg">Payment Successful!</h1>
            <p className="text-4xl text-white/80 font-medium mb-16">Thank you, {citizen?.name || 'Citizen'}.</p>

            <div className="w-full max-w-3xl bg-white/10 border border-white/20 p-12 rounded-[40px] backdrop-blur-2xl shadow-2xl mb-20">
                <div className="flex justify-between items-center border-b border-white/10 pb-8 mb-8">
                    <span className="text-3xl text-white/70">Amount Paid</span>
                    <span className="text-6xl text-white font-mono font-bold tracking-tight">₹ 847.50</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-8 mb-8">
                    <span className="text-3xl text-white/70">Transaction ID</span>
                    <span className="text-3xl text-white font-mono tracking-widest bg-black/20 px-4 py-2 rounded-lg">TRX-982374-PUN</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-3xl text-white/70">Date & Time</span>
                    <span className="text-3xl text-white font-medium">{new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
            </div>

            <div className="flex gap-10 mb-20">
                <button className="flex flex-col items-center gap-6 bg-surface-deep/10 hover:bg-surface-deep/20 active:scale-95 transition-all p-10 rounded-[32px] border border-white/20 min-w-[320px] shadow-lg group">
                    <div className="bg-white/10 p-8 rounded-full group-hover:bg-white/20 transition-colors"><Printer size={64} className="text-white" /></div>
                    <span className="text-3xl font-bold text-white">Print Receipt</span>
                </button>
                <button className="flex flex-col items-center gap-6 bg-surface-deep/10 hover:bg-surface-deep/20 active:scale-95 transition-all p-10 rounded-[32px] border border-white/20 min-w-[320px] shadow-lg group">
                    <div className="bg-white/10 p-8 rounded-full group-hover:bg-white/20 transition-colors"><Smartphone size={64} className="text-white" /></div>
                    <span className="text-3xl font-bold text-white">Send to Mobile</span>
                </button>
            </div>

            <div className="mt-auto w-full max-w-2xl flex gap-6 items-center flex-col">
                <div className="w-full bg-black/30 rounded-full h-4 mb-2 overflow-hidden border border-white/10 relative">
                    <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 30, ease: "linear" }}
                        className="absolute left-0 top-0 bottom-0 bg-secondary"
                    />
                </div>
                <p className="text-2xl text-white/60 font-medium">Session ends automatically in 00:{countdown.toString().padStart(2, '0')}</p>
                
                <button 
                    onClick={() => setScreen('HOME')}
                    className="mt-8 flex items-center gap-4 px-16 py-6 bg-white/10 hover:bg-white/20 rounded-full text-white text-3xl font-bold transition-all border border-white/20 shadow-lg"
                >
                    <Home size={40} /> Start New Transaction
                </button>
            </div>
        </motion.div>
    );
}
