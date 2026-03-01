'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Smartphone, ScanLine,
    CheckCircle2, AlertTriangle, DownloadCloud,
    Camera, RefreshCcw, Search, KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

// --- MOCK DATA --- //
const MOCK_DIGILOCKER_DOCS = [
    { id: '1', name: 'Aadhaar Card', type: 'ID PROOF', date: '2020-05-12' },
    { id: '2', name: 'PAN Card', type: 'TAX ID', date: '2019-08-22' },
    { id: '3', name: 'Driving License', type: 'ID PROOF', date: '2022-01-15' },
];

export default function DocumentHandler() {
    const { highContrast } = useStore();
    const [activeTab, setActiveTab] = useState<'digilocker' | 'scanner' | 'token'>('digilocker');

    // DigiLocker State
    const [aadhaar, setAadhaar] = useState('');
    const [dlStatus, setDlStatus] = useState<'idle' | 'otp' | 'loading' | 'success'>('idle');
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

    // Scanner State
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
    const [scanProgress, setScanProgress] = useState(0);

    // Token State
    const [token, setToken] = useState('');
    const [tokenStatus, setTokenStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [tokenError, setTokenError] = useState('');
    const [tokenData, setTokenData] = useState<{ fileName: string; fileSize: number; mimeType: string; message: string } | null>(null);

    // --- TAB 1: DIGILOCKER HANDLERS --- //
    const handleDigiLockerRequest = () => {
        if (aadhaar.length < 12) return;
        setDlStatus('otp');
    };

    const handleDigiLockerOTP = () => {
        setDlStatus('loading');
        // Simulate delay for fetching from DigiLocker
        setTimeout(() => {
            setDlStatus('success');
        }, 1500);
    };

    const toggleDocSelection = (id: string) => {
        setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    };

    // --- TAB 2: SCANNER HANDLERS --- //
    const startScan = () => {
        setScanStatus('scanning');
        setScanProgress(0);

        // Simulate scanning progress
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setScanStatus('success');
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    // --- TAB 3: TOKEN HANDLERS --- //
    const handleTokenSubmit = async () => {
        if (token.length !== 6) return;
        setTokenStatus('loading');
        setTokenError('');
        setTokenData(null);

        try {
            const res = await fetch(`/api/documents/token/${token.toUpperCase()}`);
            const data = await res.json();

            if (res.ok) {
                setTokenStatus('success');
                setTokenData(data);
            } else {
                setTokenStatus('error');
                setTokenError(data.error || 'Failed to retrieve documents.');
            }
        } catch (err) {
            setTokenStatus('error');
            setTokenError('Network error while retrieving token.');
        }
    };


    return (
        <div className={`w-full rounded-3xl border shadow-sm overflow-hidden ${highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>

            {/* TABS HEADER */}
            <div className={`flex border-b ${highContrast ? 'border-gray-800' : 'border-gray-100'} overflow-x-auto scrollbar-hide`}>
                <button
                    onClick={() => setActiveTab('digilocker')}
                    className={`flex-1 py-4 px-6 font-bold text-sm tracking-wide whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${activeTab === 'digilocker' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <DownloadCloud className="w-4 h-4" /> DigiLocker
                </button>
                <button
                    onClick={() => setActiveTab('scanner')}
                    className={`flex-1 py-4 px-6 font-bold text-sm tracking-wide whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${activeTab === 'scanner' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <ScanLine className="w-4 h-4" /> Scanner
                </button>
                <button
                    onClick={() => setActiveTab('token')}
                    className={`flex-1 py-4 px-6 font-bold text-sm tracking-wide whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${activeTab === 'token' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <KeyRound className="w-4 h-4" /> Web Token
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 md:p-8 min-h-[400px] flex flex-col justify-center">
                <AnimatePresence mode="wait">

                    {/* --- TAB 1: DIGILOCKER --- */}
                    {activeTab === 'digilocker' && (
                        <motion.div key="dl" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-md mx-auto w-full space-y-6">

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <DownloadCloud className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold">Fetch from DigiLocker</h3>
                                <p className="text-sm text-gray-500 mt-2">Securely import your verified government documents directly.</p>
                            </div>

                            {dlStatus === 'idle' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aadhaar Number</label>
                                        <input
                                            type="text"
                                            placeholder="XXXX XXXX XXXX"
                                            maxLength={12}
                                            value={aadhaar}
                                            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                                            className="w-full text-xl font-mono p-4 bg-gray-50 border rounded-xl outline-none focus:border-blue-500 text-center tracking-widest"
                                        />
                                    </div>
                                    <Button className="w-full text-lg" disabled={aadhaar.length !== 12} onClick={handleDigiLockerRequest}>
                                        Request OTP
                                    </Button>
                                </div>
                            )}

                            {dlStatus === 'otp' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 text-sm flex items-start gap-3">
                                        <Smartphone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <p>An OTP has been sent to your Aadhaar-linked mobile number finishing in <b>*8912</b>.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enter 6-digit OTP</label>
                                        <input
                                            type="text" placeholder="------" maxLength={6}
                                            className="w-full text-2xl font-mono p-4 bg-gray-50 border rounded-xl outline-none focus:border-blue-500 text-center tracking-[1em]"
                                        />
                                    </div>
                                    <Button className="w-full text-lg" onClick={handleDigiLockerOTP}>Verify & Fetch</Button>
                                </motion.div>
                            )}

                            {dlStatus === 'loading' && (
                                <div className="py-12 flex flex-col items-center justify-center text-blue-500 space-y-4">
                                    <RefreshCcw className="w-10 h-10 animate-spin" />
                                    <p className="font-bold animate-pulse">Connecting to DigiLocker API...</p>
                                </div>
                            )}

                            {dlStatus === 'success' && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                                    <div className="flex items-center gap-2 text-green-600 font-bold mb-4 justify-center">
                                        <CheckCircle2 className="w-5 h-5" /> Account Linked Successfully
                                    </div>
                                    <p className="text-sm font-bold text-gray-500">Select documents to attach:</p>
                                    <div className="space-y-3">
                                        {MOCK_DIGILOCKER_DOCS.map(doc => (
                                            <div
                                                key={doc.id}
                                                onClick={() => toggleDocSelection(doc.id)}
                                                className={`p-4 border-2 rounded-xl cursor-pointer transition-colors flex items-center justify-between ${selectedDocs.includes(doc.id) ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <FileText className={`w-8 h-8 ${selectedDocs.includes(doc.id) ? 'text-primary' : 'text-gray-400'}`} />
                                                    <div>
                                                        <p className="font-bold">{doc.name}</p>
                                                        <p className="text-xs text-gray-500">{doc.type} • Updated {doc.date}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedDocs.includes(doc.id) ? 'border-primary bg-primary text-white' : 'border-gray-300'
                                                    }`}>
                                                    {selectedDocs.includes(doc.id) && <CheckCircle2 className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="w-full mt-4" size="lg" disabled={selectedDocs.length === 0} onClick={() => alert('Documents attached!')}>
                                        Attach {selectedDocs.length} Document(s)
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* --- TAB 2: SCANNER --- */}
                    {activeTab === 'scanner' && (
                        <motion.div key="scan" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-md mx-auto w-full space-y-8 flex flex-col items-center">

                            <div className="text-center">
                                <h3 className="text-xl font-bold mb-2">Physical Scanner</h3>
                                <p className="text-sm text-gray-500">Place your document face down on the glass scanner below.</p>
                            </div>

                            {/* SCANNER VISUAL */}
                            <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200">
                                {/* The scanning bar */}
                                {scanStatus === 'scanning' && (
                                    <motion.div
                                        className="absolute top-0 bottom-0 w-2 bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.8)] z-10"
                                        initial={{ left: '0%' }}
                                        animate={{ left: '100%' }}
                                        transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                                    />
                                )}
                                {/* Document stub */}
                                {(scanStatus === 'scanning' || scanStatus === 'success') && (
                                    <div className="absolute inset-4 bg-white shadow-sm border p-4 opacity-50 flex flex-col gap-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        <div className="h-24 bg-gray-200 rounded w-24 mt-4" />
                                    </div>
                                )}
                                {/* Center Icon */}
                                {scanStatus === 'idle' && (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col gap-2">
                                        <Camera className="w-12 h-12" />
                                        <span className="font-bold">Ready</span>
                                    </div>
                                )}
                            </div>

                            {scanStatus === 'idle' && (
                                <Button size="lg" className="w-full max-w-xs text-lg" onClick={startScan}>
                                    <ScanLine className="w-5 h-5 mr-2" /> Start Scan
                                </Button>
                            )}

                            {scanStatus === 'scanning' && (
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-sm font-bold text-green-600">
                                        <span>Scanning in progress...</span>
                                        <span>{scanProgress}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {scanStatus === 'success' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-4 text-left">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 text-green-800">
                                        <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold">Scan Complete</p>
                                            <p className="text-sm">Document OCR successful.</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800 text-green-400 p-4 rounded-xl font-mono text-sm leading-relaxed overflow-hidden">
                                        <p className="text-gray-500 text-xs mb-2">--- EXTRACTED TEXT ---</p>
                                        <p>NAME: RAMESH KUMAR</p>
                                        <p>DOC ID: PAN-XXXX-8912</p>
                                        <p>DOB: 12/05/1980</p>
                                        <p>VALID UPTO: N/A</p>
                                        <p className="text-gray-500 text-xs mt-2">--- END OF OCR ---</p>
                                    </div>
                                    <Button className="w-full" size="lg" onClick={() => alert('Attached scanned file!')}>Attach Extracted File</Button>
                                    <Button variant="outline" className="w-full" onClick={() => setScanStatus('idle')}>Scan Another</Button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* --- TAB 3: WEB TOKEN (PRE-UPLOADED) --- */}
                    {activeTab === 'token' && (
                        <motion.div key="token" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-md mx-auto w-full space-y-6">

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <KeyRound className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold">Import via Web Token</h3>
                                <p className="text-sm text-gray-500 mt-2">Already uploaded files from your phone at home? Enter the 6-character retrieval token below.</p>
                            </div>

                            {tokenStatus !== 'success' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center block">6-Char Secure Token</label>
                                        <input
                                            type="text"
                                            placeholder="XXXXXX"
                                            maxLength={6}
                                            value={token}
                                            onChange={(e) => setToken(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                            className="w-full text-4xl font-mono p-6 bg-gray-50 border-2 rounded-2xl outline-none focus:border-purple-500 text-center tracking-[0.5em] font-black"
                                        />
                                    </div>

                                    {tokenError && (
                                        <p className="text-red-500 text-sm font-bold text-center flex items-center justify-center gap-1">
                                            <AlertTriangle className="w-4 h-4" /> {tokenError}
                                        </p>
                                    )}

                                    <Button
                                        className="w-full text-lg bg-purple-600 hover:bg-purple-700 h-14"
                                        disabled={token.length !== 6 || tokenStatus === 'loading'}
                                        onClick={handleTokenSubmit}
                                    >
                                        {tokenStatus === 'loading' ? <RefreshCcw className="w-5 h-5 animate-spin" /> : 'Retrieve Document'}
                                    </Button>

                                    <div className="pt-6 border-t mt-6 flex gap-3 text-sm text-gray-500 items-start">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                                        <p>Files expire automatically after 48 hours. They remain strictly encrypted until token redemption.</p>
                                    </div>
                                </div>
                            )}

                            {tokenStatus === 'success' && tokenData && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                    <div className="flex flex-col items-center justify-center p-6 bg-green-50 border border-green-200 rounded-2xl text-center space-y-2">
                                        <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
                                        <h4 className="font-bold text-green-900 text-lg">Token Verified</h4>
                                        <p className="text-sm text-green-700">{tokenData.message}</p>
                                    </div>

                                    <div className="border rounded-xl p-4 flex items-center gap-4 bg-gray-50">
                                        <div className="w-12 h-12 bg-white rounded shadow-sm flex items-center justify-center border">
                                            <FileText className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm tracking-wide">{tokenData.fileName}</p>
                                            <p className="text-xs text-gray-500">{tokenData.mimeType} • {(tokenData.fileSize / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>

                                    <Button className="w-full h-14 text-lg bg-primary" onClick={() => alert('Consent Verified. Document Attached!')}>
                                        Confirm & Attach
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={() => { setTokenStatus('idle'); setToken(''); }}>
                                        Enter Another Token
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
