"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Check, X, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ConsentModal() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const consent = localStorage.getItem('suvidha_dpdp_consent');
        if (!consent) {
            setIsOpen(true);
        }
    }, []);

    const handleConsent = (agreed: boolean) => {
        if (agreed) {
            localStorage.setItem('suvidha_dpdp_consent', 'accepted');
            setIsOpen(false);
        } else {
            localStorage.setItem('suvidha_dpdp_consent', 'declined');
            router.push('/kiosk/overview');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-[var(--radius-xl)] shadow-lg max-w-2xl w-full relative overflow-hidden flex flex-col"
                    >
                        {/* Navy Header */}
                        <div className="bg-[var(--irs-navy)] text-white p-6 pb-8 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <ShieldCheck className="w-8 h-8 text-[var(--irs-blue-mid)]" />
                            </div>
                            <h2 className="text-[var(--font-2xl)] font-bold mb-1">Data Privacy Consent</h2>
                            <p className="text-[var(--font-xs)] uppercase tracking-widest font-bold opacity-80">DPDP Act 2023 Compliance</p>
                        </div>

                        {/* Content Body */}
                        <div className="p-8 pb-10 flex flex-col items-center text-center -mt-6">
                            
                            {/* Blue Pale Terms Block */}
                            <div className="bg-[var(--irs-blue-pale)] p-6 rounded-[var(--radius-lg)] border border-[var(--irs-blue-light)] w-full mb-8 text-left shadow-sm">
                                <div className="flex gap-4">
                                    <Info className="w-6 h-6 text-[var(--irs-blue-mid)] shrink-0 mt-1" />
                                    <div className="text-[var(--irs-gray-800)] text-[var(--font-md)] space-y-3 leading-relaxed">
                                        <p>
                                            <strong className="text-[var(--irs-navy)]">SUVIDHA collects:</strong> mobile number, address, and payment records for verification purposes.
                                        </p>
                                        <p>
                                            All personal data is <strong>encrypted securely</strong>, automatically deleted after 48-hours for documents, and never shared with third parties without your explicit consent.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[var(--font-lg)] font-bold text-[var(--irs-navy)] text-center mb-6">
                                Do you consent to these terms?
                            </p>

                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => handleConsent(false)}
                                    className="btn-secondary flex-1 flex items-center justify-center gap-2 h-[64px] text-[var(--font-lg)]"
                                >
                                    <X className="w-6 h-6" /> Decline
                                </button>
                                <button
                                    onClick={() => handleConsent(true)}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2 h-[64px] text-[var(--font-lg)]"
                                >
                                    <Check className="w-6 h-6" /> Accept & Continue
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
