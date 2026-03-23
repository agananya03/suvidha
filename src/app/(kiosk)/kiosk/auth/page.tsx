'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/store/useKioskStore';
import toast from 'react-hot-toast';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { Ear, Eye, ALargeSmall, UserRound } from 'lucide-react';
import type { AccessibilityMode } from '@/store/useKioskStore';

const ACCESSIBILITY_OPTIONS = [
    { mode: 'voice' as AccessibilityMode, Icon: Ear, label: 'Audio', desc: 'Voice guide' },
    { mode: 'visual' as AccessibilityMode, Icon: Eye, label: 'Vision', desc: 'Sign language' },
    { mode: 'simplified' as AccessibilityMode, Icon: ALargeSmall, label: 'Text', desc: 'Large text' },
    { mode: 'standard' as AccessibilityMode, Icon: UserRound, label: 'Screen', desc: 'Standard' },
];

export default function AuthPage() {
    const router = useRouter();
    const { login, setAccessibilityMode } = useKioskStore();
    const { t } = useDynamicTranslation();

    const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
    const [mobile, setMobile] = useState('');
    
    // OTP State: 6 inputs
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [demoOtp, setDemoOtp] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(300);
    const [otpSent, setOtpSent] = useState(false);

    // Timer effect
    useEffect(() => {
        if (otpSent && timeLeft > 0) {
            const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timerId);
        }
    }, [otpSent, timeLeft]);

    const handleSendOTP = async () => {
        if (mobile.length !== 10) {
            toast.error(t('Please enter a valid 10-digit mobile number'));
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile })
            });
            const data = await res.json();

            if (res.ok) {
                setOtpSent(true);
                setTimeLeft(300);
                if (data.demoOtp) {
                    setDemoOtp(data.demoOtp);
                    toast.success(`Demo OTP: ${data.demoOtp}`, { duration: 8000 });
                }
            } else {
                toast.error(data.error || t('Failed to send OTP'));
            }
        } catch {
            toast.error(t('Network error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error(t('Please enter a 6-digit OTP'));
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, otp: otpString })
            });

            if (res.ok) {
                const data = await res.json();
                login(data.token, data.user, 'FULL_ACCESS');
                
                document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`;
                
                toast.success(t('Authentication Successful!'));
                router.push('/kiosk/dashboard');
            } else {
                const data = await res.json();
                toast.error(data.error || t('Invalid OTP'));
            }
        } catch {
            toast.error(t('Network error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take last char
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleAccessibilitySelect = (mode: AccessibilityMode) => {
        setAccessibilityMode(mode);
    };

    return (
        <div className="absolute inset-0 flex" style={{ background: '#F4F5F7' }}>

            {/* ── Left accessibility sidebar ── */}
            <aside
                className="splash-sidebar flex flex-col items-center justify-center gap-4 px-5 py-8 shrink-0 relative z-10 bg-white shadow-[2px_0_15px_rgba(0,0,0,0.03)]"
                style={{ width: 120, borderRight: '1px solid #E5E7EB' }}
            >
                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: '#9CA3AF',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        marginBottom: 8,
                    }}
                >
                    Accessibility
                </span>
                {ACCESSIBILITY_OPTIONS.map(({ mode, Icon, label, desc }) => (
                    <button
                        key={mode}
                        onClick={() => handleAccessibilitySelect(mode)}
                        title={desc}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 6,
                            background: '#fff',
                            border: '1.5px solid #E5E7EB',
                            borderRadius: 16,
                            padding: '14px 10px',
                            width: 88,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                            color: '#1a3a6b',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = '#1a3a6b';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(26,58,107,0.15)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                        }}
                    >
                        <Icon size={36} strokeWidth={1.6} />
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            {label}
                        </span>
                    </button>
                ))}
            </aside>

            {/* ── Main centre content split layout ── */}
            <main className="flex-1 flex flex-col items-center justify-center relative px-8 py-10 h-full overflow-y-auto">
                <button 
                    onClick={() => router.push('/kiosk?step=OPTIONS')}
                    className="absolute top-8 left-8 text-[#6B7280] hover:text-[#1B3A6B] font-semibold text-lg hover:underline transition-colors z-20 flex items-center gap-2"
                >
                    &larr; Back
                </button>
                
                {/* SECTION 1: OTP */}
                <div className="flex flex-col items-center w-full max-w-3xl pt-10">
                    <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1B2F5E', marginBottom: 8, fontFamily: '"Inter", "Noto Sans", system-ui, sans-serif' }}>
                        Quick Access via OTP
                    </h2>
                    <p style={{ fontSize: 20, color: '#6B7280', marginBottom: 32 }}>
                        Enter your mobile number to receive a one-time password
                    </p>

                    <div className="relative mb-6">
                        <span style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 24, display: 'flex', alignItems: 'center', gap: 8, color: '#4B5563', pointerEvents: 'none' }}>
                            🇮🇳 +91
                            <div style={{ width: 1, height: 32, background: '#D1D5DB', marginLeft: 8 }} />
                        </span>
                        <input
                            type="tel"
                            maxLength={10}
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="Enter Mobile Number"
                            disabled={otpSent || isLoading}
                            style={{
                                width: 520,
                                height: 72,
                                borderRadius: 12,
                                border: '2px solid #E5E7EB',
                                fontSize: 24,
                                paddingLeft: 120,
                                paddingRight: 24,
                                letterSpacing: '0.05em',
                                outline: 'none',
                                transition: 'border-color 0.15s',
                                backgroundColor: otpSent ? '#F3F4F6' : '#fff',
                                color: otpSent ? '#9CA3AF' : '#111827',
                            }}
                            onFocus={e => !otpSent && (e.currentTarget.style.borderColor = '#1B3A6B')}
                            onBlur={e => !otpSent && (e.currentTarget.style.borderColor = '#E5E7EB')}
                        />
                    </div>

                    {!otpSent ? (
                        <button
                            onClick={handleSendOTP}
                            disabled={mobile.length !== 10 || isLoading}
                            style={{
                                width: 260,
                                height: 64,
                                borderRadius: 12,
                                background: mobile.length === 10 ? '#1B3A6B' : '#9CA3AF',
                                color: '#fff',
                                fontSize: 20,
                                fontWeight: 600,
                                cursor: mobile.length === 10 && !isLoading ? 'pointer' : 'not-allowed',
                                border: 'none',
                                transition: 'background 0.15s, transform 0.15s',
                            }}
                            onMouseEnter={e => mobile.length === 10 && !isLoading && (e.currentTarget.style.filter = 'brightness(1.1)')}
                            onMouseLeave={e => mobile.length === 10 && !isLoading && (e.currentTarget.style.filter = '')}
                            onMouseDown={e => mobile.length === 10 && !isLoading && (e.currentTarget.style.transform = 'scale(0.98)')}
                            onMouseUp={e => mobile.length === 10 && !isLoading && (e.currentTarget.style.transform = '')}
                        >
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                            <div className="flex gap-4 mb-8">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { otpRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        autoFocus={i === 0}
                                        style={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: 12,
                                            border: '2px solid #E5E7EB',
                                            fontSize: 32,
                                            fontWeight: 700,
                                            textAlign: 'center',
                                            outline: 'none',
                                            transition: 'all 0.15s',
                                            backgroundColor: '#fff',
                                            color: '#1B2F5E',
                                        }}
                                        onFocus={e => {
                                            e.currentTarget.style.borderColor = '#1B3A6B';
                                            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(27,58,107,0.1)';
                                        }}
                                        onBlur={e => {
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleVerifyOTP}
                                disabled={otp.join('').length !== 6 || isLoading}
                                style={{
                                    width: 260,
                                    height: 64,
                                    borderRadius: 12,
                                    background: otp.join('').length === 6 ? '#1B3A6B' : '#9CA3AF',
                                    color: '#fff',
                                    fontSize: 20,
                                    fontWeight: 600,
                                    cursor: otp.join('').length === 6 && !isLoading ? 'pointer' : 'not-allowed',
                                    border: 'none',
                                    transition: 'background 0.15s, transform 0.15s',
                                }}
                                onMouseEnter={e => otp.join('').length === 6 && !isLoading && (e.currentTarget.style.filter = 'brightness(1.1)')}
                                onMouseLeave={e => otp.join('').length === 6 && !isLoading && (e.currentTarget.style.filter = '')}
                                onMouseDown={e => otp.join('').length === 6 && !isLoading && (e.currentTarget.style.transform = 'scale(0.98)')}
                                onMouseUp={e => otp.join('').length === 6 && !isLoading && (e.currentTarget.style.transform = '')}
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Continue'}
                            </button>
                            <button onClick={() => { setOtpSent(false); setOtp(['','','','','','']); setMobile(''); }} className="mt-4 text-[#1B3A6B] font-semibold underline text-sm">
                                Change Mobile Number
                            </button>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Bottom Accessibility Strip */}
            <div className="absolute bottom-6 right-8 flex gap-5 bg-white px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 z-50">
                {ACCESSIBILITY_OPTIONS.map(({ mode, Icon, label }) => (
                    <button
                        key={mode}
                        onClick={() => handleAccessibilitySelect(mode)}
                        className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-[#1B3A6B] transition-colors group"
                    >
                        <Icon size={22} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                    </button>
                ))}
            </div>
            
            {demoOtp && otpSent && (
                <div className="fixed top-24 right-8 bg-[#fff8e6] border-l-4 border-[var(--irs-warning)] text-[#4a3000] p-4 shadow-lg rounded-r-[var(--radius-md)] z-50">
                    <p className="font-bold text-[var(--font-sm)] uppercase mb-1">Demo Mode</p>
                    <p className="text-[var(--font-lg)] font-mono tracking-widest">{demoOtp}</p>
                </div>
            )}
        </div>
    );
}
