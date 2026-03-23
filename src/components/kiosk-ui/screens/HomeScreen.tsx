"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useKioskStore } from '@/store/useKioskStore';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { Ticket, Smartphone, Zap, Eye, Volume2, Hand, UserRound, Activity } from 'lucide-react';

export function HomeScreen() {
    const { setScreen } = useKioskStore();
    const { t } = useDynamicTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex flex-col items-center justify-center p-12 text-center"
        >
            <div className="mb-20">
                <h1 className="text-7xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-xl">नमस्ते 🙏 Welcome to SUVIDHA</h1>
                <p className="text-3xl text-surface-deep font-medium bg-black/20 px-8 py-3 rounded-full inline-block backdrop-blur-sm border border-white/10">Choose how you'd like to begin</p>
            </div>

            <div className="grid grid-cols-1 gap-8 w-full max-w-4xl px-8 relative z-10">
                {/* Button 1 */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setScreen('TOKEN')}
                    className="flex items-center gap-8 bg-surface/10 backdrop-blur-xl border-4 border-secondary p-8 rounded-[20px] shadow-[0_0_40px_rgba(245,166,35,0.2)] group overflow-hidden relative min-h-[180px]"
                >
                    <div className="bg-secondary/20 p-6 rounded-2xl group-hover:bg-secondary/30 transition-colors">
                        <Ticket size={72} className="text-secondary" />
                    </div>
                    <div className="text-left flex-1 text-white">
                        <h2 className="text-5xl font-display font-bold mb-3">{t('Enter Token')}</h2>
                        <p className="text-2xl text-white/80">{t('Have a code from WhatsApp? Start here')}</p>
                    </div>
                </motion.button>

                {/* Button 2 */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setScreen('OTP')}
                    className="flex items-center gap-8 bg-surface/10 backdrop-blur-xl border-2 border-white/20 p-8 rounded-[20px] group overflow-hidden relative min-h-[180px] hover:border-white/40 hover:bg-surface/20 transition-all"
                >
                    <div className="bg-white/10 p-6 rounded-2xl group-hover:bg-white/20 transition-colors">
                        <Smartphone size={72} className="text-white" />
                    </div>
                    <div className="text-left flex-1 text-white">
                        <h2 className="text-5xl font-display font-bold mb-3">{t('Login with Mobile')}</h2>
                        <p className="text-2xl text-white/80">{t('New or returning citizen')}</p>
                    </div>
                </motion.button>

                {/* Button 3 */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setScreen('SERVICE')}
                    className="flex items-center gap-8 bg-surface/10 backdrop-blur-xl border-2 border-accent p-8 rounded-[20px] shadow-[0_0_30px_rgba(46,204,143,0.15)] group overflow-hidden relative min-h-[180px]"
                >
                    <div className="bg-accent/20 p-6 rounded-2xl group-hover:bg-accent/30 transition-colors">
                        <Zap size={72} className="text-accent" />
                    </div>
                    <div className="text-left flex-1 text-white">
                        <h2 className="text-5xl font-display font-bold mb-3">{t('Quick Pay')}</h2>
                        <p className="text-2xl text-white/80">{t('Pay a bill instantly, no login needed')}</p>
                    </div>
                </motion.button>
            </div>

            {/* Accessibility Strip */}
            <div className="mt-24 w-full flex justify-center gap-6">
                {[
                    { icon: <Eye size={32} />, label: t("High Contrast"), act: () => {} },
                    { icon: <Volume2 size={32} />, label: t("Voice Guide"), act: () => setScreen('ACCESSIBILITY') },
                    { icon: <Hand size={32} />, label: t("Sign Language"), act: () => setScreen('ACCESSIBILITY') },
                    { icon: <UserRound size={32} />, label: t("Senior Mode"), act: () => setScreen('ACCESSIBILITY') },
                    { icon: <Activity size={32} />, label: t("Wheelchair"), act: () => {} },
                ].map((item, idx) => (
                    <button key={idx} onClick={item.act} className="flex flex-col items-center gap-3 bg-white/5 hover:bg-white/15 border border-white/10 p-5 rounded-2xl text-white min-w-[150px] transition-all">
                        <div className="bg-white/10 p-4 rounded-full">{item.icon}</div>
                        <span className="text-xl font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
