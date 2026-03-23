"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useKioskStore, AccessibilityMode } from '@/store/useKioskStore';
import { useStore } from '@/lib/store';
import {
    Ear, Eye, ALargeSmall, UserRound, Globe, Hand, Smartphone, ShieldCheck, Fingerprint, ChevronLeft
} from 'lucide-react';
import { ConsentModal } from '@/components/kiosk/ConsentModal';
import AadhaarOfflineModal from '@/components/kiosk/AadhaarOfflineModal';
import type { AadhaarKycData } from '@/lib/aadhaarOfflineKyc';
import toast from 'react-hot-toast';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

type Step = 'WELCOME' | 'LANGUAGE' | 'OPTIONS';
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

const ACCESSIBILITY_OPTIONS = [
    { mode: 'voice' as AccessibilityMode, Icon: Ear, label: 'Audio', desc: 'Voice guide' },
    { mode: 'visual' as AccessibilityMode, Icon: Eye, label: 'Vision', desc: 'Sign language' },
    { mode: 'simplified' as AccessibilityMode, Icon: ALargeSmall, label: 'Text', desc: 'Large text' },
    { mode: 'standard' as AccessibilityMode, Icon: UserRound, label: 'Screen', desc: 'Standard' },
];

/* ── Ashoka-Chakra-inspired abstract civic SVG emblem ── */
function CivicEmblem() {
    return (
        <svg
            width="96" height="96" viewBox="0 0 96 96"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Outer ring */}
            <circle cx="48" cy="48" r="44" stroke="#1a3a6b" strokeWidth="3" opacity="0.18" />
            {/* Inner ring */}
            <circle cx="48" cy="48" r="34" stroke="#1a3a6b" strokeWidth="2" opacity="0.35" />
            {/* Hub */}
            <circle cx="48" cy="48" r="8" fill="#1a3a6b" opacity="0.85" />
            {/* 24 spokes */}
            {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                const x1 = 48 + 10 * Math.cos(rad);
                const y1 = 48 + 10 * Math.sin(rad);
                const x2 = 48 + 32 * Math.cos(rad);
                const y2 = 48 + 32 * Math.sin(rad);
                return (
                    <line
                        key={i}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="#1a3a6b"
                        strokeWidth={i % 3 === 0 ? 2 : 1}
                        opacity={i % 3 === 0 ? 0.75 : 0.35}
                        strokeLinecap="round"
                    />
                );
            })}
        </svg>
    );
}

/* ── Tri-colour decorative bar ── */
function TricolourBar({ className = '' }: { className?: string }) {
    return (
        <div className={`flex h-1.5 rounded-full overflow-hidden w-48 ${className}`}>
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-[#138808]" />
        </div>
    );
}

export default function KioskHome() {
    const router = useRouter();
    const { setAccessibilityMode, setLanguage: setKioskLanguage } = useKioskStore();
    const { setLanguage: setGlobalLanguage, setVoiceMode, setHighContrast, setFontSize, setISLActive } = useStore();
    const { login } = useKioskStore();
    const { t } = useDynamicTranslation();

    const [currentStep, setCurrentStep] = useState<Step>('WELCOME');
    const [selectedLang, setSelectedLang] = useState<string>('');
    const [isIdle, setIsIdle] = useState(false);
    const [showAadhaarModal, setShowAadhaarModal] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.searchParams.get('step') === 'OPTIONS') {
                setCurrentStep('OPTIONS');
                const savedLang = localStorage.getItem('NEXT_LOCALE');
                if (savedLang) setSelectedLang(savedLang);
            }
        }
    }, []);

    const handleAadhaarSuccess = (data: AadhaarKycData) => {
        const dummyToken = `ekyc_token_${Date.now()}`;
        const user = {
            id: data.referenceId || `aadhaar_${Date.now()}`,
            name: data.name || 'Citizen',
            email: null,
            emailVerified: null,
            image: null,
            role: 'USER',
            mobile: data.mobileHash || 'EKYC_USER',
            isBanned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // @ts-expect-error partial user
        login(dummyToken, user, 'FULL_ACCESS');
        setShowAadhaarModal(false);
        router.push('/kiosk/dashboard');
    };

    /* ── 30-second idle detection on WELCOME screen only ── */
    const resetIdle = useCallback(() => {
        setIsIdle(false);
    }, []);

    useEffect(() => {
        if (currentStep !== 'WELCOME') {
            setIsIdle(false);
            return;
        }
        const timer = setTimeout(() => setIsIdle(true), 30_000);
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'pointerdown'];
        events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));
        return () => {
            clearTimeout(timer);
            events.forEach(e => window.removeEventListener(e, resetIdle));
        };
    }, [currentStep, resetIdle]);

    /* Re-start idle timer whenever idle is reset */
    useEffect(() => {
        if (currentStep !== 'WELCOME' || isIdle) return;
        const timer = setTimeout(() => setIsIdle(true), 30_000);
        return () => clearTimeout(timer);
    }, [isIdle, currentStep]);

    const handleAccessibilitySelect = (mode: AccessibilityMode) => {
        setAccessibilityMode(mode);
        if (mode === 'voice') {
            setVoiceMode(true); setHighContrast(false); setFontSize('normal'); setISLActive(false);
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                const unlock = new SpeechSynthesisUtterance('');
                unlock.volume = 0;
                window.speechSynthesis.speak(unlock);
            }
        } else if (mode === 'visual') {
            setVoiceMode(false); setHighContrast(false); setFontSize('normal'); setISLActive(true);
        } else if (mode === 'simplified') {
            setVoiceMode(false); setHighContrast(true); setFontSize('xlarge'); setISLActive(false);
        } else {
            setVoiceMode(false); setHighContrast(false); setFontSize('normal'); setISLActive(false);
        }
    };

    const handleLanguageConfirm = () => {
        if (!selectedLang) return;
        setKioskLanguage(selectedLang);
        setGlobalLanguage(selectedLang);
        setCurrentStep('OPTIONS');
    };

    const handleFlow = (flow: Flow) => {
        setTimeout(() => {
            router.push(flow === 'QUICK_PAY' ? '/kiosk/dashboard' : '/kiosk/auth');
        }, 100);
    };

    const slideVariants = {
        enter:  { x: 50,  opacity: 0 },
        center: { x: 0,   opacity: 1 },
        exit:   { x: -50, opacity: 0 },
    };

    return (
        <div className="kiosk-page flex flex-col relative w-full h-full overflow-hidden"
            style={{ background: '#F4F5F7', padding: 0 }}
        >
            <ConsentModal />
            <AnimatePresence>
                {showAadhaarModal && (
                    <AadhaarOfflineModal
                        onClose={() => setShowAadhaarModal(false)}
                        onSuccess={handleAadhaarSuccess}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence mode="wait">

                {/* ═══════════════════════════════════════
                    STEP 1 — SPLASH / WELCOME
                ═══════════════════════════════════════ */}
                {currentStep === 'WELCOME' && (
                    <motion.div
                        key="step-welcome"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 flex"
                        style={{ background: '#F4F5F7' }}
                    >


                        {/* ── Main centre content ── */}
                        <main className="flex-1 flex flex-col items-center justify-center px-8" style={{ position: 'relative' }}>

                            {/* Civic emblem */}
                            <div className="splash-emblem mb-6">
                                <CivicEmblem />
                            </div>

                            {/* Tricolour accent */}
                            <TricolourBar className="splash-emblem mb-8" />

                            {/* Headline */}
                            <h1
                                className="splash-title"
                                style={{
                                    fontSize: 'clamp(52px, 6vw, 84px)',
                                    fontWeight: 800,
                                    color: '#1B2F5E',
                                    textAlign: 'center',
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.02em',
                                    fontFamily: '"Inter", "Noto Sans", system-ui, sans-serif',
                                    marginBottom: 16,
                                }}
                            >
                                Welcome to Suvidha
                            </h1>

                            {/* Sub-headline */}
                            <p
                                className="splash-subtitle"
                                style={{
                                    fontSize: 'clamp(22px, 2.5vw, 38px)',
                                    fontWeight: 400,
                                    color: '#6B7280',
                                    textAlign: 'center',
                                    letterSpacing: '0.01em',
                                    fontFamily: '"Inter", "Noto Sans", system-ui, sans-serif',
                                    marginBottom: 56,
                                }}
                            >
                                Government Services — Simplified
                            </p>

                            {/* CTA button */}
                            <div className="splash-cta-wrap">
                                <button
                                    className={isIdle ? 'splash-cta-idle' : ''}
                                    onClick={() => setCurrentStep('LANGUAGE')}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 14,
                                        minWidth: 340,
                                        height: 82,
                                        padding: '0 48px',
                                        background: '#1B3A6B',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 16,
                                        fontSize: 'clamp(18px, 1.8vw, 26px)',
                                        fontWeight: 700,
                                        fontFamily: '"Inter", "Noto Sans", system-ui, sans-serif',
                                        letterSpacing: '0.01em',
                                        cursor: 'pointer',
                                        boxShadow: '0 8px 32px rgba(27,58,107,0.28)',
                                        transition: 'filter 0.18s, transform 0.15s',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.filter = 'brightness(1.12)';
                                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.filter = '';
                                        (e.currentTarget as HTMLElement).style.transform = '';
                                    }}
                                    onFocus={e => (e.currentTarget.style.outline = '3px solid #005ea2')}
                                    onBlur={e => (e.currentTarget.style.outline = '')}
                                >
                                    <Globe size={30} strokeWidth={1.8} />
                                    Choose Your Preferred Language
                                </button>
                            </div>

                            {/* Version / footer info */}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 28,
                                    left: 0,
                                    right: 0,
                                    textAlign: 'center',
                                    fontSize: 12,
                                    color: '#9CA3AF',
                                    letterSpacing: '0.05em',
                                    fontWeight: 500,
                                }}
                            >
                                SUVIDHA 2026 &nbsp;·&nbsp; Government of India &nbsp;·&nbsp; v2.1.0
                            </div>
                        </main>

                        {/* ── 30-second Idle overlay ── */}
                        <AnimatePresence>
                            {isIdle && (
                                <motion.div
                                    key="idle-overlay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.7 }}
                                    onClick={() => setIsIdle(false)}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(20, 36, 70, 0.78)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 24,
                                        cursor: 'pointer',
                                        backdropFilter: 'blur(6px)',
                                        zIndex: 50,
                                    }}
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.12, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <Hand size={72} color="white" strokeWidth={1.4} />
                                    </motion.div>
                                    <p
                                        className="idle-prompt-text"
                                        style={{
                                            fontSize: 'clamp(28px, 3vw, 48px)',
                                            fontWeight: 700,
                                            color: '#fff',
                                            letterSpacing: '0.02em',
                                            fontFamily: '"Inter", system-ui, sans-serif',
                                            textAlign: 'center',
                                        }}
                                    >
                                        Touch to Begin
                                    </p>
                                    <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>
                                        Tap anywhere to continue
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ═══════════════════════════════════════
                    STEP 2 — LANGUAGE SELECTION
                ═══════════════════════════════════════ */}
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
                        <div className="flex flex-col items-center pt-8 pb-4">
                            <h1 className="text-[var(--font-2xl)] font-bold text-[var(--irs-navy)] mb-1">
                                Choose Your Language
                            </h1>
                            <p className="text-[var(--font-md)] text-[var(--irs-gray-600)]">
                                अपनी भाषा चुनें / ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ
                            </p>
                        </div>

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

                        <div className="flex justify-between items-center py-6 px-4 w-full max-w-5xl mx-auto">
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

                {/* ═══════════════════════════════════════
                    STEP 3 — OPTIONS
                ═══════════════════════════════════════ */}
                {currentStep === 'OPTIONS' && (
                    <motion.div
                        key="step-options"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center h-full w-full relative"
                    >
                        {/* Back Button */}
                        <button
                            onClick={() => setCurrentStep('LANGUAGE')}
                            className="absolute top-10 left-10 flex items-center gap-2 text-[#1B3A6B] font-semibold hover:opacity-80 transition-opacity"
                        >
                            <ChevronLeft className="w-8 h-8" />
                            <span style={{ fontSize: 20 }}>Back</span>
                        </button>

                        {/* ── Heading ── */}
                        <div className="text-center mb-12">
                            <h2 style={{ fontSize: 44, fontWeight: 700, color: '#1B2F5E', marginBottom: 16 }}>
                                Get Verified to Proceed
                            </h2>
                            <p style={{ fontSize: 22, color: '#6B7280' }}>
                                Choose your preferred authentication method
                            </p>
                        </div>

                        {/* ── Grid of Options ── */}
                        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-xl px-8">
                            {/* Card 1: OTP Verification */}
                            <button
                                onClick={() => router.push('/kiosk/auth')}
                                className="w-full flex items-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-[#1B3A6B] hover:shadow-md transition-all group"
                            >
                                <div className="bg-[#eef2f6] p-4 rounded-xl group-hover:bg-[#1B3A6B] transition-colors">
                                    <Smartphone className="w-8 h-8 text-[#1B3A6B] group-hover:text-white transition-colors" />
                                </div>
                                <div className="ml-6 text-left">
                                    <h3 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>OTP Verification</h3>
                                    <p style={{ fontSize: 16, color: '#6B7280' }}>Login with your mobile number safely securely</p>
                                </div>
                            </button>

                            {/* DIVIDER */}
                            <div className="w-full relative flex items-center justify-center my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-dashed border-gray-300"></div>
                                </div>
                                <span className="relative bg-[#F4F5F7] px-4 text-gray-500 font-bold tracking-widest text-sm">
                                    — OR —
                                </span>
                            </div>

                            {/* SECTION 2: AADHAAR */}
                            <div className="flex flex-col items-center w-full">
                                <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1B2F5E', marginBottom: 20, fontFamily: '"Inter", "Noto Sans", system-ui, sans-serif' }}>
                                    Verify with Aadhaar eKYC
                                </h2>

                                <div className="flex justify-center gap-6 w-full">
                                    {/* Sub-Card 1: Aadhaar OTP */}
                                    <button
                                        onClick={() => setShowAadhaarModal(true)}
                                        className="flex-1 flex flex-col items-center justify-center gap-4 py-8 px-4 bg-white border border-[#1B3A6B] rounded-2xl cursor-pointer hover:bg-[#1B3A6B] transition-all group shadow-sm hover:shadow-md"
                                    >
                                        <ShieldCheck className="w-10 h-10 text-[#1B3A6B] group-hover:text-white transition-colors" />
                                        <div className="text-center">
                                            <div style={{ fontSize: 18, fontWeight: 700 }} className="text-[#1B3A6B] group-hover:text-white transition-colors">Aadhaar OTP</div>
                                            <div className="text-sm mt-1 text-[#6B7280] group-hover:text-white/80 transition-colors">
                                                Verify using OTP on Aadhaar-linked mobile
                                            </div>
                                        </div>
                                    </button>

                                    {/* Sub-Card 2: Biometric */}
                                    <button
                                        onClick={() => setShowAadhaarModal(true)}
                                        className="flex-1 flex flex-col items-center justify-center gap-4 py-8 px-4 bg-white border border-[#1B3A6B] rounded-2xl cursor-pointer hover:bg-[#1B3A6B] transition-all group shadow-sm hover:shadow-md"
                                    >
                                        <Fingerprint className="w-10 h-10 text-[#1B3A6B] group-hover:text-white transition-colors" />
                                        <div className="text-center">
                                            <div style={{ fontSize: 18, fontWeight: 700 }} className="text-[#1B3A6B] group-hover:text-white transition-colors">Biometric Auth</div>
                                            <div className="text-sm mt-1 text-[#6B7280] group-hover:text-white/80 transition-colors">
                                                Use fingerprint or iris scan at the kiosk
                                            </div>
                                        </div>
                                    </button>
                                </div>
                                <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16 }}>
                                    Your Aadhaar data is used only for verification as per UIDAI guidelines. No data is stored.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
