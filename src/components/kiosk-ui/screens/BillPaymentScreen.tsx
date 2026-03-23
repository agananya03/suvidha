"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '@/store/useKioskStore';
import { ArrowLeft, Building2, FileText, CheckCircle2 } from 'lucide-react';

const InfoIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;

export function BillPaymentScreen() {
    const { setScreen, citizen } = useKioskStore();
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePay = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setScreen('SUCCESS');
        }, 3000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full h-full flex flex-col p-12"
        >
            <div className="flex justify-between items-center mb-12">
                <button onClick={() => setScreen('SERVICE')} className="flex items-center gap-3 text-white/70 hover:text-white px-8 py-4 bg-white/5 rounded-full border border-white/10 text-2xl font-bold transition-all hover:bg-white/10">
                    <ArrowLeft size={32} /> Back
                </button>

                {/* Stepper */}
                <div className="flex gap-4">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-4 w-32 rounded-full transition-colors ${s <= step ? 'bg-secondary shadow-[0_0_15px_rgba(245,166,35,0.5)]' : 'bg-white/10'}`} />
                    ))}
                </div>
            </div>

            <h1 className="text-6xl font-display font-bold text-white mb-12 drop-shadow-md">Pay Electricity Bill</h1>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1">
                        <div className="w-full max-w-4xl bg-surface/10 border border-white/20 p-10 rounded-[32px] backdrop-blur-md mb-8 shadow-xl">
                            <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
                                <div className="bg-secondary/20 p-6 rounded-2xl text-secondary">
                                    <Building2 size={64} />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-bold text-white leading-tight">Maharashtra State Electricity<br/>Distribution Co. Ltd.</h3>
                                    <p className="text-2xl text-white/70 mt-3 font-medium">MSEDCL - Mahavitaran</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-10">
                                <div>
                                    <p className="text-white/60 text-xl font-medium mb-3">Consumer Name</p>
                                    <p className="text-3xl text-white font-bold">{citizen?.name || 'Rajesh K.'}</p>
                                </div>
                                <div>
                                    <p className="text-white/60 text-xl font-medium mb-3">Consumer Number</p>
                                    <p className="text-3xl text-primary font-mono font-bold bg-white/90 px-4 py-2 rounded-lg inline-block">170308000456</p>
                                </div>
                                <div>
                                    <p className="text-white/60 text-xl font-medium mb-3">Billing Unit</p>
                                    <p className="text-2xl text-white font-bold tracking-wide">4172 (PUNE RURAL)</p>
                                </div>
                                <div>
                                    <p className="text-white/60 text-xl font-medium mb-3">Bill Month</p>
                                    <p className="text-2xl text-white font-bold bg-white/10 w-fit px-5 py-2 rounded-md border border-white/10">MAR 2026</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setStep(2)} className="mt-auto px-12 py-8 bg-white text-black text-4xl font-bold rounded-[24px] hover:bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition-transform active:scale-95 text-center">
                            Fetch Bill Details
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col flex-1">
                        <div className="w-full max-w-4xl bg-[#001f5c]/60 border-2 border-secondary/50 p-10 rounded-[32px] backdrop-blur-xl mb-8 shadow-2xl">
                            <div className="flex justify-between items-start mb-10">
                                <h3 className="text-4xl font-bold text-white flex items-center gap-4">
                                    <div className="bg-secondary/20 p-4 rounded-full text-secondary">
                                        <FileText size={48} />
                                    </div>
                                    Bill Breakdown
                                </h3>
                                <div className="text-right">
                                    <p className="text-white/60 text-xl font-medium mb-2">Due Date</p>
                                    <p className="text-3xl text-danger font-bold bg-danger/10 border border-danger/30 px-5 py-2 rounded-xl">25 Mar 2026</p>
                                </div>
                            </div>

                            <div className="space-y-6 mb-10 text-3xl font-medium">
                                <div className="flex justify-between text-white border-b border-white/10 pb-6 opacity-90">
                                    <span>Base Energy Charges</span>
                                    <span>₹ 650.00</span>
                                </div>
                                <div className="flex justify-between text-white border-b border-white/10 pb-6 opacity-90">
                                    <span>Fixed Charges</span>
                                    <span>₹ 110.50</span>
                                </div>
                                <div className="flex justify-between text-white border-b border-white/10 pb-6 opacity-90">
                                    <span>Taxes & Duties</span>
                                    <span>₹ 87.00</span>
                                </div>
                                <div className="flex justify-between text-white pb-6 opacity-90">
                                    <span>Previous Arrears</span>
                                    <span className="text-secondary">₹ 0.00</span>
                                </div>
                            </div>

                            <div className="bg-secondary/15 p-8 rounded-3xl border-2 border-secondary/40 flex justify-between items-center text-secondary shadow-inner">
                                <span className="text-4xl font-bold">Total Amount Due</span>
                                <span className="text-6xl font-mono font-bold tracking-tight">₹ 847.50</span>
                            </div>
                        </div>
                        <button onClick={() => setStep(3)} className="mt-auto px-12 py-8 bg-secondary hover:bg-[#e69819] text-white text-4xl font-bold rounded-[24px] shadow-[0_0_40px_rgba(245,166,35,0.4)] transition-transform active:scale-95 text-center">
                            Confirm & Proceed to Pay
                        </button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 items-center justify-center">
                        <div className="bg-white rounded-[40px] p-12 text-center w-full max-w-3xl shadow-2xl relative overflow-hidden">
                            {isProcessing ? (
                                <div className="flex flex-col items-center justify-center h-[520px]">
                                    <div className="w-40 h-40 border-8 border-surface-deep border-t-accent rounded-full animate-spin mb-10"></div>
                                    <h3 className="text-5xl font-bold text-dark mb-6">Processing Payment</h3>
                                    <p className="text-3xl text-text-muted">Please do not close this screen or press back.</p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-5xl font-bold text-dark mb-6 drop-shadow-sm">Scan to Pay via UPI</h3>
                                    <div className="text-7xl font-mono font-bold text-secondary mb-12 tracking-tighter">₹ 847.50</div>
                                    
                                    <div className="bg-surface/50 p-6 border-4 border-dashed border-gray-300 rounded-[40px] inline-block mb-12">
                                        <div className="w-[320px] h-[320px] bg-black rounded-3xl flex items-center justify-center shadow-inner relative">
                                            {/* Simulated QR Code for Design */}
                                            <div className="w-[300px] h-[300px] bg-white opacity-90 p-2 grid grid-cols-5 grid-rows-5 gap-1 rounded-xl">
                                                <div className="col-span-2 row-span-2 bg-black border-[6px] border-white rounded-md"></div>
                                                <div className="bg-black rounded-sm"></div><div className="bg-black rounded-sm"></div><div className="bg-black rounded-sm"></div>
                                                <div className="bg-black rounded-sm"></div><div className="bg-black rounded-sm"></div><div className="bg-black rounded-sm"></div>
                                                <div className="col-span-2 row-span-2 bg-black border-[6px] border-white rounded-md"></div>
                                                <div className="col-span-2 row-span-2 bg-black border-[6px] border-white rounded-md"></div>
                                                <div className="bg-black rounded-sm"></div><div className="bg-black rounded-sm"></div>
                                                <div className="bg-black rounded-sm"></div><div className="bg-black rounded-sm"></div><div className="bg-black rounded-sm"></div>
                                            </div>
                                            <div className="absolute inset-x-0 top-0 h-2 bg-accent/80 shadow-[0_0_20px_var(--accent)] animate-[bounce_3s_infinite] rounded-full blur-[1px]"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-6 mb-12">
                                        <div className="h-0.5 bg-gray-300 w-32"></div>
                                        <span className="text-2xl text-text-muted font-bold min-w-max">OR ENTER UPI ID</span>
                                        <div className="h-0.5 bg-gray-300 w-32"></div>
                                    </div>
                                    
                                    <div className="flex bg-surface-deep/50 rounded-2xl border-2 border-gray-300 focus-within:border-secondary transition-colors overflow-hidden mx-auto max-w-2xl mb-12">
                                        <input type="text" placeholder="username@upi" className="w-full bg-transparent text-3xl p-6 outline-none font-medium text-dark min-w-0" />
                                        <button className="bg-dark hover:bg-black text-white px-10 font-bold text-2xl my-2 mr-2 rounded-xl transition-colors">Request</button>
                                    </div>

                                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center border-4 border-dashed border-secondary m-4 rounded-[36px]">
                                        <p className="text-3xl font-bold bg-white text-dark p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
                                            <InfoIcon /> Click "Simulate Payment" Below
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {!isProcessing && (
                            <button onClick={handlePay} className="mt-12 px-16 py-8 bg-accent text-black text-4xl font-bold rounded-full hover:bg-accent/90 shadow-[0_0_40px_rgba(46,204,143,0.4)] transition-transform active:scale-95 text-center flex items-center gap-4 z-20">
                                <CheckCircle2 size={44} /> Simulate Payment Success
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
