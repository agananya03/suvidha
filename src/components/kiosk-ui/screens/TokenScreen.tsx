"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKioskStore } from '@/store/useKioskStore';
import { ArrowLeft, Delete, FileText, ArrowRight } from 'lucide-react';

export function TokenScreen() {
    const { setScreen, setCurrentToken, setCitizen } = useKioskStore();
    const [token, setToken] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [isValid, setIsValid] = useState(false);

    const handleKeyPress = (key: string) => {
        if (token.length < 6) {
            setToken(prev => prev + key);
        }
    };

    const handleBackspace = () => {
        setToken(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setToken('');
    };

    useEffect(() => {
        if (token.length === 6 && !isValid) {
            setIsValidating(true);
            setTimeout(() => {
                setIsValidating(false);
                setIsValid(true);
            }, 1000);
        } else if (token.length < 6) {
            setIsValidating(false);
            setIsValid(false);
        }
    }, [token, isValid]);

    const handleProceed = () => {
        setCurrentToken(token);
        setCitizen({ name: "Rajesh K." });
        setScreen('BILL_PAYMENT');
    };

    const keys = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full h-full flex flex-col p-8"
        >
            <button onClick={() => setScreen('HOME')} className="absolute top-8 left-8 flex items-center gap-3 text-white/70 hover:text-white px-8 py-5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-3xl font-bold transition-all z-10">
                <ArrowLeft size={36} /> Back
            </button>

            <div className="flex-1 flex flex-col items-center mt-32">
                <h1 className="text-6xl font-display font-bold text-white mb-6">Enter your Secure Token</h1>
                <p className="text-3xl text-white/70 font-medium mb-16">6-character code sent via WhatsApp</p>

                {/* Token Display Boxes */}
                <div className="flex gap-6 mb-16">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-[130px] h-[160px] rounded-3xl flex items-center justify-center text-[80px] font-mono border-4 transition-all
                                ${i === token.length ? 'border-secondary bg-secondary/10 shadow-[0_0_40px_rgba(245,166,35,0.3)]' : 
                                  i < token.length ? 'border-primary bg-primary/60 text-white' : 'border-white/10 bg-white/5 text-white/30'}`}
                        >
                            {token[i] || ''}
                        </div>
                    ))}
                </div>

                <AnimatePresence>
                    {isValidating && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-3xl font-bold text-secondary animate-pulse mb-8">
                            Validating Token System...
                        </motion.div>
                    )}

                    {isValid && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            className="w-full max-w-3xl bg-[#001f5c]/80 border-2 border-accent rounded-[32px] p-10 mt-8 backdrop-blur-xl shadow-2xl"
                        >
                            <div className="flex items-center gap-8 mb-10">
                                <div className="bg-accent/20 p-6 rounded-full text-accent border border-accent/30">
                                    <FileText size={64} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-2xl text-white/60 mb-2 font-medium">Citizen Record</p>
                                    <h3 className="text-5xl font-bold text-white">Rajesh K.</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl text-white/60 mb-2 font-medium">Service Attached</p>
                                    <h3 className="text-3xl font-bold text-white">Electricity Bill</h3>
                                </div>
                            </div>
                            <button 
                                onClick={handleProceed}
                                className="w-full py-8 bg-accent hover:bg-accent/90 text-black text-4xl font-bold rounded-2xl flex justify-center items-center gap-4 transition-all active:scale-95 shadow-[0_0_40px_rgba(46,204,143,0.4)]"
                            >
                                Proceed <ArrowRight size={44} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Virtual Keyboard */}
                {!isValid && !isValidating && (
                    <div className="w-full max-w-[1000px] bg-white/5 p-8 rounded-[40px] backdrop-blur-3xl border border-white/10 mt-auto mb-16 shadow-2xl">
                        <div className="flex flex-col gap-4">
                            {keys.map((row, rowIdx) => (
                                <div key={rowIdx} className={`flex justify-center gap-4 ${rowIdx === 2 || rowIdx === 3 ? 'mx-8' : ''}`}>
                                    {row.map(key => (
                                        <button
                                            key={key}
                                            onClick={() => handleKeyPress(key)}
                                            className="w-[85px] h-[95px] bg-white/10 hover:bg-white/20 active:bg-secondary active:scale-90 transition-all rounded-2xl text-[44px] font-bold text-white flex items-center justify-center font-mono border border-white/10 shadow-sm"
                                        >
                                            {key}
                                        </button>
                                    ))}
                                    {rowIdx === 2 && (
                                        <button onClick={handleBackspace} className="flex-1 h-[95px] bg-white/10 hover:bg-danger/80 active:scale-90 transition-all rounded-2xl text-white flex items-center justify-center border border-white/10 ml-4 shadow-sm">
                                            <Delete size={48} />
                                        </button>
                                    )}
                                    {rowIdx === 3 && (
                                        <button onClick={handleClear} className="flex-1 h-[95px] bg-white/10 hover:bg-white/20 active:scale-90 transition-all rounded-2xl text-white flex items-center justify-center border border-white/10 ml-4 text-3xl font-bold shadow-sm px-6">
                                            CLEAR
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
