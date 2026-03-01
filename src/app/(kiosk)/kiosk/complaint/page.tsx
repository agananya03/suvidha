'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Zap, Flame, Droplets, Trash2, HelpCircle,
    Mic, Image as ImageIcon, Send, Clock,
    AlertTriangle, Lightbulb, CheckCircle2, Smartphone
} from 'lucide-react';
import debounce from 'lodash.debounce';

import { Button } from '@/components/ui/button';
import { webSpeech } from '@/lib/webSpeech';
import { useStore } from '@/lib/store';
import { DemoDataBadge } from '@/components/ui/EmptyState';

// --- TYPES & INTERFACES --- //
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

    // Form State
    const [serviceType, setServiceType] = useState<ServiceType | null>(null);
    const [description, setDescription] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null); // For Web Speech API SpeechRecognition

    // Questionnaire State
    const [qsmellGas, setQSmellGas] = useState<'yes' | 'no' | null>(null);
    const [qPowerOutage, setQPowerOutage] = useState<'flickering' | 'out' | null>(null);

    // Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [dnaAnalysis, setDnaAnalysis] = useState<DNAAnalysis | null>(null);

    // Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

    // --- DEBOUNCED DNA ANALYSIS --- //
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const analyzeText = useCallback(
        debounce(async (text: string) => {
            if (text.length < 5) return;
            setIsAnalyzing(true);
            try {
                const res = await fetch('/api/complaints/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description: text, type: serviceType })
                });
                if (res.ok) {
                    const data = await res.json();
                    setDnaAnalysis(data);
                }
            } catch (err) {
                console.error("Analysis failed", err);
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // --- HIGHLIGHTER UTIL --- //
    const renderHighlightedText = () => {
        if (!dnaAnalysis || !description) return description;

        // Sort words by length descending to prevent partial match overlaps
        const words = dnaAnalysis.matchedKeywords.map(k => k.word).sort((a, b) => b.length - a.length);
        if (words.length === 0) return description;

        const regex = new RegExp(`(${words.join('|')})`, 'gi');
        const parts = description.split(regex);

        return parts.map((part, i) => {
            const lowerPart = part.toLowerCase();
            const match = dnaAnalysis.matchedKeywords.find(k => k.word.toLowerCase() === lowerPart);

            if (match) {
                let colorClass = 'bg-gray-200';
                if (match.department === 'ELECTRICITY') colorClass = 'bg-yellow-200 font-semibold text-yellow-900';
                if (match.department === 'GAS') colorClass = 'bg-orange-200 font-semibold text-orange-900';
                if (match.department === 'MUNICIPAL') colorClass = 'bg-green-200 font-semibold text-green-900';

                return <span key={i} className={`${colorClass} px-1 rounded mx-0.5`}>{part}</span>;
            }
            return part;
        });
    };

    // --- FORM SUBMISSION --- //
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

            const res = await fetch('/api/complaints/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setSubmittedTicket(data.complaint.ticketId);
                // Announce success
                if (useStore.getState().voiceMode) {
                    webSpeech.speak(`Complaint submitted successfully. Your ticket number is ${data.complaint.ticketId}`);
                }
            } else {
                alert("Failed to submit complaint.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER HELPERS --- //
    const getPriorityColor = (label?: string) => {
        switch (label) {
            case 'CRITICAL': return 'bg-red-500 text-red-100';
            case 'HIGH': return 'bg-orange-500 text-orange-100';
            case 'MEDIUM': return 'bg-yellow-500 text-yellow-900';
            default: return 'bg-green-500 text-green-100';
        }
    };

    // --- SUCCESS SCREEN --- //
    if (submittedTicket) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex-grow flex items-center justify-center p-8 bg-gray-50"
            >
                <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-xl border">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Complaint Logged</h1>
                    <p className="text-gray-500 mb-8">Your request has been successfully recorded in the centralized routing system.</p>

                    <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Ticket ID</p>
                        <p className="text-3xl font-mono font-bold text-primary tracking-widest">{submittedTicket}</p>
                    </div>

                    <p className="text-sm text-gray-600 mb-8 flex items-center justify-center gap-2">
                        <Smartphone className="w-4 h-4" /> You will receive live updates via WhatsApp
                    </p>

                    <div className="space-y-3">
                        <Button size="lg" className="w-full" onClick={() => router.push('/kiosk/queue')}>
                            Track this Complaint
                        </Button>
                        <Button variant="outline" size="lg" className="w-full" onClick={() => router.push('/kiosk')}>
                            Return to Home
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="flex-grow p-4 lg:p-8 bg-gray-50/50">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* LEFT COLUMN: FORM */}
                <div className="flex-1 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Complaint</h1>
                        <p className="text-gray-500">Our AI routing system will automatically assign the correct departments.</p>
                    </div>

                    {/* Step 1: Service Type */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                            Select Category
                        </h2>
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
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${serviceType === btn.id
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                                        }`}
                                >
                                    <btn.icon className={`w-8 h-8 mb-2 ${serviceType === btn.id ? 'text-orange-500' : 'text-gray-400'}`} />
                                    <span className="text-sm font-medium">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Smart Questionnaire */}
                    <AnimatePresence>
                        {serviceType === 'GAS' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <h3 className="font-bold mb-4">Do you currently smell gas in the vicinity?</h3>
                                <div className="flex gap-4">
                                    <Button variant={qsmellGas === 'yes' ? 'destructive' : 'outline'} onClick={() => { setQSmellGas('yes'); setDescription(prev => prev + " Strong smell of gas detected."); }}>YES</Button>
                                    <Button variant={qsmellGas === 'no' ? 'default' : 'outline'} onClick={() => setQSmellGas('no')}>NO</Button>
                                </div>
                                {qsmellGas === 'yes' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-50 text-red-800 border-l-4 border-red-500 rounded-r-lg flex gap-3">
                                        <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                                        <p className="font-bold text-sm">SAFETY WARNING: EVACUATE IMMEDIATELY. Do not use electrical switches. Call emergency services at 1906!</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                        {serviceType === 'ELECTRICITY' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <h3 className="font-bold mb-4">Is the power completely out or just flickering?</h3>
                                <div className="flex gap-4">
                                    <Button variant={qPowerOutage === 'out' ? 'default' : 'outline'} onClick={() => { setQPowerOutage('out'); setDescription(prev => prev + " Power is completely out."); }}>Completely Out</Button>
                                    <Button variant={qPowerOutage === 'flickering' ? 'default' : 'outline'} onClick={() => { setQPowerOutage('flickering'); setDescription(prev => prev + " Power is flickering."); }}>Flickering</Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Step 3: Description Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                                Describe the Issue
                            </h2>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleRecording}
                                    className={isRecording ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : ''}
                                >
                                    <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'animate-bounce' : ''}`} />
                                    {isRecording ? 'Listening...' : 'Dictate'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => alert('Camera simulated for demo.')}>
                                    <ImageIcon className="w-4 h-4 mr-2" /> Photo
                                </Button>
                            </div>
                        </div>

                        <textarea
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[200px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-lg"
                            placeholder="Please describe the problem in detail. The smart routing system analyzes your text as you type..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <div className="flex items-center justify-between mt-2 text-sm">
                            <span className={`${description.length < 20 ? 'text-orange-500 font-medium' : 'text-green-600 font-medium'}`}>
                                {description.length}/500 chars (Min 20 required)
                            </span>
                        </div>

                        <Button
                            className="w-full mt-6"
                            size="lg"
                            disabled={description.length < 20 || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? 'Routing Complaint...' : 'Submit Complaint'} <Send className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* RIGHT COLUMN: LIVE DNA PANEL */}
                <div className="w-full lg:w-[400px] xl:w-[450px]">
                    <div className="sticky top-8 bg-gray-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden">

                        {/* Background subtle glow based on priority */}
                        {dnaAnalysis && (
                            <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full opacity-20 transform translate-x-1/2 -translate-y-1/2 ${dnaAnalysis.priorityLabel === 'CRITICAL' ? 'bg-red-500' :
                                dnaAnalysis.priorityLabel === 'HIGH' ? 'bg-orange-500' :
                                    dnaAnalysis.priorityLabel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                                }`} />
                        )}

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-400" />
                                Live DNA Analysis
                            </h2>
                            <DemoDataBadge />
                            {isAnalyzing && (
                                <span className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    Analyzing...
                                </span>
                            )}
                        </div>

                        {!dnaAnalysis && description.length < 5 && (
                            <div className="text-center py-12 text-gray-500 relative z-10 border-2 border-dashed border-gray-700 rounded-2xl">
                                <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Start typing to see AI routing decisions...</p>
                            </div>
                        )}

                        <AnimatePresence>
                            {dnaAnalysis && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6 relative z-10"
                                >
                                    {/* 2. Keyword Highlights Review */}
                                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Audited Transcript</p>
                                        <p className="text-sm leading-relaxed text-gray-300">
                                            {renderHighlightedText()}
                                        </p>
                                    </div>

                                    {/* 3. Department Routing Badge */}
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                        className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                                    >
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Calculated Routing</p>
                                        <div className="flex items-center gap-3">
                                            {dnaAnalysis.isMultiDepartment ? (
                                                <div className="flex -space-x-2">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-2 border-gray-800 z-10"><Zap className="w-5 h-5 text-white" /></div>
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg border-2 border-gray-800 z-0"><Trash2 className="w-5 h-5 text-white" /></div>
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-lg">
                                                    {dnaAnalysis.isMultiDepartment ? 'Multi-Department' : dnaAnalysis.primaryDepartment}
                                                </p>
                                                {dnaAnalysis.isMultiDepartment && (
                                                    <p className="text-xs text-blue-300">{dnaAnalysis.departments.join(' + ')}</p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-700 italic">
                                            {dnaAnalysis.complaintDNA}
                                        </p>
                                    </motion.div>

                                    {/* 4. Priority Meter */}
                                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Priority Index</p>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${getPriorityColor(dnaAnalysis.priorityLabel)}`}>
                                                {dnaAnalysis.priorityLabel}
                                            </span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${dnaAnalysis.priorityLabel === 'CRITICAL' ? 'bg-red-500' :
                                                    dnaAnalysis.priorityLabel === 'HIGH' ? 'bg-orange-500' :
                                                        dnaAnalysis.priorityLabel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(dnaAnalysis.priority / 10) * 100}%` }}
                                                transition={{ type: "spring", stiffness: 50 }}
                                            />
                                        </div>
                                    </div>

                                    {/* 5 & 6. Queue & SLA */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Queue Position</p>
                                            <p className="text-3xl font-bold font-mono">#{dnaAnalysis.queuePosition}</p>
                                            <p className="text-xs text-gray-500 mt-1">Est. live tracking</p>
                                        </div>
                                        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center flex flex-col justify-center">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">SLA Target</p>
                                            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-400">
                                                <Clock className="w-5 h-5" /> {dnaAnalysis.slaDays}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Maximum Days</p>
                                        </div>
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
