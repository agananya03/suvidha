'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Smartphone, ScanLine,
    CheckCircle2, AlertTriangle, DownloadCloud,
    Camera, RefreshCcw, KeyRound
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
        } catch {
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
                                            className="w-full p-4 text-lg border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <Button onClick={handleDigiLockerRequest} disabled={aadhaar.length < 12} className="w-full py-6 text-lg">
                                        Connect DigiLocker
                                    </Button>
                                </div>
                            )}

                            {dlStatus === 'otp' && (
                                <div className="space-y-4 text-center">
                                    <p className="text-gray-600">OTP sent to Aadhaar-linked mobile</p>
                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        maxLength={6}
                                        className="w-full p-4 text-lg border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest"
                                    />
                                    <Button onClick={handleDigiLockerOTP} className="w-full py-6 text-lg">
                                        Verify OTP
                                    </Button>
                                </div>
                            )}

                            {dlStatus === 'loading' && (
                                <div className="text-center py-12">
                                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-500">Fetching documents...</p>
                                </div>
                            )}

                            {dlStatus === 'success' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-green-600 mb-4">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-bold">DigiLocker Connected</span>
                                    </div>
                                    {MOCK_DIGILOCKER_DOCS.map(doc => (
                                        <div
                                            key={doc.id}
                                            onClick={() => toggleDocSelection(doc.id)}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedDocs.includes(doc.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="font-bold">{doc.name}</p>
                                                    <p className="text-xs text-gray-400">{doc.type} • Issued {doc.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button disabled={selectedDocs.length === 0} className="w-full py-6 text-lg mt-4">
                                        Import {selectedDocs.length} Document(s)
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* --- TAB 2: SCANNER --- */}
                    {activeTab === 'scanner' && (
                        <motion.div key="scanner" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-md mx-auto w-full space-y-6">

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <ScanLine className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold">Scan Physical Document</h3>
                                <p className="text-sm text-gray-500 mt-2">Use the kiosk camera to capture your document.</p>
                            </div>

                            {scanStatus === 'idle' && (
                                <div className="space-y-4">
                                    <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                        <Camera className="w-12 h-12 text-gray-300" />
                                    </div>
                                    <Button onClick={startScan} className="w-full py-6 text-lg bg-green-600 hover:bg-green-700">
                                        Start Scanning
                                    </Button>
                                </div>
                            )}

                            {scanStatus === 'scanning' && (
                                <div className="space-y-4 text-center">
                                    <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-green-500/20 to-transparent animate-pulse"></div>
                                        <ScanLine className="w-16 h-16 text-green-400 animate-bounce" />
                                    </div>
                                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full transition-all" style={{ width: `${scanProgress}%` }}></div>
                                    </div>
                                    <p className="text-gray-500">Scanning... {scanProgress}%</p>
                                </div>
                            )}

                            {scanStatus === 'success' && (
                                <div className="space-y-4 text-center">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-xl font-bold text-green-700">Document Captured!</h4>
                                    <p className="text-gray-500">Your document has been securely scanned and encrypted.</p>
                                    <Button onClick={() => setScanStatus('idle')} variant="outline" className="mt-4">
                                        <RefreshCcw className="w-4 h-4 mr-2" /> Scan Another
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* --- TAB 3: TOKEN --- */}
                    {activeTab === 'token' && (
                        <motion.div key="token" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-md mx-auto w-full space-y-6">

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <KeyRound className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold">Web Token Retrieval</h3>
                                <p className="text-sm text-gray-500 mt-2">Enter the 6-digit token received after uploading documents from home.</p>
                            </div>

                            {tokenStatus === 'idle' && (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="ABC123"
                                        maxLength={6}
                                        value={token}
                                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                                        className="w-full p-4 text-2xl border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-center tracking-[0.5em] font-mono uppercase"
                                    />
                                    <Button onClick={handleTokenSubmit} disabled={token.length !== 6} className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700">
                                        Retrieve Documents
                                    </Button>
                                </div>
                            )}

                            {tokenStatus === 'loading' && (
                                <div className="text-center py-12">
                                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-500">Retrieving documents...</p>
                                </div>
                            )}

                            {tokenStatus === 'success' && tokenData && (
                                <div className="space-y-4 text-center">
                                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-xl font-bold text-purple-700">Document Retrieved!</h4>
                                    <div className="bg-purple-50 p-4 rounded-xl text-left">
                                        <p><strong>File:</strong> {tokenData.fileName}</p>
                                        <p><strong>Size:</strong> {(tokenData.fileSize / 1024).toFixed(1)} KB</p>
                                        <p><strong>Type:</strong> {tokenData.mimeType}</p>
                                    </div>
                                    <Button onClick={() => { setTokenStatus('idle'); setToken(''); }} variant="outline" className="mt-4">
                                        <RefreshCcw className="w-4 h-4 mr-2" /> Enter Another Token
                                    </Button>
                                </div>
                            )}

                            {tokenStatus === 'error' && (
                                <div className="space-y-4 text-center">
                                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-xl font-bold text-red-700">Retrieval Failed</h4>
                                    <p className="text-gray-500">{tokenError}</p>
                                    <Button onClick={() => { setTokenStatus('idle'); setToken(''); }} variant="outline" className="mt-4">
                                        <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
