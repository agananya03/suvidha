/// <reference lib="webworker" />
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Zap, Flame, Droplets, Trash2, HelpCircle,
    Mic, Image as ImageIcon, Send, Clock,
    AlertTriangle, Lightbulb, CheckCircle2, Smartphone, ShieldCheck, Camera, Copy
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import debounce from 'lodash.debounce';

import { webSpeech } from '@/lib/webSpeech';
import { useStore } from '@/lib/store';
import { useKioskStore } from '@/store/useKioskStore';
import { DemoDataBadge } from '@/components/ui/EmptyState';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

type ServiceType = 'ELECTRICITY' | 'GAS' | 'WATER' | 'MUNICIPAL' | 'OTHER';

interface DNAAnalysis {
    departments: string[];
    primaryDepartment: string;
    isMultiDepartment: boolean;
    priority: number;
    priorityLabel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    queuePosition: number;
    slaDays: number;
    matchedKeywords: { word: string; department: string; weight: number }[];
    urgencyFlags: string[];
    complaintDNA: string;
}

export default function ComplaintPage() {
    const router = useRouter();
    const { language } = useStore();
    const { t } = useDynamicTranslation();
    const { isOnline } = useOnlineStatus();

    const [serviceType, setServiceType] = useState<ServiceType | null>(null);
    const [description, setDescription] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    const [qsmellGas, setQSmellGas] = useState<'yes' | 'no' | null>(null);
    const [qPowerOutage, setQPowerOutage] = useState<'flickering' | 'out' | null>(null);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [dnaAnalysis, setDnaAnalysis] = useState<DNAAnalysis | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{
        ticketId: string;
        department: string;
        priorityLabel: string;
        slaDays: number;
        queuePosition: number;
    } | null>(null);
    const [copied, setCopied] = useState(false);
    const user = useKioskStore(state => state.user);
    const { voiceMode } = useStore();

    // --- LOCAL OFFLINE DNA FALLBACK --- //
    const analyzeOffline = (text: string, type: ServiceType | null): DNAAnalysis => {
        const lower = text.toLowerCase();
        const KEYWORDS: Record<string, string[]> = {
            ELECTRICITY: ['power', 'electricity', 'light', 'wire', 'voltage', 'outage', 'spark', 'meter', 'electric', 'current', 'flickering'],
            GAS: ['gas', 'leak', 'smell', 'lpg', 'cylinder', 'pipeline', 'flame', 'burner'],
            WATER: ['water', 'pipe', 'tap', 'drainage', 'sewage', 'flood', 'leak', 'supply', 'pump', 'bore'],
            MUNICIPAL: ['road', 'pothole', 'garbage', 'waste', 'drain', 'street', 'lamp', 'park', 'sanitation', 'dust', 'cleaning'],
        };

        const matched: { word: string; department: string; weight: number }[] = [];
        const deptScores: Record<string, number> = {};

        for (const [dept, words] of Object.entries(KEYWORDS)) {
            for (const word of words) {
                if (lower.includes(word)) {
                    matched.push({ word, department: dept, weight: 1 });
                    deptScores[dept] = (deptScores[dept] || 0) + 1;
                }
            }
        }

        const sorted = Object.entries(deptScores).sort((a, b) => b[1] - a[1]);
        const primaryDepartment = sorted[0]?.[0] || type || 'GENERAL';
        const isMultiDepartment = sorted.length > 1 && sorted[1][1] >= sorted[0][1] * 0.5;
        const departments = sorted.map(([d]) => d);

        const urgencyWords = ['urgent', 'emergency', 'immediately', 'dangerous', 'critical', 'fire', 'explode', 'dead'];
        const hasUrgency = urgencyWords.some(w => lower.includes(w));
        const priority = hasUrgency ? 9 : Math.min(sorted[0]?.[1] ? sorted[0][1] + 3 : 4, 8);
        const priorityLabel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = priority >= 9 ? 'CRITICAL' : priority >= 7 ? 'HIGH' : priority >= 5 ? 'MEDIUM' : 'LOW';

        return {
            departments,
            primaryDepartment,
            isMultiDepartment,
            priority,
            priorityLabel,
            queuePosition: Math.floor(Math.random() * 30) + 10,
            slaDays: priorityLabel === 'CRITICAL' ? 1 : priorityLabel === 'HIGH' ? 3 : 7,
            matchedKeywords: matched,
            urgencyFlags: hasUrgency ? ['Urgent language detected'] : [],
            complaintDNA: `Local analysis — ${primaryDepartment} route (offline mode)`,
        };
    };

    // --- DEBOUNCED DNA ANALYSIS --- //
    const analyzeText = useCallback(
        debounce(async (text: string) => {
            if (text.length < 5) return;
            setIsAnalyzing(true);
            try {
                const res = await fetch('/api/complaints/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description: text, type: serviceType }),
                    signal: AbortSignal.timeout(4000),
                });
                if (res.ok) {
                    const data = await res.json();
                    setDnaAnalysis(data);
                } else {
                    setDnaAnalysis(analyzeOffline(text, serviceType));
                }
            } catch {
                setDnaAnalysis(analyzeOffline(text, serviceType));
            } finally {
                setIsAnalyzing(false);
            }
        }, 500),
        [serviceType]
    );

    useEffect(() => {
        analyzeText(description);
        return () => analyzeText.cancel();
    }, [description, analyzeText]);

    // --- SPEECH RECOGNITION (WEB SPEECH API) --- //
    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setDescription(prev => prev + ' ' + finalTranscript);
                }
            };

            recognitionRef.current.onend = () => setIsRecording(false);
        }
    }, [language]);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in your browser.");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const renderHighlightedText = () => {
        if (!dnaAnalysis || !description) return description;
        const words = dnaAnalysis.matchedKeywords.map(k => k.word).sort((a, b) => b.length - a.length);
        if (words.length === 0) return description;

        const regex = new RegExp(`(${words.join('|')})`, 'gi');
        const parts = description.split(regex);

        return parts.map((part, i) => {
            const lowerPart = part.toLowerCase();
            const match = dnaAnalysis.matchedKeywords.find(k => k.word.toLowerCase() === lowerPart);

            if (match) {
                let colorClass = 'bg-[var(--irs-gray-200)] text-[var(--irs-gray-800)]';
                if (match.department === 'ELECTRICITY') colorClass = 'bg-[#fef0d9] text-[#b45309]';
                if (match.department === 'GAS') colorClass = 'bg-[#ffedd5] text-[#c2410c]';
                if (match.department === 'MUNICIPAL') colorClass = 'bg-[#dcfce7] text-[#15803d]';

                return <span key={i} className={`${colorClass} px-1 rounded mx-0.5 font-bold`}>{part}</span>;
            }
            return part;
        });
    };

    const queueComplaintLocally = async (payload: { serviceType: string; description: string; dnaAnalysis: unknown; }) => {
        const { queueAction } = await import('@/lib/offlineDb');
        const { createSignedSyncItem } = await import('@/lib/offlineCrypto');
        const signedItem = await createSignedSyncItem('complaint', payload);
        await queueAction(signedItem);
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const sw = await navigator.serviceWorker.ready;
            // @ts-expect-error
            sw.sync.register('sync-complaints').catch(() => {});
        }
        return { queued: true as const };
    };

    const submitComplaintWithOfflineFallback = async (payload: { serviceType: string; description: string; dnaAnalysis: unknown; }) => {
        if (!isOnline || !navigator.onLine) {
            return queueComplaintLocally(payload);
        }

        const submitPromise = fetch('/api/complaints/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(async (res) => {
            if (!res.ok) throw new Error('Server error');
            return res.json();
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 3000)
        );

        try {
            return await Promise.race([submitPromise, timeoutPromise]);
        } catch {
            return queueComplaintLocally(payload);
        }
    };

    const handleSubmit = async () => {
        if (description.length < 20) return;
        setIsSubmitting(true);
        try {
            const payload = {
                description,
                type: serviceType,
                primaryDepartment: dnaAnalysis?.primaryDepartment || 'GENERAL',
                secondaryDepartment: dnaAnalysis?.isMultiDepartment ? dnaAnalysis.departments[1] : null,
                priority: dnaAnalysis?.priority || 5,
                queuePosition: dnaAnalysis?.queuePosition || 100,
                slaDeadline: dnaAnalysis?.slaDays ? new Date(Date.now() + dnaAnalysis.slaDays * 86400000).toISOString() : undefined
            };

            const result = await submitComplaintWithOfflineFallback({
                serviceType: serviceType || 'OTHER',
                description,
                dnaAnalysis: dnaAnalysis || null
            });

            if (result.queued) {
                const { suvidhaToast } = await import('@/lib/toast');
                suvidhaToast.success('Complaint saved — will submit automatically when connected.');
                router.push('/kiosk/queue');
            } else if (result.complaint?.ticketId) {
                const ticketId = result.complaint.ticketId;
                setSubmittedTicket(ticketId);
                setSuccessData({
                    ticketId,
                    department: dnaAnalysis?.primaryDepartment || 'GENERAL',
                    priorityLabel: dnaAnalysis?.priorityLabel || 'MEDIUM',
                    slaDays: dnaAnalysis?.slaDays || 7,
                    queuePosition: dnaAnalysis?.queuePosition || 0,
                });
                if (useStore.getState().voiceMode) {
                    webSpeech.speak(`Complaint filed successfully. Your ticket number is ${ticketId}. You will receive WhatsApp updates.`);
                }
            } else {
                alert("Failed to submit complaint.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit complaint.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPriorityColor = (label?: string) => {
        switch (label) {
            case 'CRITICAL': return 'bg-[#d54309] text-white';
            case 'HIGH': return 'bg-[#e5a000] text-black';
            case 'MEDIUM': return 'bg-[var(--irs-blue-light)] text-[var(--irs-navy)]';
            default: return 'bg-[var(--irs-success)] text-white';
        }
    };

    if (submittedTicket && successData) {
        const handleCopy = () => {
            navigator.clipboard.writeText(submittedTicket).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        };

        const timelineSteps = [
            { label: t('Complaint Received'), status: 'done', note: '' },
            { label: t('Assigned to Officer'), status: 'pending', note: t('Within 24 hours') },
            { label: t('Investigation Begins'), status: 'pending', note: t(`Within ${successData.slaDays} days`) },
        ];

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28"
            >
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* ── Top: Confirmation stamp ── */}
                    <div className="text-center pt-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                            className="w-24 h-24 bg-[var(--irs-success)] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                        >
                            <CheckCircle2 className="w-12 h-12" strokeWidth={2.5} />
                        </motion.div>
                        <h1 className="text-[var(--font-2xl)] font-bold text-[var(--irs-navy)] mb-2">
                            {t('Complaint Filed Successfully!')}
                        </h1>
                        <p className="text-[var(--font-md)] text-[var(--irs-gray-600)] max-w-lg mx-auto">
                            {t('Your complaint has been registered with the government grievance system')}
                        </p>
                    </div>

                    {/* ── Ticket card ── */}
                    <div className="bg-white border border-[var(--irs-gray-200)] rounded-2xl p-6 shadow-sm space-y-4">
                        {/* Ticket ID + copy */}
                        <div className="flex items-center justify-between gap-4 bg-[var(--irs-blue-pale)] rounded-xl px-5 py-4">
                            <div>
                                <p className="kiosk-label mb-1">{t('Ticket ID')}</p>
                                <p className="text-[var(--font-xl)] font-mono font-bold text-[var(--irs-blue-mid)] tracking-widest">
                                    {submittedTicket}
                                </p>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--irs-blue-light)] bg-white text-[var(--irs-blue-mid)] font-bold text-[var(--font-sm)] hover:bg-[var(--irs-blue-light)] transition-colors"
                                data-speech-label="Copy ticket ID"
                            >
                                <Copy className="w-4 h-4" />
                                {copied ? t('Copied!') : t('Copy')}
                            </button>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-4 text-[var(--font-sm)]">
                            <div className="p-3 bg-[var(--irs-gray-100)] rounded-lg">
                                <p className="kiosk-label text-[var(--font-xs)] mb-1">{t('Department')}</p>
                                <p className="font-bold text-[var(--irs-navy)]">{t(successData.department)}</p>
                            </div>
                            <div className="p-3 bg-[var(--irs-gray-100)] rounded-lg">
                                <p className="kiosk-label text-[var(--font-xs)] mb-1">{t('Priority')}</p>
                                <span className={`text-[var(--font-xs)] font-bold px-2 py-0.5 rounded ${getPriorityColor(successData.priorityLabel)}`}>
                                    {successData.priorityLabel}
                                </span>
                            </div>
                            <div className="p-3 bg-[var(--irs-gray-100)] rounded-lg">
                                <p className="kiosk-label text-[var(--font-xs)] mb-1">{t('SLA Target')}</p>
                                <p className="font-bold text-[var(--irs-navy)]">
                                    {t(`Response within ${successData.slaDays} working days`)}
                                </p>
                            </div>
                            <div className="p-3 bg-[var(--irs-gray-100)] rounded-lg">
                                <p className="kiosk-label text-[var(--font-xs)] mb-1">{t('Queue Position')}</p>
                                <p className="font-bold text-[var(--irs-navy)]">
                                    #{successData.queuePosition} {t(`in ${successData.department} queue`)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Continue on Your Phone (QR handoff) ── */}
                    <div className="bg-[var(--irs-blue-pale)] border border-[var(--irs-blue-light)] rounded-2xl p-5">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* QR code */}
                            <div className="shrink-0 bg-white rounded-xl p-3 shadow-sm">
                                <QRCodeSVG
                                    value={`${typeof window !== 'undefined' ? window.location.origin : 'https://suvidha.gov.in'}/track/${submittedTicket}`}
                                    size={112}
                                    bgColor="#ffffff"
                                    fgColor="#003087"
                                    level="M"
                                />
                            </div>
                            {/* Explanation */}
                            <div className="text-center sm:text-left">
                                <p className="font-bold text-[var(--irs-navy)] text-[var(--font-md)] mb-1">
                                    {t('Continue on Your Phone')}
                                </p>
                                <p className="text-[var(--irs-blue-mid)] text-[var(--font-sm)] leading-relaxed">
                                    {t('Scan this QR code to track your complaint status from your phone. You can step away from the kiosk — your ticket is saved.')}
                                </p>
                                <p className="mt-2 text-[var(--font-xs)] text-[var(--irs-gray-600)] font-mono break-all">
                                    /track/{submittedTicket}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── WhatsApp notification banner ── */}
                    <div className="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-5">
                        <div className="bg-green-100 p-3 rounded-full shrink-0">
                            <Smartphone className="w-6 h-6 text-green-700" />
                        </div>
                        <div>
                            <p className="font-bold text-green-900 text-[var(--font-md)]">
                                {t('Updates will be sent to')} {user?.mobile ?? t('your registered number')}
                            </p>
                            <p className="text-green-700 text-[var(--font-sm)] mt-1">
                                {t("You'll receive a message when your complaint is assigned, investigated, and resolved")}
                            </p>
                        </div>
                    </div>

                    {/* ── What happens next timeline ── */}
                    <div className="bg-white border border-[var(--irs-gray-200)] rounded-2xl p-6 shadow-sm">
                        <h2 className="kiosk-label mb-5">{t('WHAT HAPPENS NEXT')}</h2>
                        <div className="flex flex-col md:flex-row gap-0 md:gap-0 relative">
                            {/* connector line (desktop) */}
                            <div className="hidden md:block absolute top-5 left-[calc(16.67%-1px)] right-[calc(16.67%-1px)] h-0.5 bg-[var(--irs-gray-200)] z-0" />
                            {timelineSteps.map((step, i) => (
                                <div key={i} className="flex md:flex-col items-start md:items-center md:flex-1 gap-4 md:gap-2 md:text-center relative z-10 mb-6 md:mb-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${
                                        step.status === 'done'
                                            ? 'bg-[var(--irs-success)] border-[var(--irs-success)] text-white'
                                            : 'bg-white border-[var(--irs-gray-300)] text-[var(--irs-gray-400)]'
                                    }`}>
                                        {step.status === 'done'
                                            ? <CheckCircle2 className="w-5 h-5" />
                                            : <span className="text-[var(--font-xs)] font-bold">{i + 1}</span>
                                        }
                                    </div>
                                    <div>
                                        <p className={`font-bold text-[var(--font-sm)] ${
                                            step.status === 'done' ? 'text-[var(--irs-success)]' : 'text-[var(--irs-gray-600)]'
                                        }`}>{step.label}</p>
                                        {step.note && <p className="text-[var(--font-xs)] text-[var(--irs-gray-500)] mt-0.5">{step.note}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Action buttons ── */}
                    <div className="flex flex-col sm:flex-row gap-3 pb-8">
                        <button className="btn-primary flex-1" onClick={() => router.push('/kiosk/queue')} data-speech-label={t('Track this complaint')}>
                            {t('Track This Complaint')}
                        </button>
                        <button className="btn-secondary flex-1" onClick={() => router.push('/kiosk/dashboard')} data-speech-label={t('Return to services')}>
                            {t('Return to Services')}
                        </button>
                    </div>

                </div>
            </motion.div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 w-full">

                {/* LEFT COLUMN: FORM */}
                <div className="flex-1 space-y-8">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-6">{t('Register Complaint')}</h1>
                        <p className="text-lg text-blue-200 font-medium mb-6 hidden">{t('Our AI routing system will automatically assign the correct departments.')}</p>
                    </div>

                    {/* Step 1: Service Type */}
                    <div className="bg-white p-8 rounded-[var(--radius-lg)] shadow-sm border border-[var(--irs-gray-200)]">
                        <h2 className="kiosk-label mb-4">{t('SELECT CATEGORY')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { id: 'ELECTRICITY', icon: Zap, label: 'Electricity' },
                                { id: 'GAS', icon: Flame, label: 'Gas' },
                                { id: 'WATER', icon: Droplets, label: 'Water' },
                                { id: 'MUNICIPAL', icon: Trash2, label: 'Municipal' },
                                { id: 'OTHER', icon: HelpCircle, label: 'Other' }
                            ].map(btn => (
                                <button
                                    key={btn.id}
                                    onClick={() => setServiceType(btn.id as ServiceType)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-[var(--radius-md)] border-2 transition-all ${serviceType === btn.id
                                        ? 'border-[var(--irs-blue-mid)] bg-[var(--irs-blue-pale)] text-[var(--irs-navy)]'
                                        : 'border-[var(--irs-gray-200)] bg-white hover:border-[var(--irs-blue-light)] hover:bg-[var(--irs-gray-100)]'
                                        }`}
                                    data-speech-label={t(btn.label)}
                                >
                                    <btn.icon className={`text-2xl w-8 h-8 ${serviceType === btn.id ? 'text-[#004085]' : 'text-[#0A1628]'}`} />
                                    <span className="text-lg font-bold text-[#0A1628]">{t(btn.label)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Smart Questionnaire */}
                    <AnimatePresence>
                        {serviceType === 'GAS' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-8 rounded-[var(--radius-lg)] shadow-sm border border-[var(--irs-gray-200)] overflow-hidden">
                                <h3 className="kiosk-label text-[var(--font-lg)] mb-4">{t('DO YOU CURRENTLY SMELL GAS IN THE VICINITY?')}</h3>
                                <div className="flex gap-4">
                                    <button className={qsmellGas === 'yes' ? 'btn-primary bg-[var(--irs-error)] border-[var(--irs-error)] text-white w-32' : 'btn-secondary w-32'} data-speech-label={t('Yes, smell gas')} onClick={() => { setQSmellGas('yes'); setDescription(prev => prev + " Strong smell of gas detected."); }}>{t('YES')}</button>
                                    <button className={qsmellGas === 'no' ? 'btn-primary w-32' : 'btn-secondary w-32'} data-speech-label={t('No, no smell')} onClick={() => setQSmellGas('no')}>{t('NO')}</button>
                                </div>
                                {qsmellGas === 'yes' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 kiosk-banner warning">
                                        <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                                        <div className="font-bold">
                                            {t('SAFETY WARNING: EVACUATE IMMEDIATELY. Do not use electrical switches. Call emergency services at 1906!')}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                        {serviceType === 'ELECTRICITY' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-8 rounded-[var(--radius-lg)] shadow-sm border border-[var(--irs-gray-200)] overflow-hidden">
                                <h3 className="kiosk-label text-[var(--font-lg)] mb-4">{t('IS THE POWER COMPLETELY OUT OR JUST FLICKERING?')}</h3>
                                <div className="flex gap-4">
                                    <button className={qPowerOutage === 'out' ? 'btn-primary' : 'btn-secondary'} data-speech-label={t('Power completely out')} onClick={() => { setQPowerOutage('out'); setDescription(prev => prev + " Power is completely out."); }}>{t('Completely Out')}</button>
                                    <button className={qPowerOutage === 'flickering' ? 'btn-primary' : 'btn-secondary'} data-speech-label={t('Power flickering')} onClick={() => { setQPowerOutage('flickering'); setDescription(prev => prev + " Power is flickering."); }}>{t('Flickering')}</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Step 3: Photo Upload (IRS Blue Pale styled) */}
                    <div className="bg-white p-8 rounded-[var(--radius-lg)] shadow-sm border border-[var(--irs-gray-200)]">
                        <h2 className="kiosk-label mb-4">{t('UPLOAD EVIDENCE (OPTIONAL)')}</h2>
                        <div className="w-full bg-[var(--irs-blue-pale)] border-2 border-dashed border-[var(--irs-blue-mid)] rounded-[var(--radius-lg)] p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--irs-blue-light)] transition-colors">
                            <Camera className="w-10 h-10 text-[var(--irs-blue-mid)] mb-3" />
                            <span className="font-bold text-[var(--font-md)] text-[var(--irs-navy)]">{t('Tap to take photo')}</span>
                            <span className="text-[var(--font-sm)] text-[var(--irs-gray-600)] font-medium mt-1">{t('or upload document supporting your complaint')}</span>
                        </div>
                    </div>

                    {/* Step 4: Description Form */}
                    <div className="bg-white p-8 rounded-[var(--radius-lg)] shadow-sm border border-[var(--irs-gray-200)]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[#0A1628] mb-3">{t('DESCRIBE THE ISSUE')}</h2>
                            
                            <button
                                onClick={toggleRecording}
                                className={`transition-all ${isRecording ? 'bg-[#FFF5F5] border-2 border-[#FEB2B2] text-[#9B1C1C] rounded-2xl px-6 py-4 min-h-[56px] animate-pulse flex items-center gap-3 text-lg font-semibold' : 'bg-white border-2 border-[#90CDF4] hover:bg-[#E8F4FD] text-[#004085] rounded-2xl px-6 py-4 min-h-[56px] flex items-center gap-3 text-lg font-semibold active:scale-95'}`}
                                data-speech-label={isRecording ? t('Stop recording') : t('Dictate using microphone')}
                            >
                                <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce' : ''}`} />
                                {isRecording ? t('Listening...') : t('Dictate')}
                            </button>
                        </div>

                        <textarea
                            className="bg-white border-2 border-[#90CDF4] rounded-xl px-5 py-4 text-xl text-[#0A1628] font-medium min-h-[140px] resize-none w-full placeholder:text-[#4A6FA5] focus:outline-none focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8]"
                            placeholder={t('Please describe the problem in detail. The smart routing system analyzes your text as you type...')}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <div className="flex items-center justify-between mt-2 text-[var(--font-sm)]">
                            <span className={`font-bold ${description.length < 20 ? 'text-[var(--irs-error)]' : 'text-[var(--irs-success)]'}`}>
                                {description.length}/500 {t('chars (Min 20 required)')}
                            </span>
                        </div>

                        {!isOnline && (
                            <div className="bg-[#FFFBEB] border-2 border-[#FBD38D] rounded-2xl p-4 text-[#7B4A0A] text-lg flex items-center gap-3 font-medium mt-4">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <div>
                                    <strong>Offline mode</strong> — complaint will be queued and submitted automatically when connected.
                                </div>
                            </div>
                        )}

                        <button
                            className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full mt-6"
                            disabled={description.length < 20 || isSubmitting}
                            onClick={handleSubmit}
                            data-speech-label={t('Submit complaint')}
                        >
                            {isSubmitting ? t('Routing Complaint...') : t('Submit Complaint')} <Send className="w-5 h-5 ml-2 inline-block" />
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: LIVE DNA PANEL */}
                <div className="w-full lg:w-[450px]">
                    <div className="bg-white rounded-2xl border-2 border-[#BEE3F8] shadow-lg p-6 sticky top-8">
                        
                        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[var(--irs-gray-200)]">
                            <h2 className="text-[var(--font-lg)] font-bold flex items-center gap-2 text-[var(--irs-navy)]">
                                <ShieldCheck className="w-6 h-6 text-[var(--irs-blue-mid)]" />
                                {t('AI Routing Preview')}
                            </h2>
                            {isAnalyzing && (
                                <span className="flex items-center gap-2 text-[var(--font-xs)] font-bold text-[var(--irs-blue-mid)] bg-[var(--irs-blue-pale)] px-3 py-1 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-[var(--irs-blue-mid)] animate-pulse"></span>
                                    {t('Analyzing...')}
                                </span>
                            )}
                        </div>

                        {!dnaAnalysis && description.length < 5 && (
                            <div className="text-center py-16 text-[var(--irs-gray-500)]">
                                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-[var(--irs-gray-300)]" />
                                <p className="font-medium px-4">{t('Start typing to see which department this will be assigned to...')}</p>
                            </div>
                        )}

                        <AnimatePresence>
                            {dnaAnalysis && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    
                                    <div className="bg-[#EBF8FF] text-[#1E4DB7] border border-[#90CDF4] px-4 py-3 rounded-xl mb-4">
                                        <p className="kiosk-label uppercase mb-2">{t('Calculated Routing')}</p>
                                        <div className="flex items-center gap-4">
                                            {dnaAnalysis.isMultiDepartment ? (
                                                <div className="w-12 h-12 rounded-full bg-[var(--irs-warning)] text-white flex items-center justify-center font-bold">MULTI</div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-[var(--irs-blue-mid)] text-white flex items-center justify-center font-bold">Single</div>
                                            )}
                                            <div>
                                                <p className="text-[var(--font-lg)] font-bold text-[var(--irs-navy)]">
                                                    {dnaAnalysis.isMultiDepartment ? t('Multi-Department') : t(dnaAnalysis.primaryDepartment)}
                                                </p>
                                                {dnaAnalysis.isMultiDepartment && (
                                                    <p className="text-[var(--font-sm)] font-bold text-[var(--irs-blue-mid)]">{dnaAnalysis.departments.join(' + ')}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[var(--irs-gray-100)] rounded-[var(--radius-lg)] border border-[var(--irs-gray-200)]">
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="kiosk-label">{t('Priority Classification')}</p>
                                            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${dnaAnalysis.priorityLabel === 'CRITICAL' || dnaAnalysis.priorityLabel === 'HIGH' ? 'bg-[#FFF5F5] text-[#9B1C1C] border border-[#FEB2B2]' : dnaAnalysis.priorityLabel === 'MEDIUM' ? 'bg-[#FFFBEB] text-[#7B4A0A] border border-[#FBD38D]' : 'bg-[#F0FFF4] text-[#1A6B35] border border-[#9AE6B4]'}`}>
                                                {dnaAnalysis.priorityLabel}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-[var(--irs-gray-300)] rounded-full overflow-hidden mt-3">
                                            <motion.div
                                                className={`h-full ${dnaAnalysis.priorityLabel === 'CRITICAL' ? 'bg-[#d54309]' : dnaAnalysis.priorityLabel === 'HIGH' ? 'bg-[#e5a000]' : dnaAnalysis.priorityLabel === 'MEDIUM' ? 'bg-[var(--irs-blue-mid)]' : 'bg-[var(--irs-success)]'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(dnaAnalysis.priority / 10) * 100}%` }}
                                                transition={{ type: "spring", stiffness: 50 }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white rounded-[var(--radius-lg)] border-2 border-[var(--irs-gray-200)] text-center shadow-sm">
                                            <p className="kiosk-label text-[var(--font-xs)]">{t('Est. Queue')}</p>
                                            <p className="text-5xl font-black text-[#004085]">#{dnaAnalysis.queuePosition}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-[var(--radius-lg)] border-2 border-[var(--irs-gray-200)] text-center shadow-sm">
                                            <p className="kiosk-label text-[var(--font-xs)]">{t('SLA Target')}</p>
                                            <div className="text-lg text-[#2C5282] mt-2 flex items-center justify-center">
                                                <Clock className="w-5 h-5" /> {dnaAnalysis.slaDays} {t('Days')}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 bg-white rounded-[var(--radius-lg)] border border-[var(--irs-gray-200)] text-[var(--font-sm)]">
                                        <p className="kiosk-label text-[var(--irs-gray-600)] mb-2">{t('System Audit (Keywords matched)')}</p>
                                        <p className="leading-relaxed">
                                            {renderHighlightedText()}
                                        </p>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    );
}
