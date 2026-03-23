'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ShieldCheck, Upload, CheckCircle2, X, QrCode
} from 'lucide-react';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { uploadAadhaarZip, type AadhaarKycData } from '@/lib/aadhaarOfflineKyc';
import { useAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';

export default function AadhaarPage() {
    const router = useRouter();
    const { t } = useDynamicTranslation();
    const { setAuthenticated, setAuthMode } = useAuthStore();

    const [step, setStep] = useState<'upload' | 'verifying' | 'success' | 'error'>('upload');
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [shareCode, setShareCode] = useState('');
    const [kycData, setKycData] = useState<AadhaarKycData | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [signatureVerified, setSignatureVerified] = useState(false);

    const handleVerify = async () => {
        if (!zipFile || shareCode.length < 4) return;
        setStep('verifying');
        try {
            const { kycData: uploadedKycData, signatureVerified: verifiedStatus } =
                await uploadAadhaarZip(zipFile, shareCode);
            setKycData(uploadedKycData);
            setSignatureVerified(verifiedStatus);
            setStep('success');
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : 'Error parsing ZIP. Check share code.');
            setStep('error');
        }
    };

    const handleContinue = (kycData: AadhaarKycData) => {
        // Log in with Aadhaar identity — use referenceId as token mock
        const mockToken = `aadhaar-${kycData.referenceId}`;
        const mockUser = {
            id: kycData.referenceId,
            name: kycData.name,
            mobile: kycData.referenceId, // Aadhaar doesn't expose mobile — use ref as placeholder
            address: typeof kycData.address === 'string' ? kycData.address : JSON.stringify(kycData.address),
        };
        setAuthMode('FULL_ACCESS');
        setAuthenticated(mockToken, mockUser);
        
        toast.success(`Welcome, ${kycData.name}! Identity verified via Aadhaar eKYC.`);
        router.push('/kiosk/dashboard');
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-[#F0F7FF]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#002868] to-[#004085] text-white px-6 py-6 flex items-center gap-4 shrink-0 shadow-md">
                <button
                    onClick={() => router.push('/kiosk/auth')}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black">{t('Aadhaar Offline eKYC')}</h1>
                        <p className="text-blue-200 text-sm">UIDAI · Secure Physical Verification · No internet needed</p>
                    </div>
                </div>
            </div>

            {/* Info Bar */}
            <div className="bg-[#E8F4FD] border-b-2 border-[#BEE3F8] px-6 py-3 text-sm text-[#004085] font-medium flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#004085] inline-block" />
                {t('Your data is never stored — Aadhaar ZIP is parsed locally and discarded immediately.')}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto flex items-center justify-center p-6 pl-24 md:p-8 md:pl-28">
                <div className="w-full max-w-lg">
                    <AnimatePresence mode="wait">

                        {/* STEP: Upload */}
                        {step === 'upload' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white rounded-3xl shadow-md border-2 border-[#BEE3F8] p-8 space-y-6"
                            >
                                <div className="text-center mb-2">
                                    <div className="w-16 h-16 bg-[#E8F4FD] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck className="w-9 h-9 text-[#004085]" />
                                    </div>
                                    <h2 className="text-2xl font-black text-[#0A1628]">{t('Verify with Aadhaar Offline')}</h2>
                                    <p className="text-[#4A6FA5] mt-1">{t('Upload your Aadhaar Offline eKYC ZIP file from UIDAI')}</p>
                                </div>

                                {/* File Drop */}
                                <div
                                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all relative overflow-hidden
                                        ${zipFile ? 'border-[#004085] bg-[#E8F4FD]' : 'border-[#BEE3F8] hover:border-[#004085] hover:bg-[#F0F7FF]'}`}
                                >
                                    <input
                                        type="file"
                                        accept=".zip"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                                    />
                                    <Upload className={`w-9 h-9 mx-auto mb-3 ${zipFile ? 'text-[#004085]' : 'text-[#90CDF4]'}`} />
                                    {zipFile ? (
                                        <p className="font-bold text-[#004085] text-lg">{zipFile.name}</p>
                                    ) : (
                                        <>
                                            <p className="font-bold text-[#2C5282] text-lg">{t('Upload Aadhaar Offline eKYC ZIP')}</p>
                                            <p className="text-[#4A6FA5] text-sm mt-1">{t('Tap here to select file')}</p>
                                        </>
                                    )}
                                </div>

                                {/* Share Code */}
                                <div>
                                    <label className="block text-base font-bold text-[#2C5282] mb-2">
                                        {t('4-Digit Share Code')}
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={shareCode}
                                        onChange={(e) => setShareCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full text-center text-4xl font-mono py-4 border-2 border-[#90CDF4] rounded-xl focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] outline-none transition-all tracking-[0.5em] bg-white text-[#0A1628]"
                                        placeholder="0000"
                                    />
                                </div>

                                <button
                                    className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={!zipFile || shareCode.length < 4}
                                    onClick={handleVerify}
                                >
                                    <ShieldCheck className="w-6 h-6" />
                                    {t('Verify Identity')}
                                </button>

                                <div className="pt-4 border-t-2 border-[#BEE3F8] flex items-start gap-4">
                                    <div className="p-2 bg-[#E8F4FD] rounded-xl text-[#004085] shrink-0">
                                        <QrCode className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-[#4A6FA5] leading-relaxed">
                                        {t("Don't have your eKYC ZIP? Download it from")}{' '}
                                        <a href="https://myaadhaar.uidai.gov.in/offline-ekyc" target="_blank" rel="noreferrer" className="text-[#004085] font-bold hover:underline">
                                            myaadhaar.uidai.gov.in
                                        </a>
                                    </p>
                                </div>

                                <div className="text-center">
                                    <button
                                        onClick={() => router.push('/kiosk/auth')}
                                        className="text-[#004085] font-semibold hover:underline text-sm min-h-[48px] px-5 rounded-xl"
                                    >
                                        {t('Use OTP login instead')}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP: Verifying */}
                        {step === 'verifying' && (
                            <motion.div
                                key="verifying"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-3xl shadow-md border-2 border-[#BEE3F8] p-12 flex flex-col items-center justify-center gap-6"
                            >
                                <div className="w-20 h-20 border-4 border-[#BEE3F8] border-t-[#004085] rounded-full animate-spin" />
                                <h3 className="text-2xl font-black text-[#0A1628]">{t('Verifying your Aadhaar identity...')}</h3>
                                <p className="text-[#4A6FA5] text-center">{t('Decrypting eKYC and checking UIDAI signature')}</p>
                            </motion.div>
                        )}

                        {/* STEP: Success */}
                        {step === 'success' && kycData && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-3xl shadow-md border-2 border-[#BEE3F8] p-8 text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-[#F0FFF4] text-[#1A6B35] rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>

                                {kycData.photo && (
                                    <img
                                        src={`data:image/jpeg;base64,${kycData.photo}`}
                                        alt="Aadhaar Photo"
                                        className="w-24 h-24 rounded-full mx-auto border-4 border-[#BEE3F8] shadow-md object-cover"
                                    />
                                )}

                                <div>
                                    <h2 className="text-3xl font-black text-[#0A1628]">{kycData.name}</h2>
                                    <p className="font-mono text-xl text-[#4A6FA5] mt-1">XXXX-XXXX-{kycData.referenceId.slice(-4)}</p>
                                    <div className="flex items-center justify-center gap-4 mt-3 text-sm text-[#2C5282] font-medium">
                                        <span>DOB: {kycData.dob}</span>
                                        <span className="w-1 h-1 bg-[#BEE3F8] rounded-full" />
                                        <span>Gender: {kycData.gender}</span>
                                    </div>
                                </div>

                                <button
                                    className="bg-[#004085] hover:bg-[#002868] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all shadow-md flex items-center justify-center gap-3 w-full"
                                    onClick={() => handleContinue(kycData)}
                                >
                                    <CheckCircle2 className="w-6 h-6" />
                                    {t('Continue to Dashboard')}
                                </button>

                                <div className="pt-4 border-t-2 border-[#BEE3F8]">
                                    {!signatureVerified ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFBEB] text-[#7B4A0A] text-xs font-bold rounded-full border border-[#FBD38D]">
                                            Signature verification pending — demo mode
                                        </span>
                                    ) : (
                                        <span className="text-xs text-[#4A6FA5] font-medium flex items-center justify-center gap-1">
                                            <ShieldCheck className="w-4 h-4 text-[#1A6B35]" /> Verified by UIDAI Digital Signature
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP: Error */}
                        {step === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-3xl shadow-md border-2 border-[#BEE3F8] p-8 text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                    <X className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-[#0A1628]">{t('Verification Failed')}</h3>
                                <p className="text-red-600 bg-red-50 p-4 rounded-2xl text-sm border border-red-100">{errorMessage}</p>

                                <div className="space-y-3 pt-4">
                                    <button
                                        className="bg-[#004085] hover:bg-[#002868] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all shadow-md flex items-center justify-center gap-3 w-full"
                                        onClick={() => { setStep('upload'); setZipFile(null); setShareCode(''); }}
                                    >
                                        {t('Try Again')}
                                    </button>
                                    <button
                                        onClick={() => router.push('/kiosk/auth')}
                                        className="w-full px-4 py-3 text-base font-semibold text-[#4A6FA5] hover:text-[#0A1628] transition-colors"
                                    >
                                        {t('Use OTP login instead')}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
