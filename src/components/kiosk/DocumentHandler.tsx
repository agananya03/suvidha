'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Smartphone, ScanLine,
    CheckCircle2, AlertTriangle, DownloadCloud,
    Camera, RefreshCcw, KeyRound
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

// --- MOCK DATA --- //
const MOCK_DIGILOCKER_DOCS = [
    { id: '1', name: 'Aadhaar Card', type: 'ID PROOF', date: '2020-05-12' },
    { id: '2', name: 'PAN Card', type: 'TAX ID', date: '2019-08-22' },
    { id: '3', name: 'Driving License', type: 'ID PROOF', date: '2022-01-15' },
];

export default function DocumentHandler() {
    const { highContrast } = useStore();
    const { t } = useDynamicTranslation();
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
    const [documentLoaded, setDocumentLoaded] = useState(false);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [isAttaching, setIsAttaching] = useState(false);

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
    const startScan = useCallback(() => {
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
    }, []);

    // --- TAB 3: TOKEN HANDLERS --- //
    const handleTokenSubmit = useCallback(async () => {
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
    }, [token]);

    const handleConfirmAttach = useCallback(async () => {
        if (!token || tokenStatus !== 'success' || isAttaching) return;
        
        setIsAttaching(true);
        
        try {
            const res = await fetch(`/api/documents/retrieve/${token.toUpperCase()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                if (data.cloudinaryUrl) {
                    // Set both states immediately
                    setDocumentUrl(data.cloudinaryUrl);
                    setDocumentLoaded(true);
                    
                    // Scroll to ensure visibility
                    setTimeout(() => {
                        const previewElement = document.querySelector('[data-preview-section]');
                        if (previewElement) {
                            previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 100);
                } else {
                    setTokenError('Document file not found. Please check with support.');
                }
            } else {
                setTokenError(data.error || `Failed to retrieve document (${res.status})`);
            }
        } catch (error) {
            setTokenError('Network error while attaching document.');
        } finally {
            setIsAttaching(false);
        }
    }, [token, tokenStatus, isAttaching]);


    return (
        <div className={`w-full rounded-[var(--radius-xl)] bg-transparent`}>

            {/* HEADER METHOD CARDS */}
            <h2 className="text-[var(--font-xl)] font-bold text-[var(--irs-navy)] mb-6 text-center">
                {t('Upload Document')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('digilocker')}
                    className={`p-6 rounded-[var(--radius-lg)] border-2 transition-all flex flex-col items-center gap-3 shadow-sm ${activeTab === 'digilocker' ? 'border-[var(--irs-blue-mid)] bg-[var(--irs-blue-pale)] text-[var(--irs-navy)]' : 'border-[var(--irs-gray-200)] bg-white hover:bg-[var(--irs-gray-50)] text-[var(--irs-gray-600)]'}`}
                >
                    <DownloadCloud className={`w-8 h-8 ${activeTab === 'digilocker' ? 'text-[var(--irs-blue-mid)]' : 'text-[var(--irs-gray-400)]'}`} />
                    <span className="font-bold tracking-wide">{t('DigiLocker')}</span>
                </button>
                <button
                    onClick={() => setActiveTab('scanner')}
                    className={`p-6 rounded-[var(--radius-lg)] border-2 transition-all flex flex-col items-center gap-3 shadow-sm ${activeTab === 'scanner' ? 'border-[var(--irs-blue-mid)] bg-[var(--irs-blue-pale)] text-[var(--irs-navy)]' : 'border-[var(--irs-gray-200)] bg-white hover:bg-[var(--irs-gray-50)] text-[var(--irs-gray-600)]'}`}
                >
                    <ScanLine className={`w-8 h-8 ${activeTab === 'scanner' ? 'text-[var(--irs-blue-mid)]' : 'text-[var(--irs-gray-400)]'}`} />
                    <span className="font-bold tracking-wide">{t('Scanner')}</span>
                </button>
                <button
                    onClick={() => setActiveTab('token')}
                    className={`p-6 rounded-[var(--radius-lg)] border-2 transition-all flex flex-col items-center gap-3 shadow-sm ${activeTab === 'token' ? 'border-[var(--irs-blue-mid)] bg-[var(--irs-blue-pale)] text-[var(--irs-navy)]' : 'border-[var(--irs-gray-200)] bg-white hover:bg-[var(--irs-gray-50)] text-[var(--irs-gray-600)]'}`}
                >
                    <KeyRound className={`w-8 h-8 ${activeTab === 'token' ? 'text-[var(--irs-blue-mid)]' : 'text-[var(--irs-gray-400)]'}`} />
                    <span className="font-bold tracking-wide">{t('Web Token')}</span>
                </button>
            </div>

            {/* TAB CONTENT IN A UNIFIED CARD */}
            <div className="p-8 min-h-[400px] flex flex-col justify-center bg-white border border-[var(--irs-gray-200)] rounded-[var(--radius-xl)] shadow-sm">
                <AnimatePresence mode="wait">

                    {/* --- TAB 1: DIGILOCKER --- */}
                    {activeTab === 'digilocker' && (
                        <motion.div key="dl" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-md mx-auto w-full space-y-6">

                            <div className="text-center mb-10">
                                <h3 className="text-[var(--font-lg)] font-bold text-[var(--irs-navy)]">{t('Fetch from DigiLocker')}</h3>
                                <p className="text-[var(--font-sm)] text-[var(--irs-gray-600)] mt-2 font-medium">{t('Securely import verified government documents.')}</p>
                            </div>

                            {dlStatus === 'idle' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="kiosk-label text-center block mb-4">{t('AADHAAR NUMBER')}</label>
                                        <input
                                            type="text"
                                            placeholder="XXXX XXXX XXXX"
                                            maxLength={12}
                                            value={aadhaar}
                                            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                                            className="kiosk-input text-center tracking-widest font-mono text-[var(--font-xl)]"
                                        />
                                    </div>
                                    <button className="btn-primary w-full h-[64px]" disabled={aadhaar.length !== 12} onClick={handleDigiLockerRequest}>
                                        {t('Request OTP')}
                                    </button>
                                </div>
                            )}

                            {dlStatus === 'otp' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <div className="kiosk-banner warning">
                                        <Smartphone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <p>An OTP has been sent to your Aadhaar-linked mobile number finishing in <strong className="font-bold">*8912</strong>.</p>
                                    </div>
                                    <div>
                                        <label className="kiosk-label text-center block mb-4">{t('ENTER 6-DIGIT OTP')}</label>
                                        <input
                                            type="text" placeholder="------" maxLength={6}
                                            className="kiosk-input text-center tracking-[1em] font-mono text-[var(--font-xl)]"
                                        />
                                    </div>
                                    <button className="btn-primary w-full h-[64px]" onClick={handleDigiLockerOTP}>{t('Verify & Fetch')}</button>
                                </motion.div>
                            )}

                            {dlStatus === 'loading' && (
                                <div className="py-12 flex flex-col items-center justify-center text-[var(--irs-blue-mid)] space-y-4">
                                    <RefreshCcw className="w-10 h-10 animate-spin" />
                                    <p className="font-bold animate-pulse text-[var(--font-lg)]">Connecting to DigiLocker...</p>
                                </div>
                            )}

                            {dlStatus === 'success' && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                    <div className="kiosk-banner success flex justify-center text-[var(--font-md)]">
                                        <CheckCircle2 className="w-6 h-6 shrink-0" />
                                        <strong>Account Linked Successfully</strong>
                                    </div>
                                    <p className="kiosk-label">{t('SELECT DOCUMENTS TO ATTACH')}:</p>
                                    <div className="space-y-3">
                                        {MOCK_DIGILOCKER_DOCS.map(doc => (
                                            <div
                                                key={doc.id}
                                                onClick={() => toggleDocSelection(doc.id)}
                                                className={`p-4 border-2 rounded-[var(--radius-lg)] cursor-pointer transition-colors flex items-center justify-between ${selectedDocs.includes(doc.id) ? 'border-[var(--irs-blue-mid)] bg-[var(--irs-blue-pale)]' : 'border-[var(--irs-gray-200)] hover:bg-[var(--irs-gray-50)]'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <FileText className={`w-8 h-8 ${selectedDocs.includes(doc.id) ? 'text-[var(--irs-blue-mid)]' : 'text-[var(--irs-gray-400)]'}`} />
                                                    <div>
                                                        <p className="font-bold text-[var(--font-md)] text-[var(--irs-navy)]">{doc.name}</p>
                                                        <p className="text-[var(--font-xs)] text-[var(--irs-gray-600)] font-medium">{doc.type} • Updated {doc.date}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedDocs.includes(doc.id) ? 'border-[var(--irs-blue-mid)] bg-[var(--irs-blue-mid)] text-white' : 'border-[var(--irs-gray-300)] bg-white'}`}>
                                                    {selectedDocs.includes(doc.id) && <CheckCircle2 className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="btn-primary w-full h-[64px]" disabled={selectedDocs.length === 0} onClick={() => alert('Documents attached!')}>
                                        Attach {selectedDocs.length} Document{selectedDocs.length !== 1 && 's'}
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* --- TAB 2: SCANNER --- */}
                    {activeTab === 'scanner' && (
                        <motion.div key="scan" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-md mx-auto w-full space-y-8 flex flex-col items-center">

                            <div className="text-center">
                                <h3 className="text-[var(--font-lg)] font-bold text-[var(--irs-navy)] mb-2">{t('Physical Scanner')}</h3>
                                <p className="text-[var(--font-sm)] text-[var(--irs-gray-600)] font-medium">Place your document face down on the glass scanner below.</p>
                            </div>

                            {/* SCANNER VISUAL */}
                            <div className="relative w-full aspect-video bg-[var(--irs-gray-100)] rounded-[var(--radius-lg)] overflow-hidden shadow-inner border-2 border-[var(--irs-gray-300)]">
                                {scanStatus === 'scanning' && (
                                    <motion.div
                                        className="absolute top-0 bottom-0 w-1.5 bg-[var(--irs-success)] shadow-[0_0_20px_rgba(40,167,69,0.8)] z-10"
                                        initial={{ left: '0%' }}
                                        animate={{ left: '100%' }}
                                        transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                                    />
                                )}
                                {(scanStatus === 'scanning' || scanStatus === 'success') && (
                                    <div className="absolute inset-4 bg-white shadow-sm border p-4 opacity-50 flex flex-col gap-2">
                                        <div className="h-4 bg-[var(--irs-gray-200)] rounded w-1/3" />
                                        <div className="h-4 bg-[var(--irs-gray-200)] rounded w-1/2" />
                                        <div className="h-24 bg-[var(--irs-gray-200)] rounded w-24 mt-4" />
                                    </div>
                                )}
                                {scanStatus === 'idle' && (
                                    <div className="absolute inset-0 flex items-center justify-center text-[var(--irs-gray-500)] flex-col gap-2">
                                        <Camera className="w-12 h-12 mb-2 opacity-50" />
                                        <span className="font-bold uppercase tracking-widest">{t('Ready to Scan')}</span>
                                    </div>
                                )}
                            </div>

                            {scanStatus === 'idle' && (
                                <button className="btn-primary w-full max-w-xs h-[64px]" onClick={startScan}>
                                    <ScanLine className="w-6 h-6 mr-2 inline-block -mt-1" /> {t('Start Scan')}
                                </button>
                            )}

                            {scanStatus === 'scanning' && (
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-[var(--font-sm)] font-bold text-[var(--irs-success)]">
                                        <span>{t('Scanning in progress...')}</span>
                                        <span>{scanProgress}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-[var(--irs-gray-200)] rounded-full overflow-hidden">
                                        <div className="h-full bg-[var(--irs-success)] transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {scanStatus === 'success' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-6 text-left">
                                    <div className="kiosk-banner success">
                                        <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                                        <div>
                                            <strong>{t('Scan Complete')}</strong><br/>
                                            {t('Document OCR successful.')}
                                        </div>
                                    </div>
                                    <div className="bg-[var(--irs-gray-100)] text-[var(--irs-gray-800)] border border-[var(--irs-gray-300)] p-5 rounded-[var(--radius-lg)] font-mono text-[var(--font-sm)] leading-relaxed">
                                        <p className="text-[var(--irs-gray-500)] text-xs mb-3 font-bold tracking-widest">--- EXTRACTED TEXT ---</p>
                                        <p><strong>NAME:</strong> RAMESH KUMAR</p>
                                        <p><strong>DOC ID:</strong> PAN-XXXX-8912</p>
                                        <p><strong>DOB:</strong> 12/05/1980</p>
                                        <p><strong>VALID UPTO:</strong> N/A</p>
                                        <p className="text-[var(--irs-gray-500)] text-xs mt-3 font-bold tracking-widest">--- END OF OCR ---</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="btn-secondary w-full h-[64px]" onClick={() => setScanStatus('idle')}>{t('Rescan')}</button>
                                        <button className="btn-primary w-full h-[64px]" onClick={() => alert('Attached scanned file!')}>{t('Attach File')}</button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* --- TAB 3: WEB TOKEN --- */}
                    {activeTab === 'token' && (
                        <motion.div key="token" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-2xl mx-auto w-full space-y-8">

                            <div className="text-center mb-10">
                                <h3 className="text-[var(--font-lg)] font-bold text-[var(--irs-navy)]">{t('Import via Web Token')}</h3>
                                <p className="text-[var(--font-sm)] text-[var(--irs-gray-600)] mt-2 font-medium">Already uploaded files from your phone? Enter the 6-character retrieval token below.</p>
                            </div>

                            {/* PRIORITY 1: Show document preview if document is loaded */}
                            {documentLoaded && documentUrl && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 max-w-2xl mx-auto">
                                    <div className="kiosk-banner success flex justify-center text-[var(--font-md)]">
                                        <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                                        <div className="font-bold">
                                            {t('Document Attached Successfully')}<br/>
                                            <span className="font-normal text-[var(--font-sm)]">{tokenData?.fileName}</span>
                                        </div>
                                    </div>

                                    {/* Document Preview */}
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-[var(--irs-blue-mid)] rounded-[var(--radius-lg)] overflow-hidden bg-white mt-6" data-preview-section="true">
                                        {tokenData?.mimeType?.startsWith('image/') ? (
                                            <div className="w-full bg-[var(--irs-gray-50)] flex items-center justify-center">
                                                <img
                                                    src={documentUrl}
                                                    alt={tokenData?.fileName}
                                                    className="w-full max-h-96 object-contain"
                                                    style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
                                                    onError={(e) => {
                                                        const img = e.target as HTMLImageElement;
                                                        img.style.display = 'none';
                                                    }}
                                                    onLoad={() => {}}
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-8 flex flex-col items-center justify-center gap-4 bg-[var(--irs-gray-50)] min-h-96">
                                                <FileText className="w-16 h-16 text-[var(--irs-blue-mid)]" />
                                                <div className="text-center">
                                                    <p className="font-bold text-[var(--font-md)]">{tokenData?.fileName}</p>
                                                    <p className="text-[var(--font-sm)] text-[var(--irs-gray-500)]">{tokenData?.mimeType}</p>
                                                    <a
                                                        href={documentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[var(--irs-blue-mid)] underline mt-3 inline-block font-bold hover:text-[var(--irs-blue-dark)]"
                                                    >
                                                        {t('Open in new tab')} →
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>

                                    <div className="flex gap-4 mt-8">
                                        <button 
                                            className="btn-secondary w-full h-[64px]" 
                                            onClick={() => { 
                                                setTokenStatus('idle'); 
                                                setToken(''); 
                                                setDocumentLoaded(false); 
                                                setDocumentUrl(null);
                                                setTokenError('');
                                            }}>
                                            {t('Upload Another')}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* PRIORITY 2: Show token verified UI if token data exists (but document not yet loaded) */}
                            {!documentLoaded && tokenData && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 max-w-2xl mx-auto">
                                    <div className="kiosk-banner success flex justify-center text-[var(--font-md)]">
                                        <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                                        <div className="font-bold">
                                            {t('Token Verified')}<br/>
                                            <span className="font-normal text-[var(--font-sm)]">{tokenData.message}</span>
                                        </div>
                                    </div>

                                    <div className="bg-[var(--irs-gray-50)] border-2 border-[var(--irs-gray-200)] rounded-[var(--radius-lg)] p-5 flex items-center gap-5">
                                        <div className="w-14 h-14 bg-white rounded shadow-sm flex items-center justify-center border border-[var(--irs-gray-200)] shrink-0">
                                            <FileText className="w-8 h-8 text-[var(--irs-gray-400)]" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-bold text-[var(--font-md)] text-[var(--irs-navy)] truncate">{tokenData.fileName}</p>
                                            <p className="text-[var(--font-sm)] text-[var(--irs-gray-500)] font-medium mt-1">{tokenData.mimeType} • {(tokenData.fileSize / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <button className="btn-secondary w-full h-[64px]" onClick={() => { setTokenStatus('idle'); setToken(''); setDocumentLoaded(false); setDocumentUrl(null); }}>
                                            {t('Use Another')}
                                        </button>
                                        <button className="btn-primary w-full h-[64px]" onClick={handleConfirmAttach} disabled={isAttaching}>
                                            {isAttaching ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <RefreshCcw className="w-5 h-5 animate-spin" />
                                                    {t('Attaching...')}
                                                </span>
                                            ) : (
                                                t('Confirm & Attach')
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* PRIORITY 3: Show token input UI if no token data available */}
                            {!tokenData && (
                                <div className="space-y-6 max-w-lg mx-auto">
                                    <label className="kiosk-label text-center block mb-4">{t('6-CHAR SECURE TOKEN')}</label>
                                    
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="text"
                                            placeholder="XXXXXX"
                                            maxLength={6}
                                            value={token}
                                            onChange={(e) => setToken(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                            className="kiosk-input tracking-[1em] font-mono text-[var(--font-xl)] text-center flex-1 h-[72px]"
                                        />
                                        <button
                                            className="btn-primary shrink-0 px-8 h-[72px]"
                                            disabled={token.length !== 6 || tokenStatus === 'loading'}
                                            onClick={handleTokenSubmit}
                                        >
                                            {tokenStatus === 'loading' ? <RefreshCcw className="w-6 h-6 animate-spin mx-auto" /> : t('Verify')}
                                        </button>
                                    </div>

                                    {tokenError && (
                                        <p className="text-[var(--irs-error)] text-[var(--font-sm)] font-bold text-center flex items-center justify-center gap-2 mt-4">
                                            <AlertTriangle className="w-5 h-5" /> {tokenError}
                                        </p>
                                    )}

                                    <div className="pt-6 border-t border-[var(--irs-gray-200)] mt-10 flex gap-3 text-[var(--font-sm)] text-[var(--irs-gray-600)] items-start">
                                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--irs-warning)]" />
                                        <p className="font-medium">Files expire automatically after 48 hours. They remain strictly encrypted until token redemption.</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
