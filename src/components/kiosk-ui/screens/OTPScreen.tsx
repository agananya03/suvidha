"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '@/store/useKioskStore';
import { ArrowLeft, Delete, Smartphone, ScanFace } from 'lucide-react';

export function OTPScreen() {
    const { setScreen, setCitizen } = useKioskStore();
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(45);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleNumpad = (num: string) => {
        if (step === 1 && phone.length < 10) setPhone(p => p + num);
        if (step === 2 && otp.length < 6) setOtp(o => o + num);
    };

    const handleBackspace = () => {
        if (step === 1) setPhone(p => p.slice(0, -1));
        if (step === 2) setOtp(o => o.slice(0, -1));
    };

    const handleProceed = () => {
        if (step === 1 && phone.length === 10) {
            setStep(2);
        } else if (step === 2 && otp.length === 6) {
            setCitizen({ name: "Aarushi T.", phone: `+91 ${phone}` });
            setScreen('SERVICE');
        }
    };

    const formatPhone = (p: string) => {
        if (step === 2) return p.slice(0, 2) + '******' + p.slice(-2);
        return p.padEnd(10, ' ').split('').map(c => c === ' ' ? '_' : c).join('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="w-full h-full flex flex-col p-8 items-center"
        >
            <button onClick={() => step === 1 ? setScreen('HOME') : setStep(1)} className="absolute top-8 left-8 flex items-center gap-3 text-white/70 hover:text-white px-8 py-5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-3xl font-bold transition-all z-10">
                <ArrowLeft size={36} /> Back
            </button>

            <div className="flex-1 flex flex-col items-center mt-20 w-full max-w-4xl">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="w-full flex flex-col items-center"
                        >
                            <div className="bg-white/10 p-6 rounded-full mb-8 border border-white/20">
                                <Smartphone size={64} className="text-white" />
                            </div>
                            <h1 className="text-6xl font-display font-bold text-white mb-6">Login with Mobile</h1>
                            <p className="text-3xl text-white/70 font-medium mb-16">Enter your 10-digit mobile number</p>

                            <div className="flex items-center gap-6 bg-[#001f5c]/50 p-6 rounded-[24px] border border-blue-400/30 mb-16 shadow-inner min-w-[600px] justify-center">
                                <span className="text-5xl font-mono text-white/50 border-r border-white/20 pr-6">+91</span>
                                <span className="text-[56px] font-mono font-bold tracking-[0.3em] pl-4">{formatPhone(phone)}</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="w-full flex flex-col items-center"
                        >
                            <h1 className="text-6xl font-display font-bold text-white mb-6">Verify OTP</h1>
                            <p className="text-3xl text-white/70 font-medium mb-16">Sent securely to +91 {formatPhone(phone)}</p>

                            <div className="flex gap-4 mb-12">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-[110px] h-[140px] rounded-2xl flex items-center justify-center text-[72px] font-mono border-4 transition-all
                                            ${i === otp.length ? 'border-secondary bg-secondary/10 shadow-[0_0_30px_rgba(245,166,35,0.3)]' : 
                                              i < otp.length ? 'border-primary bg-primary/60 text-white' : 'border-white/10 bg-white/5 text-white/30'}`}
                                    >
                                        {otp[i] || ''}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-6 mb-16 px-8 py-4 bg-white/5 rounded-full border border-white/10">
                                <svg className="w-10 h-10 transform -rotate-90">
                                    <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                                    <circle cx="20" cy="20" r="18" stroke="var(--secondary)" strokeWidth="4" fill="none" strokeDasharray="113" strokeDashoffset={113 - (113 * timer) / 45} className="transition-all duration-1000 linear" />
                                </svg>
                                <span className="text-2xl font-medium text-white/80">
                                    {timer > 0 ? `Resend OTP in 00:${timer.toString().padStart(2, '0')}` : <button className="text-secondary hover:underline">Resend OTP Now</button>}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Common Numpad */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-[600px] bg-white/5 p-8 rounded-[40px] backdrop-blur-xl border border-white/10 shadow-2xl mt-auto mb-16">
                    {['1','2','3','4','5','6','7','8','9','Backspace','0','Submit'].map((key) => {
                        if (key === 'Backspace') {
                            return (
                                <button key={key} onClick={handleBackspace} className="h-[100px] bg-white/10 hover:bg-danger/80 active:scale-95 transition-all rounded-[24px] flex justify-center items-center text-white shadow-sm border border-white/10">
                                    <Delete size={48} />
                                </button>
                            );
                        }
                        if (key === 'Submit') {
                            const active = (step === 1 && phone.length === 10) || (step === 2 && otp.length === 6);
                            return (
                                <button 
                                    key={key} 
                                    onClick={handleProceed}
                                    disabled={!active}
                                    className={`h-[100px] text-2xl font-bold rounded-[24px] transition-all shadow-sm flex items-center justify-center
                                        ${active ? 'bg-secondary text-white hover:bg-[#E0900B] active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(245,166,35,0.4)]' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                                >
                                    Proceed
                                </button>
                            );
                        }
                        return (
                            <button 
                                key={key} 
                                onClick={() => handleNumpad(key)}
                                className="h-[100px] bg-white/10 hover:bg-white/20 active:bg-secondary active:scale-95 active:text-white transition-all rounded-[24px] text-[48px] font-bold text-white flex justify-center items-center font-mono border border-white/10 shadow-sm"
                            >
                                {key}
                            </button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
