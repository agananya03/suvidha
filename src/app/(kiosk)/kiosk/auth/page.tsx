'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Smartphone, KeyRound, ArrowRight, ShieldCheck, Zap, ChevronDown, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKioskStore } from '@/store/useKioskStore';
import toast from 'react-hot-toast';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import AadhaarOfflineModal from '@/components/kiosk/AadhaarOfflineModal';

export default function AuthPage() {
    const router = useRouter();
    const { login } = useKioskStore();
    const { t } = useDynamicTranslation();

    // Start directly on MOBILE step so the phone input is immediately visible
    const [step, setStep] = useState<'MOBILE' | 'OTP' | 'MODE_SELECT'>('MOBILE');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [demoOtp, setDemoOtp] = useState<string | null>(null);
    const [accessMode, setAccessMode] = useState<'FULL' | 'QUICK'>('FULL');
    const [showAadhaarModal, setShowAadhaarModal] = useState(false);

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
        if (otp.length !== 6) {
            toast.error(t('Please enter a 6-digit OTP'));
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, otp })
            });

            if (res.ok) {
                const data = await res.json();
                login(data.token, data.user, 'FULL_ACCESS');
                
                try {
                    const { getDb } = await import('@/lib/offlineDb');
                    const db = await getDb();
                    await db.put('citizen', {
                        mobile: data.user?.mobile ?? mobile,
                        name: data.user?.name ?? undefined,
                        email: data.user?.email ?? undefined,
                        cachedAt: Date.now(),
                    });
                } catch (err) {
                    console.warn('[SUVIDHA] Could not cache citizen data offline:', err);
                }
                
                // Set token in document.cookie so Next.js middleware can read it
                document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`;
                
                toast.success(t('Authentication Successful!'));
                router.push('/kiosk/discovery');
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

    return (
        <div className="h-full overflow-y-auto bg-gray-50/50">
            <div className="min-h-full p-8 flex items-center justify-center">
                <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border">

                <div className="bg-[#001f5c] p-8 text-center text-white relative">
                    <h1 className="text-3xl font-bold tracking-wider uppercase">{t('Citizen Authentication')}</h1>
                    <p className="text-blue-200 mt-2">{t('Secure access to all your connected utilities')}</p>
                    <div className="absolute top-4 right-4 bg-blue-900/50 p-2 rounded-full border border-blue-400">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                </div>

                {/* Access mode pills */}
                <div className="flex justify-center gap-3 pt-6 px-8">
                    <button
                        onClick={() => setAccessMode('FULL')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${accessMode === 'FULL' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <ShieldCheck className="w-4 h-4" /> {t('Full Access')}
                    </button>
                    <button
                        onClick={() => setAccessMode('QUICK')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${accessMode === 'QUICK' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                        <Zap className="w-4 h-4" /> {t('Quick Pay')}
                    </button>
                </div>

                <div className="p-8 md:p-12">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: MOBILE ENTRY — shown immediately */}
                        {step === 'MOBILE' && (
                            <motion.div
                                key="mobile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-md mx-auto"
                            >
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Smartphone className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold">{t('Enter Mobile Number')}</h2>
                                    <p className="text-gray-500 mt-2">{t('A 6-digit OTP will be sent to this number to verify your identity.')}</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-medium text-gray-500">+91</span>
                                        <input
                                            type="tel"
                                            id="mobile-input"
                                            autoFocus
                                            className="w-full text-center text-4xl font-mono py-6 border-2 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all pl-16 tracking-widest bg-gray-50"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="0000000000"
                                            inputMode="numeric"
                                        />
                                    </div>

                                    {/* Demo helper */}
                                    <p className="text-center text-sm text-gray-400">
                                        {t('Demo: use any number e.g.')} <button className="text-primary font-mono underline" onClick={() => setMobile('9876543210')}>9876543210</button>
                                    </p>

                                    <Button
                                        className="w-full h-16 text-xl rounded-xl"
                                        onClick={handleSendOTP}
                                        disabled={mobile.length !== 10 || isLoading}
                                    >
                                        {isLoading ? t('Sending...') : t('Get OTP')} <ArrowRight className="w-6 h-6 ml-2" />
                                    </Button>

                                    <div className="flex items-center gap-3 my-4">
                                        <div className="flex-1 h-px bg-gray-200" />
                                        <span className="text-xs text-gray-400">or</span>
                                        <div className="flex-1 h-px bg-gray-200" />
                                    </div>

                                    <button
                                        onClick={() => setShowAadhaarModal(true)}
                                        className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-left hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-50">
                                                <QrCode className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">
                                                    Login with Aadhaar Offline eKYC
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    No internet required — use your UIDAI eKYC ZIP file
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: OTP VERIFICATION */}
                        {step === 'OTP' && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-md mx-auto"
                            >
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <KeyRound className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold">{t('Enter Validation Code')}</h2>
                                    <p className="text-gray-500 mt-2">{t('Sent to')} +91 {mobile.slice(0, 2)}******{mobile.slice(8, 10)}</p>
                                </div>

                                {demoOtp && (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-center mb-6 font-mono text-xl tracking-widest animate-pulse">
                                        Demo OTP: {demoOtp}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <input
                                        type="text"
                                        id="otp-input"
                                        className="w-full text-center text-5xl font-mono py-6 border-2 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all tracking-[0.5em] bg-gray-50"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="------"
                                        autoFocus
                                        inputMode="numeric"
                                    />

                                    <Button
                                        className="w-full h-16 text-xl rounded-xl"
                                        onClick={handleVerifyOTP}
                                        disabled={otp.length !== 6 || isLoading}
                                    >
                                        {isLoading ? t('Verifying...') : t('Secure Login')} <ShieldCheck className="w-6 h-6 ml-2" />
                                    </Button>

                                    <div className="text-center pt-4">
                                        <button className="text-primary font-bold hover:underline" onClick={handleSendOTP}>{t('Resend Code')}</button>
                                        <span className="mx-4 text-gray-300">|</span>
                                        <button className="text-gray-500 font-medium hover:text-gray-800" onClick={() => { setStep('MOBILE'); setOtp(''); }}>{t('Change Number')}</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
            </div>

            {showAadhaarModal && (
                <AadhaarOfflineModal
                    onClose={() => setShowAadhaarModal(false)}
                    onSuccess={async (kycData) => {
                        try {
                            // Write to IndexedDB citizen store
                            const { getDb } = await import('@/lib/offlineDb');
                            const db = await getDb();
                            await db.put('citizen', {
                                mobile: kycData.mobileHash, // hashed — used as key
                                name: kycData.name,
                                cachedAt: Date.now(),
                            });

                            // Set Zustand auth state
                            // Create a synthetic token for the session 
                            // *Note*: This is a local session identifier, not a server-issued JWT
                            // (Useful placeholder for future OVSE integration mapping)
                            const syntheticToken = `aadhaar_${kycData.referenceId}_${Date.now()}`;
                            login(syntheticToken, {
                                id: kycData.referenceId,
                                mobile: kycData.mobileHash,
                                name: kycData.name,
                            } as Parameters<typeof login>[1], 'FULL_ACCESS');

                            // Set cookie so Next.js middleware allows access to protected routes like /kiosk/discovery
                            // This is a synthetic local session token — not a server-issued JWT.
                            document.cookie = `token=${syntheticToken}; path=/; max-age=${60 * 60 * 8}`;

                            setShowAadhaarModal(false);
                            router.push('/kiosk/discovery');
                        } catch (err) {
                            console.error('eKYC session creation failed:', err);
                        }
                    }}
                />
            )}
        </div>
    );
}

