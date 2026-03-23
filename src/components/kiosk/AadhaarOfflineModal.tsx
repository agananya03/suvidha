'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { uploadAadhaarZip, type AadhaarKycData } from '@/lib/aadhaarOfflineKyc';

interface AadhaarOfflineModalProps {
    onSuccess: (kycData: AadhaarKycData) => void;
    onClose: () => void;
}

export default function AadhaarOfflineModal({ onSuccess, onClose }: AadhaarOfflineModalProps) {
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
            const { kycData: uploadedKycData, signatureVerified: verifiedStatus } = await uploadAadhaarZip(zipFile, shareCode);
            setKycData(uploadedKycData);
            setSignatureVerified(verifiedStatus);
            setStep('success');
        } catch (err: any) {
            setErrorMessage(err.message || 'Error parsing ZIP. Check share code.');
            setStep('error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
                <div className="bg-[#001f5c] p-6 text-white text-center">
                    <h2 className="text-2xl font-bold tracking-wider uppercase">Aadhaar Offline eKYC</h2>
                    <p className="text-blue-200 mt-1 text-sm">Secure physical verification</p>
                    <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 'upload' && (
                            <motion.div key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors relative overflow-hidden">
                                    <input 
                                        type="file" 
                                        accept=".zip" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                                    />
                                    <Upload className={`w-8 h-8 mx-auto mb-3 ${zipFile ? 'text-green-500' : 'text-gray-400'}`} />
                                    {zipFile ? (
                                        <p className="font-semibold text-green-700">{zipFile.name}</p>
                                    ) : (
                                        <div>
                                            <p className="font-medium text-gray-700">Upload Aadhaar Offline eKYC ZIP</p>
                                            <p className="text-xs text-gray-400 mt-1">Tap here to select file</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">4-Digit Share Code</label>
                                    <input 
                                        type="text" 
                                        maxLength={4}
                                        value={shareCode}
                                        onChange={(e) => setShareCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full text-center text-4xl font-mono py-4 border-2 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all tracking-[0.5em] bg-gray-50 uppercase"
                                        placeholder="0000"
                                    />
                                </div>

                                <Button 
                                    className="w-full py-6 text-lg rounded-xl" 
                                    disabled={!zipFile || shareCode.length < 4}
                                    onClick={handleVerify}
                                >
                                    Verify Identity <ShieldCheck className="w-5 h-5 ml-2" />
                                </Button>

                                <div className="pt-4 border-t border-gray-100 flex items-start gap-4">
                                    <div className="p-2 bg-blue-50 rounded text-blue-600">
                                        <QrCode className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Don't have your eKYC ZIP? Download it securely from <a href="https://myaadhaar.uidai.gov.in/offline-ekyc" target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline">myaadhaar.uidai.gov.in/offline-ekyc</a>
                                    </p>
                                </div>

                                <div className="text-center pt-2">
                                    <button onClick={onClose} className="text-sm font-semibold text-primary hover:underline">
                                        Use OTP login instead
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'verifying' && (
                            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                                <h3 className="text-xl font-bold text-gray-800">Verifying your Aadhaar identity...</h3>
                                <p className="text-gray-500 mt-2 text-sm text-center">Decrypting eKYC and checking UIDAI signature</p>
                            </motion.div>
                        )}

                        {step === 'success' && kycData && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                
                                {kycData.photo && (
                                    <img 
                                        src={`data:image/jpeg;base64,${kycData.photo}`} 
                                        alt="Aadhaar Photo" 
                                        className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-md object-cover"
                                    />
                                )}

                                <div>
                                    <h2 className="text-2xl font-bold">{kycData.name}</h2>
                                    <p className="font-mono text-xl text-gray-500 mt-1">XXXX-XXXX-{kycData.referenceId.slice(-4)}</p>
                                    <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-600 font-medium">
                                        <span>DOB: {kycData.dob}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span>Gender: {kycData.gender}</span>
                                    </div>
                                </div>

                                <Button className="w-full py-6 text-lg rounded-xl" onClick={() => onSuccess(kycData)}>
                                    Continue
                                </Button>

                                <div className="pt-4 border-t border-gray-100">
                                    {!signatureVerified ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                                            Signature verification pending — demo mode
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-500 font-medium flex items-center justify-center gap-1">
                                            <ShieldCheck className="w-4 h-4 text-green-500" /> Verified by UIDAI Digital Signature
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 'error' && (
                            <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <X className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Verification Failed</h3>
                                <p className="text-red-600 bg-red-50 p-4 rounded-xl text-sm border border-red-100">{errorMessage}</p>
                                
                                <div className="space-y-3 pt-4">
                                    <Button className="w-full" onClick={() => { setStep('upload'); setZipFile(null); setShareCode(''); }}>
                                        Try Again
                                    </Button>
                                    <button onClick={onClose} className="w-full px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                                        Use OTP login instead
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
