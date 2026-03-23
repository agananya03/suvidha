"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useKioskStore, AccessibilityMode } from '@/store/useKioskStore';
import { useStore } from '@/lib/store';
import { Ear, Eye, ALargeSmall, UserRound, Home, CheckCircle2 } from 'lucide-react';
import { ConsentModal } from '@/components/kiosk/ConsentModal';
import { BackButton } from '@/components/kiosk/BackButton';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

type Step = 'ACCESSIBILITY' | 'LANGUAGE' | 'HOME_VISIT';
type HomeVisitState = 'INPUT' | 'SUBMITTING' | 'CONFIRMED';
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
    const { setLanguage: setGlobalLanguage, setVoiceMode, setHighContrast, setFontSize, setISLActive, highContrast } = useStore();
    const { t } = useDynamicTranslation();

    const [currentStep, setCurrentStep] = useState<Step>('ACCESSIBILITY');
    const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
    const [selectedLang, setSelectedLang] = useState<string>('');
    const [homeVisitState, setHomeVisitState] = useState<HomeVisitState>('INPUT');
    const [homeVisitPhone, setHomeVisitPhone] = useState('');

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

    const handleBackToAccessibility = () => {
        setCurrentStep('ACCESSIBILITY');
        setSelectedLang('');
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
        <div className="bg-gradient-to-br from-[#001a4d] via-[#002868] to-[#003a8c] flex flex-col relative w-full h-full overflow-hidden">
            <ConsentModal />

            {/* Back button — only visible on LANGUAGE and HOME_VISIT steps (not the first screen) */}
            {currentStep === 'LANGUAGE' && (
                <BackButton onClick={handleBackToAccessibility} variant="light" />
            )}
            {currentStep === 'HOME_VISIT' && (
                <BackButton onClick={() => { setCurrentStep('ACCESSIBILITY'); setHomeVisitState('INPUT'); setHomeVisitPhone(''); }} variant="light" />
            )}

            <AnimatePresence mode="wait">
                
                {/* STEP 1: ACCESSIBILITY SCREEN */}
                {currentStep === 'ACCESSIBILITY' && (
                    <motion.div
                        key="step-accessibility"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="h-full overflow-y-auto pt-16 pb-8 pl-24 pr-8 max-w-5xl mx-auto flex flex-col items-center justify-center w-full relative"
                    >
                        <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tight">
                            नमस्ते / Welcome
                        </h1>
                        <h2 className="text-blue-200 text-lg text-center mb-8">
                            Government Services — Simplified
                        </h2>
                        
                        <div className="flex gap-6 mb-10 mt-6">
                            <button className="bg-white hover:bg-[#E8F4FD] active:bg-[#BEE3F8] text-[#004085] border-2 border-[#004085] font-semibold text-lg min-h-[56px] px-6 rounded-2xl transition-all duration-150" onClick={() => handleFlow('QUICK_PAY')}>
                                Quick Pay (No Login)
                            </button>
                            <button className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[56px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center" onClick={() => handleFlow('FULL_ACCESS')}>
                                Full Access (OTP Login)
                            </button>
                        </div>

                        {/* Accessibility bottom strip */}
                        <div className="w-full mt-auto mb-8 flex flex-col items-center gap-6 z-10">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full justify-center px-4 px-4">
                                <button 
                                    onClick={() => handleAccessibilitySelect('voice')}
                                    className="bg-white text-[#0A1628] rounded-2xl p-6 min-h-[100px] border-2 border-[#BEE3F8] hover:border-[#004085] hover:shadow-md cursor-pointer transition-all duration-150 active:scale-95 flex flex-col items-center text-center gap-3"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#E8F4FD] flex items-center justify-center text-2xl text-[#004085]">
                                        <Ear size={28} />
                                    </div>
                                    <span className="text-lg font-bold text-[#0A1628] block">Voice</span>
                                </button>
                                <button 
                                    onClick={() => handleAccessibilitySelect('visual')}
                                    className="bg-white text-[#0A1628] rounded-2xl p-6 min-h-[100px] border-2 border-[#BEE3F8] hover:border-[#004085] hover:shadow-md cursor-pointer transition-all duration-150 active:scale-95 flex flex-col items-center text-center gap-3"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#E8F4FD] flex items-center justify-center text-2xl text-[#004085]">
                                        <Eye size={28} />
                                    </div>
                                    <span className="text-lg font-bold text-[#0A1628] block">Visual</span>
                                </button>
                                <button 
                                    onClick={() => handleAccessibilitySelect('simplified')}
                                    className="bg-white text-[#0A1628] rounded-2xl p-6 min-h-[100px] border-2 border-[#BEE3F8] hover:border-[#004085] hover:shadow-md cursor-pointer transition-all duration-150 active:scale-95 flex flex-col items-center text-center gap-3"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#E8F4FD] flex items-center justify-center text-2xl text-[#004085]">
                                        <ALargeSmall size={28} />
                                    </div>
                                    <span className="text-lg font-bold text-[#0A1628] block">Simplified</span>
                                </button>
                                <button 
                                    onClick={() => handleAccessibilitySelect('standard')}
                                    className="bg-white text-[#0A1628] rounded-2xl p-6 min-h-[100px] border-2 border-[#BEE3F8] hover:border-[#004085] hover:shadow-md cursor-pointer transition-all duration-150 active:scale-95 flex flex-col items-center text-center gap-3"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#E8F4FD] flex items-center justify-center text-2xl text-[#004085]">
                                        <UserRound size={28} />
                                    </div>
                                    <span className="text-lg font-bold text-[#0A1628] block">Standard</span>
                                </button>
                            </div>

                            {/* Home visit trigger — humble, below the mode cards */}
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-sm text-[var(--irs-gray-500)] font-medium">
                                    Cannot use this kiosk on your own? We&apos;ll send someone to you.
                                </p>
                                <button
                                    onClick={() => setCurrentStep('HOME_VISIT')}
                                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#E8F4FD] active:bg-[#BEE3F8] text-[#004085] border border-[#004085] font-semibold rounded-2xl transition-colors text-base shadow-none"
                                >
                                    <Home size={20} />
                                    Request a Home Visit
                                </button>
                            </div>
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
                        <h1 className="text-3xl font-black text-white text-center mb-2 tracking-tight">Choose Your Language</h1>
                        
                        <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto py-4">
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setSelectedLang(lang.code)}
                                        className={`flex flex-col items-center gap-1 transition-all min-h-[56px] cursor-pointer ${selectedLang === lang.code ? 'bg-white text-[#002868] border-[2px] border-white rounded-xl px-4 py-4 font-black shadow-lg' : 'bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl px-4 py-4 text-base font-semibold active:bg-white/30'}`}
                                    >
                                        <span className="text-lg font-bold">{lang.native}</span>
                                        <span className="text-xs opacity-70">{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end items-center mt-8 px-4 w-full max-w-5xl mx-auto">
                            <button 
                                className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center w-full mt-6" 
                                disabled={!selectedLang} 
                                onClick={handleLanguageConfirm}
                                style={{ opacity: selectedLang ? 1 : 0.5, cursor: selectedLang ? 'pointer' : 'not-allowed' }}
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: HOME VISIT */}
                {currentStep === 'HOME_VISIT' && (
                    <motion.div
                        key="step-home-visit"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex items-center justify-center w-full overflow-y-auto p-8"
                    >
                        {/* ── INPUT state ── */}
                        {homeVisitState === 'INPUT' && (
                            <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-xl p-10 flex flex-col items-center text-center ${
                                highContrast ? 'border-black border-2' : ''
                            }`}>
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                    <Home size={36} className="text-blue-500" />
                                </div>
                                <h1 className={`font-bold mb-3 leading-snug ${
                                    highContrast ? 'text-4xl text-black' : 'text-3xl text-gray-900'
                                }`}>
                                    हम आपके घर आएंगे<br />
                                    <span className="text-2xl text-gray-600 font-semibold">We&apos;ll Come To You</span>
                                </h1>
                                <p className={`mb-8 leading-relaxed ${
                                    highContrast ? 'text-2xl text-black' : 'text-xl text-gray-500'
                                }`}>
                                    {t('Enter your mobile number. A government official will call you within 2 hours to schedule a home visit.')}
                                </p>

                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={homeVisitPhone}
                                    onChange={e => setHomeVisitPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="9XXXXXXXXX"
                                    className={`w-full text-center tracking-widest rounded-2xl border-2 px-6 py-5 mb-8 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all ${
                                        highContrast
                                            ? 'text-4xl font-bold border-black text-black bg-white'
                                            : 'text-3xl font-semibold border-gray-300 text-gray-900 bg-gray-50'
                                    }`}
                                />

                                <button
                                    disabled={homeVisitPhone.length !== 10}
                                    onClick={() => {
                                        setHomeVisitState('SUBMITTING');
                                        setTimeout(() => setHomeVisitState('CONFIRMED'), 1500);
                                    }}
                                    className={`w-full flex items-center justify-center gap-3 rounded-2xl font-bold transition-all ${
                                        highContrast ? 'text-2xl py-5' : 'text-xl py-4'
                                    } ${
                                        homeVisitPhone.length === 10
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    📞 {t('Request Home Visit')}
                                </button>

                                <button
                                    onClick={() => { setCurrentStep('ACCESSIBILITY'); setHomeVisitPhone(''); }}
                                    className={`mt-6 text-gray-400 hover:text-gray-700 transition-colors ${
                                        highContrast ? 'text-xl' : 'text-base'
                                    }`}
                                >
                                    ← {t("I'll use the kiosk myself")}
                                </button>
                            </div>
                        )}

                        {/* ── SUBMITTING state ── */}
                        {homeVisitState === 'SUBMITTING' && (
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <p className={`font-semibold text-gray-600 ${
                                    highContrast ? 'text-2xl text-black' : 'text-xl'
                                }`}>
                                    {t('Registering your request...')}
                                </p>
                            </div>
                        )}

                        {/* ── CONFIRMED state ── */}
                        {homeVisitState === 'CONFIRMED' && (
                            <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-xl p-10 flex flex-col items-center text-center ${
                                highContrast ? 'border-black border-2' : ''
                            }`}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                                >
                                    <CheckCircle2 size={48} className="text-green-600" strokeWidth={2.5} />
                                </motion.div>

                                <h1 className={`font-bold mb-3 ${
                                    highContrast ? 'text-4xl text-black' : 'text-3xl text-gray-900'
                                }`}>
                                    {t('Help is on the way')}
                                </h1>
                                <p className={`mb-6 leading-relaxed ${
                                    highContrast ? 'text-2xl text-black' : 'text-xl text-gray-500'
                                }`}>
                                    {t('An official from the SUVIDHA helpdesk will call')} <strong className="text-gray-900">{homeVisitPhone}</strong> {t('within 2 hours to assist you.')}
                                </p>

                                {/* What happens next card */}
                                <div className="w-full bg-blue-50 rounded-2xl p-6 mb-6 text-left space-y-4">
                                    <p className={`font-bold text-blue-900 ${
                                        highContrast ? 'text-xl' : 'text-lg'
                                    }`}>
                                        {t('What happens next:')}
                                    </p>
                                    {[
                                        t('① Official calls to confirm your service need'),
                                        t('② Home visit scheduled at your convenience'),
                                        t('③ Service completed on a portable government device'),
                                    ].map((step, i) => (
                                        <p key={i} className={`text-blue-800 ${
                                            highContrast ? 'text-xl' : 'text-lg'
                                        }`}>{step}</p>
                                    ))}
                                </div>

                                {/* Helpline */}
                                <div className="w-full bg-gray-50 rounded-2xl px-6 py-4 mb-8 border border-gray-200">
                                    <p className={`text-gray-500 mb-1 ${
                                        highContrast ? 'text-lg' : 'text-sm'
                                    }`}>
                                        {t('Need immediate help?')}
                                    </p>
                                    <p className={`font-black text-gray-900 tracking-widest ${
                                        highContrast ? 'text-3xl' : 'text-2xl'
                                    }`}>
                                        1800-111-2026
                                    </p>
                                </div>

                                <button
                                    onClick={() => router.push('/kiosk')}
                                    className={`w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-colors ${
                                        highContrast ? 'text-2xl py-5' : 'text-xl py-4'
                                    }`}
                                >
                                    ✅ {t('Done — Return to Home Screen')}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
