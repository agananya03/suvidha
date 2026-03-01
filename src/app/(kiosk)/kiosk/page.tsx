"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useKioskStore, AccessibilityMode } from '@/store/useKioskStore';
import { Ear, Eye, ALargeSmall, UserRound } from 'lucide-react';
import { ConsentModal } from '@/components/kiosk/ConsentModal';

type Step = 'ACCESSIBILITY' | 'LANGUAGE';

const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
    { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
    { code: 'ks', name: 'Kashmiri', native: 'कश्मीरी' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली' },
    { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
    { code: 'doi', name: 'Dogri', native: 'डोगरी' },
    { code: 'mai', name: 'Maithili', native: 'मैथिली' },
];

export default function KioskHome() {
    const router = useRouter();
    const { setAccessibilityMode, setLanguage } = useKioskStore();

    const [currentStep, setCurrentStep] = useState<Step>('ACCESSIBILITY');
    const [selectedAccMode, setSelectedAccMode] = useState<AccessibilityMode | null>(null);

    const handleAccessibilitySelect = (mode: AccessibilityMode) => {
        setSelectedAccMode(mode);
        setAccessibilityMode(mode);

        // Auto-advance after 300ms for visual feedback
        setTimeout(() => {
            setCurrentStep('LANGUAGE');
        }, 300);
    };

    const handleLanguageSelect = (code: string) => {
        setLanguage(code);
        router.push('/kiosk/auth');
    };

    const slideVariants = {
        enter: { x: 1000, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -1000, opacity: 0 },
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-8">
            <ConsentModal />
            <AnimatePresence mode="wait">

                {/* STEP 1: ACCESSIBILITY SELECTION */}
                {currentStep === 'ACCESSIBILITY' && (
                    <motion.div
                        key="step-accessibility"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full max-w-6xl flex flex-col items-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">Select Interface Mode</h2>
                        <p className="text-xl text-blue-200 mb-12 text-center">Choose the experience that best suits your needs.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">

                            {/* Standard Mode */}
                            <button
                                onClick={() => handleAccessibilitySelect('standard')}
                                className={`flex flex-col items-start text-left p-8 rounded-2xl border-4 transition-all duration-300 min-h-[160px] relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${selectedAccMode === 'standard' ? 'border-[#FF9933] bg-blue-900/40 shadow-[0_0_30px_rgba(255,153,51,0.3)]' : 'border-zinc-700/50 bg-[#001f5c]/50 hover:bg-[#002b80] hover:border-blue-400/50'}`}
                            >
                                <div className="bg-blue-500/20 text-blue-300 p-4 rounded-full mb-6 group-hover:bg-blue-500/40 transition-colors">
                                    <UserRound size={48} strokeWidth={2} />
                                </div>
                                <h3 className="text-3xl font-bold mb-2">Standard Mode</h3>
                                <p className="text-xl text-blue-200">Default touchscreen interface and experience</p>
                            </button>

                            {/* Voice Mode */}
                            <button
                                onClick={() => handleAccessibilitySelect('voice')}
                                className={`flex flex-col items-start text-left p-8 rounded-2xl border-4 transition-all duration-300 min-h-[160px] relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${selectedAccMode === 'voice' ? 'border-[#FF9933] bg-blue-900/40 shadow-[0_0_30px_rgba(255,153,51,0.3)]' : 'border-zinc-700/50 bg-[#001f5c]/50 hover:bg-[#002b80] hover:border-blue-400/50'}`}
                            >
                                <div className="absolute top-6 right-6 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-500/30">
                                    JAWS Compatible
                                </div>
                                <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-full mb-6 group-hover:bg-emerald-500/40 transition-colors">
                                    <Ear size={48} strokeWidth={2} />
                                </div>
                                <h3 className="text-3xl font-bold mb-2">Voice / Audio Mode</h3>
                                <p className="text-xl text-blue-200">Screen reader + Braille keypad + Audio guidance</p>
                            </button>

                            {/* Visual Mode */}
                            <button
                                onClick={() => handleAccessibilitySelect('visual')}
                                className={`flex flex-col items-start text-left p-8 rounded-2xl border-4 transition-all duration-300 min-h-[160px] relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${selectedAccMode === 'visual' ? 'border-[#FF9933] bg-blue-900/40 shadow-[0_0_30px_rgba(255,153,51,0.3)]' : 'border-zinc-700/50 bg-[#001f5c]/50 hover:bg-[#002b80] hover:border-blue-400/50'}`}
                            >
                                <div className="absolute top-6 right-6 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-bold border border-purple-500/30">
                                    ISL Supported
                                </div>
                                <div className="bg-purple-500/20 text-purple-300 p-4 rounded-full mb-6 group-hover:bg-purple-500/40 transition-colors">
                                    <Eye size={48} strokeWidth={2} />
                                </div>
                                <h3 className="text-3xl font-bold mb-2">Visual Mode</h3>
                                <p className="text-xl text-blue-200">ISL video instructions + Visual alerts + No audio</p>
                            </button>

                            {/* Simplified Mode */}
                            <button
                                onClick={() => handleAccessibilitySelect('simplified')}
                                className={`flex flex-col items-start text-left p-8 rounded-2xl border-4 transition-all duration-300 min-h-[160px] relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${selectedAccMode === 'simplified' ? 'border-[#FF9933] bg-blue-900/40 shadow-[0_0_30px_rgba(255,153,51,0.3)]' : 'border-zinc-700/50 bg-[#001f5c]/50 hover:bg-[#002b80] hover:border-blue-400/50'}`}
                            >
                                <div className="absolute top-6 right-6 bg-[#FF9933]/20 text-[#FF9933] px-3 py-1 rounded-full text-sm font-bold border border-[#FF9933]/30">
                                    Senior Friendly
                                </div>
                                <div className="bg-[#FF9933]/20 text-[#FF9933] p-4 rounded-full mb-6 group-hover:bg-[#FF9933]/40 transition-colors">
                                    <ALargeSmall size={48} strokeWidth={2} />
                                </div>
                                <h3 className="text-3xl font-bold mb-2">Simplified Mode</h3>
                                <p className="text-xl text-blue-200">Extra large text + High contrast + Step by step</p>
                            </button>

                        </div>
                    </motion.div>
                )}

                {/* STEP 2: LANGUAGE SELECTION */}
                {currentStep === 'LANGUAGE' && (
                    <motion.div
                        key="step-language"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full max-w-7xl flex flex-col items-center"
                    >
                        <h2 className="text-5xl font-bold mb-12 text-center text-white drop-shadow-md">
                            अपनी भाषा चुनें / Select Your Language
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full px-4 mb-16">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageSelect(lang.code)}
                                    className="bg-[#001f5c]/60 hover:bg-[#003087] border border-blue-800 hover:border-blue-400 group transition-all duration-200 rounded-xl p-6 min-h-[120px] shadow-lg flex flex-col items-center justify-center hover:scale-[1.03] active:scale-[0.97]"
                                >
                                    <span className="text-3xl font-bold text-white mb-2">{lang.native}</span>
                                    <span className="text-lg text-blue-200 font-medium group-hover:text-white transition-colors">{lang.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 bg-blue-900/30 px-6 py-3 rounded-full border border-blue-800/50">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-lg text-blue-100 font-medium">22+ Officially Supported Languages</span>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
