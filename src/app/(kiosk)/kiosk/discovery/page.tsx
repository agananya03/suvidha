'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Building2, Zap, Flame, Droplets, Trash2, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import toast from 'react-hot-toast';
import { BackButton } from '@/components/kiosk/BackButton';
import { useKioskStore } from '@/store/useKioskStore';

export default function DiscoveryPage() {
    const router = useRouter();
    const { t } = useDynamicTranslation();
    const { setServices } = useKioskStore();
    const [address, setAddress] = useState('12 Civil Lines Nagpur');
    const [status, setStatus] = useState<'INPUT' | 'SEARCHING' | 'FOUND'>('INPUT');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [rememberedCitizen, setRememberedCitizen] = useState<{
        name: string;
        address: string;
        visitCount: number;
        lastVisitAt: number;
        verifiedVia: 'OTP' | 'Aadhaar eKYC';
    } | null>(null);
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [showRememberedCard, setShowRememberedCard] = useState(false);
    const [usedRemembered, setUsedRemembered] = useState(false);

    // Pre-fill address and speed up search in demo mode
    useEffect(() => {
        const { token } = useKioskStore.getState();
        if (token === 'demo-jwt-token-suvidha-2026') {
            setAddress('12 Civil Lines, Nagpur, Maharashtra');
        }
    }, []);

    useEffect(() => {
        const checkRemembered = async () => {
            try {
                const { getDb } = await import('@/lib/offlineDb');
                const kioskState = useKioskStore.getState();

                const isDemoMode =
                    kioskState.token === 'demo-jwt-token-suvidha-2026';

                if (isDemoMode) {
                    setRememberedCitizen({
                        name: 'Rahul Sharma',
                        address: '12 Civil Lines, Nagpur, Maharashtra',
                        visitCount: 3,
                        lastVisitAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
                        verifiedVia: 'OTP',
                    });
                    setShowRememberedCard(true);
                    return;
                }

                const mobile = kioskState.user?.mobile;
                if (!mobile) return;

                const db = await getDb();
                const citizen = await db.get('citizen', mobile).catch(() => null);
                if (!citizen) return;

                const verifiedVia = mobile.length === 10
                    ? 'OTP'
                    : 'Aadhaar eKYC';

                if (citizen.address || citizen.name) {
                    setRememberedCitizen({
                        name: citizen.name ?? 'Citizen',
                        address: citizen.address ?? '',
                        visitCount: citizen.visitCount ?? 1,
                        lastVisitAt: citizen.lastVisitAt ?? citizen.cachedAt,
                        verifiedVia,
                    });
                    setShowRememberedCard(true);
                }
            } catch {
                console.warn('[SUVIDHA] Could not check remembered citizen');
            }
        };

        checkRemembered();
    }, []);
    
    const [documentToken, setDocumentToken] = useState('');
    const [tokenDocument, setTokenDocument] = useState<{
        fileName: string;
        fileSize: number;
        serviceType: string | null;
        mimeType?: string;
    } | null>(null);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [documentLoaded, setDocumentLoaded] = useState(false);

    const services = [
        { id: 'S1', type: 'ELECTRICITY', name: 'MSEDCL Power', icon: Zap, consumerNo: 'MH-NP-2024-001247', amount: 1247.50, due: 'May 15', color: 'bg-yellow-100 text-yellow-600', border: 'border-yellow-200' },
        { id: 'S2', type: 'WATER', name: 'Nagpur Jal', icon: Droplets, consumerNo: 'WAT-7890-XX', amount: 450.00, due: 'May 18', color: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
        { id: 'S3', type: 'MUNICIPAL', name: 'NMC Prop Tax', icon: Building2, consumerNo: 'PTAX-2026-X8M', amount: 8400.00, due: 'Jun 30', color: 'bg-green-100 text-green-600', border: 'border-green-200' },
        { id: 'S4', type: 'GAS', name: 'MNGL Piped Gas', icon: Flame, consumerNo: 'MNGL-992-11A', amount: 620.00, due: 'May 12', color: 'bg-orange-100 text-orange-600', border: 'border-orange-200' },
    ];

    const handleSearch = () => {
        if (!address.trim()) return;
        setStatus('SEARCHING');
        const isDemo = useKioskStore.getState().token === 'demo-jwt-token-suvidha-2026';
        // Simulate Map normalisation & API fetch (800ms in demo, 3500ms normally)
        setTimeout(async () => {
            setStatus('FOUND');
            setSelectedServices(services.map(s => s.id)); // Auto-select all

            try {
                const { getDb } = await import('@/lib/offlineDb');
                const kioskState = useKioskStore.getState();
                const mobile = kioskState.user?.mobile ?? '9999999999';
                const db = await getDb();
                const existing = await db.get('citizen', mobile).catch(() => null);
                await db.put('citizen', {
                    mobile,
                    name: existing?.name ?? kioskState.user?.name ?? undefined,
                    address: address.trim(),
                    lastVisitAt: Date.now(),
                    visitCount: (existing?.visitCount ?? 0) + 1,
                    cachedAt: existing?.cachedAt ?? Date.now(),
                });
            } catch {
                console.warn('[SUVIDHA] Could not persist address');
            }
        }, isDemo ? 800 : 3500);
    };

    const handleUseRemembered = async () => {
        if (!rememberedCitizen) return;
        setIsAutoFilling(true);
        setShowRememberedCard(false);
        setUsedRemembered(true);

        const targetAddress = rememberedCitizen.address;
        setAddress('');

        for (let i = 0; i <= targetAddress.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 18));
            setAddress(targetAddress.slice(0, i));
        }

        setIsAutoFilling(false);
        await new Promise(resolve => setTimeout(resolve, 400));
        handleSearch();
    };

    const handleLinkAndContinue = () => {
        // Persist selected services into the kiosk store so dashboard can read them
        const linked = services
            .filter(s => selectedServices.includes(s.id))
            .map(s => ({ id: s.id, type: s.type, name: s.name }));
        setServices(linked);
        router.push('/kiosk/dashboard');
    };

    const handleTokenLookup = async () => {
        try {
            const res = await fetch(`/api/documents/token/${documentToken}`);
            if (res.ok) {
                const data = await res.json();
                setTokenDocument({
                    fileName: data.fileName,
                    fileSize: data.fileSize,
                    serviceType: data.serviceType,
                    mimeType: data.mimeType,
                });
                toast.success('Document loaded successfully');
            } else {
                toast.error('Token not found or expired');
            }
        } catch {
            toast.error('Could not verify token');
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28 flex flex-col items-center">
            {/* Back button — shown on INPUT and FOUND; hidden on SEARCHING (loading) */}
            {status === 'INPUT' && <BackButton onClick={() => router.back()} variant="light" />}
            {status === 'FOUND' && <BackButton onClick={() => setStatus('INPUT')} variant="light" />}

            <AnimatePresence mode="wait">

                {status === 'INPUT' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-3xl flex flex-col text-center"
                    >
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <MapPin className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">{t('Address-Based Service Discovery')}</h1>
                        <p className="text-blue-200 text-lg mb-6 max-w-lg mx-auto">
                            {t('Enter your address. Our AI will normalize the format and securely fetch all government service connections linked to this property.')}
                        </p>

                        <AnimatePresence>
                            {showRememberedCard && rememberedCitizen && status === 'INPUT' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -16, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    className="mb-4 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm text-left"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <motion.div
                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                transition={{ delay: 0.5, duration: 0.6 }}
                                                className="text-2xl mt-0.5"
                                            >
                                                👋
                                            </motion.div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-bold text-green-900 text-sm">
                                                        Welcome back, {rememberedCitizen.name}!
                                                    </p>
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium border border-green-200">
                                                        Visit #{rememberedCitizen.visitCount}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-green-700 mb-1">
                                                    Last visit:{' '}
                                                    {new Date(rememberedCitizen.lastVisitAt)
                                                        .toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-green-600">
                                                    <span>📍</span>
                                                    <span className="font-mono bg-green-100 px-2 py-0.5 rounded text-green-800">
                                                        {rememberedCitizen.address}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                                                        rememberedCitizen.verifiedVia === 'Aadhaar eKYC'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : 'bg-green-50 text-green-700 border-green-200'
                                                    }`}>
                                                        {rememberedCitizen.verifiedVia === 'Aadhaar eKYC'
                                                            ? '🪪 Verified via Aadhaar eKYC'
                                                            : '📱 Verified via OTP'
                                                        }
                                                    </span>
                                                    <span className="text-xs text-gray-400 italic">
                                                        Once-only principle
                                                    </span>
                                                </div>
                                                {rememberedCitizen.verifiedVia === 'Aadhaar eKYC' && (
                                                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                                        <span>🏛️</span>
                                                        <span>
                                                            Address sourced from UIDAI — government verified
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowRememberedCard(false)}
                                            className="text-green-400 hover:text-green-600 text-lg leading-none mt-0.5 flex-shrink-0"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={handleUseRemembered}
                                            disabled={isAutoFilling}
                                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isAutoFilling ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Filling in your details...
                                                </>
                                            ) : (
                                                <>⚡ Use my saved address</>
                                            )}
                                        </motion.button>
                                        <button
                                            onClick={() => setShowRememberedCard(false)}
                                            className="px-4 py-2.5 text-sm text-green-700 border border-green-200 rounded-xl hover:bg-green-50 transition-colors"
                                        >
                                            Enter new address
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isAutoFilling && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-green-600 font-medium mb-1 flex items-center justify-center gap-1"
                            >
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Restoring your saved address...
                            </motion.p>
                        )}

                        <div className="bg-white rounded-2xl p-2 shadow-xl border-2 border-white/40 flex items-center gap-2 max-w-xl mx-auto mb-8">
                            <input
                                type="text"
                                className="flex-1 bg-transparent px-5 py-4 text-xl text-[#0A1628] font-medium outline-none min-h-[60px] placeholder:text-[#4A6FA5]"
                                placeholder="E.g., 12 Civil Lines Nagpur"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Search className="w-6 h-6" />
                            </div>
                        </div>

                        <Button
                            className="bg-[#004085] hover:bg-[#002868] text-white px-6 py-4 rounded-xl font-bold text-lg min-h-[56px] transition-all"
                            onClick={handleSearch}
                            disabled={address.length < 5}
                            data-speech-label={t('Search utilities by address')}
                        >
                            {t('Connect Linked Utilities')} <ArrowRight className="w-6 h-6 ml-2" />
                        </Button>
                    </motion.div>
                )}

                {status === 'SEARCHING' && (
                    <motion.div
                        key="searching"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-3xl mt-20 flex flex-col items-center justify-center"
                    >
                        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                            {/* Map normalisation animation mock */}
                            <motion.div
                                className="absolute inset-0 border-4 border-dashed border-primary rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute inset-2 border-4 border-dashed border-blue-400 rounded-full opacity-60"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center z-10 border-4 border-primary">
                                <Building2 className="w-10 h-10 text-primary animate-pulse" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-gray-800 mb-2">{t('Connecting to utility databases...')}</h2>
                        <p className="text-xl text-gray-500">{t('Normalizing address formats via Bhuvan AI')}</p>

                        <div className="mt-12 w-full max-w-md bg-gray-200 h-2 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3.5 }}
                            />
                        </div>
                    </motion.div>
                )}

                {status === 'FOUND' && (
                    <motion.div
                        key="found"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-5xl mt-8"
                    >
                        <div className="bg-transparent">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-sm mb-4">
                                        <ShieldCheck className="w-4 h-4" /> {t('Address Verified')}
                                    </div>
                                    <h2 className="text-3xl font-black text-white mb-2">{t('4 Utility Connections Found')}</h2>
                                    <p className="text-blue-200 text-lg flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> 12 Civil Lines, Nagpur, MH 440001
                                    </p>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <p className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-1">{t('Total Outstanding')}</p>
                                    <p className="text-4xl font-black text-white">₹{services.reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            {usedRemembered && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-left"
                                >
                                    <span className="text-green-600 text-lg">✓</span>
                                    <div>
                                        <span className="font-bold text-green-900">
                                            4 services auto-discovered
                                        </span>
                                        <span className="text-green-700">
                                            {' '}— linked from your last visit. No re-entry needed.
                                        </span>
                                    </div>
                                    <span className="ml-auto text-xs text-green-500 italic">
                                        Once-only principle
                                    </span>
                                </motion.div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                {services.map((service, idx) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => {
                                            if (selectedServices.includes(service.id)) {
                                                setSelectedServices(prev => prev.filter(id => id !== service.id));
                                            } else {
                                                setSelectedServices(prev => [...prev, service.id]);
                                            }
                                        }}
                                        data-speech-label={`${service.name} ${service.consumerNo}`}
                                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedServices.includes(service.id)
                                                ? `border-primary bg-blue-50/30 shadow-md transform scale-[1.02]`
                                                : `border-gray-200 hover:border-blue-300 opacity-70`
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${service.color}`}>
                                                <service.icon className="w-7 h-7" />
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-bold text-[#0A1628]">{service.name}</h3>
                                                <p className="font-mono text-sm text-[#4A6FA5] font-bold">{service.consumerNo}</p>
                                                <div className="flex justify-between items-end mt-4">
                                                    <div>
                                                        <p className="text-sm text-[#4A6FA5]">{t('Due Date')}</p>
                                                        <p className="font-semibold">{service.due}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-[#004085]">₹{service.amount.toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Custom Checkbox */}
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedServices.includes(service.id) ? 'bg-[#004085] border-[#004085] text-white' : 'border-[#BEE3F8] bg-white'
                                                }`}>
                                                {selectedServices.includes(service.id) && <ShieldCheck className="w-4 h-4 outline-none" />}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-5 mt-4 mb-6 text-white">
                                <h3 className="font-bold text-white mb-2 text-xl">
                                    📎 Have a pre-upload token?
                                </h3>
                                <p className="text-lg text-blue-100 mb-3">
                                    Enter the 6-character token from your WhatsApp to load your document
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. A7X3K9"
                                        maxLength={6}
                                        value={documentToken}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && documentToken.length === 6) {
                                                e.preventDefault();
                                                handleTokenLookup();
                                            }
                                        }}
                                        onChange={(e) => {
                                            setDocumentToken(e.target.value.toUpperCase());
                                            setTokenDocument(null);
                                            setDocumentUrl(null);
                                            setDocumentLoaded(false);
                                        }}
                                        className="bg-white border-2 border-[#90CDF4] rounded-xl px-5 py-4 text-xl font-mono min-h-[60px] text-[#0A1628] focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] uppercase flex-1 outline-none"
                                    />
                                    <button type="button" className="bg-[#004085] hover:bg-[#002868] text-white px-6 py-4 rounded-xl font-bold min-h-[60px] disabled:opacity-50 transition-all" onClick={handleTokenLookup} disabled={documentToken.length !== 6} data-speech-label={t('Load document token')}>
                                        Load
                                    </button>
                                </div>
                                {tokenDocument && (
  <div className="mt-3 space-y-3">
    <div className="flex items-center gap-2 p-3 bg-green-50
                    rounded-xl border border-green-200">
      <span className="text-xl">✅</span>
      <div className="flex-1">
        <p className="font-medium text-green-900">{tokenDocument.fileName}</p>
        <p className="text-xs text-green-700">
          {(tokenDocument.fileSize / 1024).toFixed(1)} KB ·
          Uploaded via WhatsApp · Expires in 48 hrs
        </p>
      </div>
    </div>

    {!documentLoaded && (
                      <Button type="button" className="w-full" data-speech-label={t('Confirm and load document')} onClick={async () => {
                        const res = await fetch(
                          `/api/documents/retrieve/${documentToken}`,
                          { method: 'POST' }
                        );
                        if (res.ok) {
                          const data = await res.json() as { cloudinaryUrl: string };
                          setDocumentUrl(data.cloudinaryUrl);
                          setDocumentLoaded(true);
                        }
                      }}>
                        ✅ Confirm & Load Document
                      </Button>
                    )}

    {documentLoaded && documentUrl && (
      <div className="border rounded-xl overflow-hidden">
        {tokenDocument.mimeType?.startsWith('image/') ? (
          <img
            src={documentUrl}
            alt={tokenDocument.fileName}
            className="w-full max-h-64 object-contain bg-gray-50"
          />
        ) : (
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-4 bg-gray-50
                       hover:bg-gray-100 text-blue-600 font-medium"
          >
            📄 Open {tokenDocument.fileName}
          </a>
        )}
      </div>
    )}
  </div>
)}
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-100">
                                <Button
                                    size="lg"
                                    className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full"
                                    onClick={() => {
                                        router.push('/kiosk/dashboard');
                                    }}
                                    data-speech-label={t('Confirm and link services')}
                                >
                                    {t('Confirm & Link Selected')} ({selectedServices.length})
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
