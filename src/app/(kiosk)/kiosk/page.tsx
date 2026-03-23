"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useKioskStore, AccessibilityMode } from '@/store/useKioskStore';
import { useStore } from '@/lib/store';
import { Ear, Eye, ALargeSmall, UserRound } from 'lucide-react';
import { ConsentModal } from '@/components/kiosk/ConsentModal';

type Step = 'WELCOME' | 'LANGUAGE';
type Flow = 'QUICK_PAY' | 'FULL_ACCESS';

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
    const { setAccessibilityMode, setLanguage: setKioskLanguage } = useKioskStore();
    const { setLanguage: setGlobalLanguage, setVoiceMode, setHighContrast, setFontSize, setISLActive } = useStore();

    const [currentStep, setCurrentStep] = useState<Step>('WELCOME');
    const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
    const [selectedLang, setSelectedLang] = useState<string>('');

    const handleAccessibilitySelect = (mode: AccessibilityMode) => {
        setAccessibilityMode(mode);

        if (mode === 'voice') {
            setVoiceMode(true);
            setHighContrast(false);
            setFontSize('normal');
            setISLActive(false);

            if (typeof window !== 'undefined' && window.speechSynthesis) {
                const unlock = new SpeechSynthesisUtterance('');
                unlock.volume = 0;
                window.speechSynthesis.speak(unlock);
            }
        } else if (mode === 'visual') {
            setVoiceMode(false);
            setHighContrast(false);
            setFontSize('normal');
            setISLActive(true);
        } else if (mode === 'simplified') {
            setVoiceMode(false);
            setHighContrast(true);
            setFontSize('xlarge');
            setISLActive(false);
        } else {
            setVoiceMode(false);
            setHighContrast(false);
            setFontSize('normal');
            setISLActive(false);
        }
    };

    const handleFlow = (flow: Flow) => {
        setSelectedFlow(flow);
        setCurrentStep('LANGUAGE');
    };

    const handleLanguageConfirm = () => {
        if (!selectedLang) return;
        setKioskLanguage(selectedLang);
        setGlobalLanguage(selectedLang);
        
        setTimeout(() => {
            if (selectedFlow === 'QUICK_PAY') {
                router.push('/kiosk/dashboard');
            } else {
                router.push('/kiosk/auth');
            }
        }, 100);
    };

    const slideVariants = {
        enter: { x: 50, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 },
    };

    return (
        <div className="kiosk-page flex flex-col relative w-full h-full overflow-hidden">
            <ConsentModal />
            <AnimatePresence mode="wait">
                
                {/* STEP 1: WELCOME SCREEN */}
                {currentStep === 'WELCOME' && (
                    <motion.div
                        key="step-welcome"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col items-center justify-center w-full"
                    >
                        <h1 className="text-[var(--font-2xl)] font-bold text-[var(--irs-navy)] mb-2">
                            नमस्ते / Welcome
                        </h1>
                        <h2 className="text-[var(--font-lg)] text-[var(--irs-gray-600)] mb-12">
                            Government Services — Simplified
                        </h2>
                        
                        <div className="flex gap-6 mb-16">
                            <button className="btn-secondary" onClick={() => handleFlow('QUICK_PAY')}>
                                Quick Pay (No Login)
                            </button>
                            <button className="btn-primary" onClick={() => handleFlow('FULL_ACCESS')}>
                                Full Access (OTP Login)
                            </button>
                        </div>

                        {/* Accessibility bottom strip */}
                        <div className="absolute bottom-8 left-0 w-full flex justify-center gap-6">
                            <button 
                                onClick={() => handleAccessibilitySelect('voice')}
                                className="flex flex-col items-center gap-2 text-[var(--irs-gray-600)] hover:text-[var(--irs-navy)] transition-colors"
                            >
                                <div className="w-14 h-14 rounded-full bg-white border border-[var(--irs-gray-200)] flex items-center justify-center shadow-sm">
                                    <Ear size={28} />
                                </div>
                                <span className="text-[var(--font-xs)] font-bold uppercase tracking-widest">Voice</span>
                            </button>
                            <button 
                                onClick={() => handleAccessibilitySelect('visual')}
                                className="flex flex-col items-center gap-2 text-[var(--irs-gray-600)] hover:text-[var(--irs-navy)] transition-colors"
                            >
                                <div className="w-14 h-14 rounded-full bg-white border border-[var(--irs-gray-200)] flex items-center justify-center shadow-sm">
                                    <Eye size={28} />
                                </div>
                                <span className="text-[var(--font-xs)] font-bold uppercase tracking-widest">Visual</span>
                            </button>
                            <button 
                                onClick={() => handleAccessibilitySelect('simplified')}
                                className="flex flex-col items-center gap-2 text-[var(--irs-gray-600)] hover:text-[var(--irs-navy)] transition-colors"
                            >
                                <div className="w-14 h-14 rounded-full bg-white border border-[var(--irs-gray-200)] flex items-center justify-center shadow-sm">
                                    <ALargeSmall size={28} />
                                </div>
                                <span className="text-[var(--font-xs)] font-bold uppercase tracking-widest">Simplified</span>
                            </button>
                            <button 
                                onClick={() => handleAccessibilitySelect('standard')}
                                className="flex flex-col items-center gap-2 text-[var(--irs-gray-600)] hover:text-[var(--irs-navy)] transition-colors"
                            >
                                <div className="w-14 h-14 rounded-full bg-white border border-[var(--irs-gray-200)] flex items-center justify-center shadow-sm">
                                    <UserRound size={28} />
                                </div>
                                <span className="text-[var(--font-xs)] font-bold uppercase tracking-widest">Standard</span>
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
                        transition={{ duration: 0.2 }}
                        className="flex flex-col w-full h-full"
                    >
                        <h1 className="kiosk-page-title">Choose Your Language</h1>
                        
                        <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto py-4">
                            <div className="lang-grid">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setSelectedLang(lang.code)}
                                        className={`lang-btn flex-col gap-1 ${selectedLang === lang.code ? 'selected' : ''}`}
                                    >
                                        <span className="text-[var(--font-md)] font-bold">{lang.native}</span>
                                        <span className="text-[var(--font-xs)] opacity-80">{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-8 px-4 w-full max-w-5xl mx-auto">
                            <button className="btn-secondary" onClick={() => setCurrentStep('WELCOME')}>
                                Back
                            </button>
                            <button 
                                className="btn-primary" 
                                disabled={!selectedLang} 
                                onClick={handleLanguageConfirm}
                                style={{ opacity: selectedLang ? 1 : 0.5, cursor: selectedLang ? 'pointer' : 'not-allowed' }}
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
