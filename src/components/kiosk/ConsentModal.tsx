"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ConsentModal() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check local storage to see if consent was already given/declined
        const consent = localStorage.getItem('suvidha_dpdp_consent');
        if (!consent) {
            // Show modal if no consent record exists
            setIsOpen(true);
        }
    }, []);

    const handleConsent = (agreed: boolean) => {
        if (agreed) {
            localStorage.setItem('suvidha_dpdp_consent', 'accepted');
            setIsOpen(false);
        } else {
            localStorage.setItem('suvidha_dpdp_consent', 'declined');
            // Redirect or show alternative message
            router.push('/kiosk/counter-service');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-[#001f5c] border-2 border-blue-400/50 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative overflow-hidden"
                    >
                        {/* Interactive Background Elements */}
                        <div className="absolute top-0 right-0 p-12 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="bg-blue-900/50 p-4 rounded-full mb-6 border border-blue-400/30">
                                <ShieldAlert size={48} className="text-[#FF9933]" />
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">Data Privacy Consent</h2>
                            <p className="text-blue-300 mb-6 font-medium tracking-wide text-sm uppercase">DPDP Act 2023 Compliance</p>

                            <div className="bg-blue-950/50 p-6 rounded-xl border border-blue-800/50 mb-8 text-left w-full shadow-inner">
                                <p className="text-lg text-blue-100 leading-relaxed mb-4">
                                    <strong className="text-white">SUVIDHA collects:</strong> mobile number, address, and payment records.
                                </p>
                                <p className="text-lg text-blue-100 leading-relaxed mb-4">
                                    Data is <strong className="text-emerald-400">encrypted</strong>, auto-deleted after 48-hours for documents, and never shared without consent.
                                </p>
                                <p className="text-xl font-bold text-white text-center mt-6">
                                    Do you consent?
                                </p>
                            </div>

                            <div className="flex gap-6 w-full mt-2">
                                <button
                                    onClick={() => handleConsent(false)}
                                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-red-500/50 text-red-100 font-bold text-xl transition-all hover:bg-red-500/20 active:scale-95"
                                >
                                    <X size={24} /> NO
                                </button>
                                <button
                                    onClick={() => handleConsent(true)}
                                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95"
                                >
                                    <Check size={24} /> YES
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
