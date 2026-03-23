"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useKioskStore } from '@/store/useKioskStore';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { Power, Flame, Droplets, Trash2, FileText, UserCircle2, LogOut, ArrowRight } from 'lucide-react';
import { BackButton } from '@/components/kiosk/BackButton';

export function ServiceScreen() {
    const { setScreen, citizen, logout } = useKioskStore();
    const { t } = useDynamicTranslation();

    const services = [
        {
            id: 'electricity', title: 'Electricity', icon: <Power size={56} />, color: 'bg-[#F2C94C]', textColor: 'text-[#F2C94C]', 
            badges: ['Pay Bill', 'New Connection', 'Complaint']
        },
        {
            id: 'gas', title: 'Gas (PNG/LPG)', icon: <Flame size={56} />, color: 'bg-orange-500', textColor: 'text-orange-500',
            badges: ['Bill', 'Booking', 'Leak Report']
        },
        {
            id: 'water', title: 'Water', icon: <Droplets size={56} />, color: 'bg-blue-400', textColor: 'text-blue-400',
            badges: ['Bill', 'New Connection', 'Complaint']
        },
        {
            id: 'municipal', title: 'Municipal Services', icon: <Trash2 size={56} />, color: 'bg-green-500', textColor: 'text-green-500',
            badges: ['Waste Complaint', 'Schedule Pickup']
        },
        {
            id: 'documents', title: 'Documents', icon: <FileText size={56} />, color: 'bg-purple-400', textColor: 'text-purple-400',
            badges: ['Upload Form', 'Certificates']
        },
        {
            id: 'dashboard', title: 'My Dashboard', icon: <UserCircle2 size={56} />, color: 'bg-slate-300', textColor: 'text-slate-300',
            badges: ['Full Profile', 'Past Receipts']
        }
    ];

    const handleAction = (id: string) => {
        if (id === 'electricity' || id === 'water' || id === 'gas') {
            setScreen('BILL_PAYMENT');
        } else if (id === 'municipal') {
            setScreen('COMPLAINT');
        } else {
            // Unimplemented routes fallback
            setScreen('QUEUE');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col p-12 relative"
        >
            <BackButton onClick={() => setScreen('HOME')} variant="dark" />
            <div className="flex justify-between items-center mb-16 mt-8 px-4">
                <div>
                    <h1 className="text-6xl font-display font-bold text-white mb-2">
                        {citizen ? `नमस्ते ${citizen.name}` : t('Welcome Citizen')}
                    </h1>
                    <p className="text-3xl text-white/70">{t("What can we help you with today?")}</p>
                </div>
                {citizen && (
                    <button 
                        onClick={() => { logout(); setScreen('HOME'); }}
                        className="flex items-center gap-3 px-8 py-5 bg-white/10 hover:bg-danger/20 hover:text-danger rounded-full border border-white/20 text-2xl font-bold transition-all"
                    >
                        <LogOut size={32} /> {t("Logout")}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-8 w-full flex-1">
                {services.map((svc) => (
                    <motion.button
                        key={svc.id}
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAction(svc.id)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[32px] p-10 flex flex-col items-start text-left transition-all shadow-lg hover:shadow-2xl hover:border-white/30 backdrop-blur-md group relative"
                    >
                        <div className={`${svc.color} bg-opacity-20 p-5 rounded-2xl mb-8 ${svc.textColor} group-hover:scale-110 transition-transform`}>
                            {svc.icon}
                        </div>
                        <h2 className="text-5xl font-display font-bold text-white mb-8">{t(svc.title)}</h2>
                        
                        <div className="flex flex-wrap gap-3 mt-auto">
                            {svc.badges.map(badge => (
                                <span key={badge} className="px-5 py-2.5 bg-white/10 rounded-full text-lg font-medium text-white/90 border border-white/5">
                                    {t(badge)}
                                </span>
                            ))}
                        </div>
                        <div className="absolute right-10 bottom-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white text-black p-4 rounded-full">
                                <ArrowRight size={32} />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
