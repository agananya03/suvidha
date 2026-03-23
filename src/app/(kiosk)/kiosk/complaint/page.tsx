/// <reference lib="webworker" />
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Zap, Flame, Droplets, Trash2, HelpCircle,
    Mic, Image as ImageIcon, Send, Clock,
    AlertTriangle, Lightbulb, CheckCircle2, Smartphone, ShieldCheck, Camera
} from 'lucide-react';
import debounce from 'lodash.debounce';

import { webSpeech } from '@/lib/webSpeech';
import { useStore } from '@/lib/store';
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
                setSubmittedTicket(result.complaint.ticketId);
                if (useStore.getState().voiceMode) {
                    webSpeech.speak(`Complaint submitted successfully. Your ticket number is ${result.complaint.ticketId}`);
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

    if (submittedTicket) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-grow flex items-center justify-center p-8 bg-[var(--irs-gray-100)]">
                <div className="bg-white rounded-[var(--radius-xl)] p-10 max-w-lg w-full text-center shadow-md border border-[var(--irs-gray-200)]">
                    <div className="w-20 h-20 bg-[var(--irs-success)] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-[var(--font-2xl)] font-bold text-[var(--irs-navy)] mb-2">{t('Complaint Logged')}</h1>
                    <p className="text-[var(--font-md)] text-[var(--irs-gray-600)] mb-8">{t('Your request has been successfully recorded in the centralized routing system.')}</p>

                    <div className="bg-[var(--irs-blue-pale)] p-6 rounded-[var(--radius-lg)] mb-8 border border-[var(--irs-blue-light)]">
                        <p className="kiosk-label uppercase mb-1">{t('Ticket ID')}</p>
                        <p className="text-[var(--font-2xl)] font-mono font-bold text-[var(--irs-blue-mid)] tracking-widest">{submittedTicket}</p>
                    </div>

                    <p className="text-[var(--font-sm)] font-bold text-[var(--irs-gray-600)] mb-8 flex items-center justify-center gap-2">
                        <Smartphone className="w-4 h-4 text-[var(--irs-blue-mid)]" /> {t('You will receive live updates via WhatsApp')}
                    </p>

                    <div className="space-y-4 gap-4">
                        <button className="btn-primary w-full" onClick={() => router.push('/kiosk/queue')}>
                            {t('Track this Complaint')}
                        </button>
                        <button className="text-[var(--irs-blue-mid)] font-bold underline w-full" onClick={() => router.push('/kiosk')}>
                            {t('Return to Home')}
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="kiosk-page p-4 lg:p-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* LEFT COLUMN: FORM */}
                <div className="flex-1 space-y-8">
                    <div>
                        <h1 className="kiosk-page-title mb-2">{t('Register Complaint')}</h1>
                        <p className="text-[var(--font-md)] text-[var(--irs-gray-600)] font-medium">{t('Our AI routing system will automatically assign the correct departments.')}</p>
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
                                >
                                    <btn.icon className={`w-8 h-8 mb-2 ${serviceType === btn.id ? 'text-[var(--irs-blue-mid)]' : 'text-[var(--irs-gray-500)]'}`} />
                                    <span className="text-[var(--font-sm)] font-bold">{t(btn.label)}</span>
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
                                    <button className={qsmellGas === 'yes' ? 'btn-primary bg-[var(--irs-error)] border-[var(--irs-error)] text-white w-32' : 'btn-secondary w-32'} onClick={() => { setQSmellGas('yes'); setDescription(prev => prev + " Strong smell of gas detected."); }}>{t('YES')}</button>
                                    <button className={qsmellGas === 'no' ? 'btn-primary w-32' : 'btn-secondary w-32'} onClick={() => setQSmellGas('no')}>{t('NO')}</button>
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
                                    <button className={qPowerOutage === 'out' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setQPowerOutage('out'); setDescription(prev => prev + " Power is completely out."); }}>{t('Completely Out')}</button>
                                    <button className={qPowerOutage === 'flickering' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setQPowerOutage('flickering'); setDescription(prev => prev + " Power is flickering."); }}>{t('Flickering')}</button>
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
                            <h2 className="kiosk-label">{t('DESCRIBE THE ISSUE')}</h2>
                            
                            <button
                                onClick={toggleRecording}
                                className={`flex items-center gap-2 px-4 py-2 font-bold rounded-[var(--radius-md)] border-2 transition-all ${isRecording ? 'bg-[#fef0d9] border-[#d54309] text-[#d54309] animate-pulse' : 'bg-white border-[var(--irs-gray-300)] text-[var(--irs-gray-700)]'}`}
                            >
                                <Mic className={`w-4 h-4 ${isRecording ? 'animate-bounce' : ''}`} />
                                {isRecording ? t('Listening...') : t('Dictate')}
                            </button>
                        </div>

                        <textarea
                            className="kiosk-input min-h-[200px] resize-none"
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
                            <div className="mt-4 kiosk-banner">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <div>
                                    <strong>Offline mode</strong> — complaint will be queued and submitted automatically when connected.
                                </div>
                            </div>
                        )}

                        <button
                            className="btn-primary w-full mt-6 h-[64px] text-[var(--font-lg)]"
                            disabled={description.length < 20 || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? t('Routing Complaint...') : t('Submit Complaint')} <Send className="w-5 h-5 ml-2 inline-block" />
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: LIVE DNA PANEL */}
                <div className="w-full lg:w-[450px]">
                    <div className="sticky top-8 bg-white border-2 border-[var(--irs-gray-200)] rounded-[var(--radius-xl)] p-6 shadow-md relative overflow-hidden">
                        
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
                                    
                                    <div className="kiosk-banner block-banner bg-[var(--irs-blue-pale)] border-[var(--irs-blue-light)] shadow-none">
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
                                            <span className={`text-[var(--font-sm)] font-bold px-3 py-1 rounded-[var(--radius-sm)] shadow-sm tracking-widest ${getPriorityColor(dnaAnalysis.priorityLabel)}`}>
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
                                            <p className="text-[var(--font-xl)] font-bold font-mono text-[var(--irs-navy)] mt-1">#{dnaAnalysis.queuePosition}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-[var(--radius-lg)] border-2 border-[var(--irs-gray-200)] text-center shadow-sm">
                                            <p className="kiosk-label text-[var(--font-xs)]">{t('SLA Target')}</p>
                                            <div className="flex items-center justify-center gap-1 text-[var(--font-xl)] font-bold text-[var(--irs-blue-mid)] mt-1">
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
