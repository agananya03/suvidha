'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useKioskStore } from '@/store/useKioskStore';
import toast from 'react-hot-toast';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

export default function AuthPage() {
    const router = useRouter();
    const { login } = useKioskStore();
    const { t } = useDynamicTranslation();

    const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
    const [mobile, setMobile] = useState('');
    
    // OTP State: 6 inputs
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [demoOtp, setDemoOtp] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(300);

    // Timer effect
    useEffect(() => {
        if (step === 'OTP' && timeLeft > 0) {
            const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timerId);
        }
    }, [step, timeLeft]);

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
                setStep('OTP');
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

    return (
        <div className="kiosk-page flex items-center justify-center">
            
            <div className="bg-white border border-[var(--irs-gray-200)] rounded-[var(--radius-xl)] shadow-lg w-full max-w-[480px] p-8 md:p-10 relative overflow-hidden">
                
                {/* Government Header inside card */}
                <div className="text-center mb-8 border-b-4 border-[var(--irs-blue-mid)] pb-6">
                    <h2 className="text-[var(--font-xl)] font-bold text-[var(--irs-navy)]">{t('Citizen Authentication')}</h2>
                    <p className="text-[var(--font-sm)] text-[var(--irs-gray-600)] mt-2">{t('Secure access to SUVIDHA services')}</p>
                </div>

                <AnimatePresence mode="wait">
                    
                    {step === 'MOBILE' && (
                        <motion.div
                            key="mobile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-6"
                        >
                            <div>
                                <label className="kiosk-label">{t('Mobile Number')}</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 text-[var(--font-md)] font-bold text-[var(--irs-gray-600)]">+91</span>
                                    <input
                                        type="tel"
                                        className="kiosk-input pl-14 tracking-widest"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="XXXXXXXXXX"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>

                            <button
                                className="btn-primary w-full mt-2"
                                onClick={handleSendOTP}
                                disabled={mobile.length !== 10 || isLoading}
                            >
                                {isLoading ? t('Sending...') : t('Get OTP')}
                            </button>

                            <button 
                                onClick={() => router.push('/kiosk')}
                                className="text-[var(--irs-blue-mid)] text-center w-full font-semibold underline underline-offset-4 mt-4"
                            >
                                {t('Cancel and return to Home')}
                            </button>
                        </motion.div>
                    )}

                    {step === 'OTP' && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="text-center">
                                <label className="kiosk-label mb-4 text-center">{t('Enter 6-Digit Code')}</label>
                                <p className="text-[var(--font-sm)] text-[var(--irs-gray-600)] mb-6">
                                    {t('Sent to')} +91 {mobile.slice(0, 2)}******{mobile.slice(8, 10)}
                                </p>
                                
                                <div className="flex justify-between gap-2">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            className="w-[70px] h-[80px] text-center text-[var(--font-2xl)] font-bold border-2 border-[var(--irs-gray-400)] rounded-[var(--radius-md)] focus:border-[var(--irs-blue-mid)] focus:bg-[var(--irs-blue-pale)] outline-none transition-all shadow-sm"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Timer progress bar */}
                            <div className="w-full mt-2">
                                <div className="w-full bg-[var(--irs-gray-200)] h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${timeLeft <= 60 ? 'bg-[var(--irs-warning)]' : 'bg-[var(--irs-navy)]'}`} 
                                        style={{ width: `${(timeLeft / 300) * 100}%` }} 
                                    />
                                </div>
                                <div className={`text-right text-[var(--font-xs)] mt-1 font-bold ${timeLeft <= 60 ? 'text-[var(--irs-error)]' : 'text-[var(--irs-gray-600)]'}`}>
                                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                </div>
                            </div>

                            <button
                                className="btn-primary w-full mt-2"
                                onClick={handleVerifyOTP}
                                disabled={otp.join('').length !== 6 || isLoading}
                            >
                                {isLoading ? t('Verifying...') : t('Login')}
                            </button>

                            <div className="flex justify-between items-center mt-4">
                                <button 
                                    className="text-[var(--irs-gray-600)] text-[var(--font-sm)] font-semibold underline underline-offset-4"
                                    onClick={() => { setStep('MOBILE'); setOtp(['','','','','','']); }}
                                >
                                    {t('Change Number')}
                                </button>
                                <button 
                                    className="text-[var(--irs-blue-mid)] text-[var(--font-sm)] font-semibold underline underline-offset-4"
                                    onClick={handleSendOTP}
                                    disabled={timeLeft > 240} // Only allow resend after 60s
                                >
                                    {t('Resend OTP')}
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
            
            {demoOtp && step === 'OTP' && (
                <div className="fixed top-24 right-8 bg-[#fff8e6] border-l-4 border-[var(--irs-warning)] text-[#4a3000] p-4 shadow-lg rounded-r-[var(--radius-md)] z-50">
                    <p className="font-bold text-[var(--font-sm)] uppercase mb-1">Demo Mode</p>
                    <p className="text-[var(--font-lg)] font-mono tracking-widest">{demoOtp}</p>
                </div>
            )}
        </div>
    );
}
