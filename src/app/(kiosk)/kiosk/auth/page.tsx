'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Smartphone, KeyRound, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKioskStore } from '@/store/useKioskStore';
import toast from 'react-hot-toast';

export default function AuthPage() {
    const router = useRouter();
    const { login } = useKioskStore();

    const [step, setStep] = useState<'MODE_SELECT' | 'MOBILE' | 'OTP'>('MODE_SELECT');
    const [mobile, setMobile] = useState('9876543210'); // Pre-fill for demo
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [demoOtp, setDemoOtp] = useState<string | null>(null);

    const handleSendOTP = async () => {
        if (mobile.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
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
                    toast.success(`Demo OTP is ${data.demoOtp}`, { duration: 5000 });
                }
            } else {
                toast.error(data.error || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            toast.error('Please enter a 6-digit OTP');
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
                login(data.token, data.user);
                toast.success('Authentication Successful!');
                router.push('/kiosk/discovery');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Invalid OTP');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-grow p-8 flex items-center justify-center bg-gray-50/50">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border">

                <div className="bg-[#001f5c] p-8 text-center text-white relative">
                    <h1 className="text-3xl font-bold tracking-wider uppercase">Citizen Authentication</h1>
                    <p className="text-blue-200 mt-2">Secure access to all your connected utilities</p>
                    <div className="absolute top-4 right-4 bg-blue-900/50 p-2 rounded-full border border-blue-400">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: MODE SELECTION */}
                        {step === 'MODE_SELECT' && (
                            <motion.div
                                key="mode"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <h2 className="text-2xl font-bold mb-6 text-center">Select Access Level</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <button
                                        className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left flex flex-col items-center justify-center text-center h-48"
                                        onClick={() => {
                                            toast('Quick Pay bypassed for demo flow. Using Full Access.', { icon: 'ℹ️' });
                                            setStep('MOBILE');
                                        }}
                                    >
                                        <Zap className="w-12 h-12 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Quick Pay</h3>
                                        <p className="text-sm text-gray-500">Pay a bill using only standard consumer number. No history saved.</p>
                                    </button>

                                    <button
                                        className="group p-6 rounded-2xl border-2 border-primary bg-blue-50 hover:bg-blue-100 transition-all text-left flex flex-col items-center justify-center text-center h-48 relative overflow-hidden shadow-[0_0_20px_rgba(0,102,204,0.15)]"
                                        onClick={() => setStep('MOBILE')}
                                    >
                                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-200 rounded-full opacity-50"></div>
                                        <ShieldCheck className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform relative z-10" />
                                        <h3 className="text-xl font-bold text-primary mb-2 relative z-10">Full Access</h3>
                                        <p className="text-sm text-blue-700 relative z-10">Access all linked services, history, and automated dispute resolution.</p>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: MOBILE ENTRY */}
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
                                    <h2 className="text-2xl font-bold">Enter Mobile Number</h2>
                                    <p className="text-gray-500 mt-2">A 6-digit OTP will be sent to this number to verify your identity.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-medium text-gray-500">+91</span>
                                        <input
                                            type="tel"
                                            className="w-full text-center text-4xl font-mono py-6 border-2 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all pl-16 tracking-widest bg-gray-50"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="0000000000"
                                        />
                                    </div>

                                    <Button
                                        className="w-full h-16 text-xl rounded-xl"
                                        onClick={handleSendOTP}
                                        disabled={mobile.length !== 10 || isLoading}
                                    >
                                        {isLoading ? 'Sending...' : 'Get OTP'} <ArrowRight className="w-6 h-6 ml-2" />
                                    </Button>
                                    <div className="text-center">
                                        <button className="text-gray-400 font-medium hover:text-gray-600" onClick={() => setStep('MODE_SELECT')}>Back</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: OTP VERIFICATION */}
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
                                    <h2 className="text-2xl font-bold">Enter Validation Code</h2>
                                    <p className="text-gray-500 mt-2">Sent to +91 {mobile.slice(0, 2)}******{mobile.slice(8, 10)}</p>
                                </div>

                                {demoOtp && (
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-center mb-6 font-mono text-xl tracking-widest animate-pulse">
                                        Demo OTP: {demoOtp}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <input
                                        type="text"
                                        className="w-full text-center text-5xl font-mono py-6 border-2 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all tracking-[0.5em] bg-gray-50"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="------"
                                        autoFocus
                                    />

                                    <Button
                                        className="w-full h-16 text-xl rounded-xl"
                                        onClick={handleVerifyOTP}
                                        disabled={otp.length !== 6 || isLoading}
                                    >
                                        {isLoading ? 'Verifying...' : 'Secure Login'} <ShieldCheck className="w-6 h-6 ml-2" />
                                    </Button>

                                    <div className="text-center pt-4">
                                        <button className="text-primary font-bold hover:underline" onClick={handleSendOTP}>Resend Code</button>
                                        <span className="mx-4 text-gray-300">|</span>
                                        <button className="text-gray-500 font-medium hover:text-gray-800" onClick={() => setStep('MOBILE')}>Change Number</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
