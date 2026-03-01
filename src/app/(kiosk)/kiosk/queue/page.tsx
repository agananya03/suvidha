'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, Clock, ShieldCheck,
    Activity, ArrowRight, Home, PlusCircle,
    UserCircle2, PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next'; // Keeping available just in case, but suppressing unused
import { useStore } from '@/lib/store';
import { DemoDataBadge } from '@/components/ui/EmptyState';

// --- STUB DATA --- //
const MOCK_COMPLAINTS = [
    {
        id: 'SUVDH-2026-00047',
        department: 'Electricity',
        position: 47,
        total: 312,
        status: 'UNDER INVESTIGATION',
        priority: 8,
        priorityLabel: 'HIGH',
        slaDays: 7,
        slaDaysLeft: 5,
        submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        officerState: { name: 'Officer #A3', load: 23, avgLoad: 25 },
        peerState: { name: 'Officer #B7', load: 25 },
        stage: 3 // 1: Submitted, 2: Routed, 3: Investigation, 4: In Progress, 5: Resolved
    },
    {
        id: 'SUVDH-2026-00012',
        department: 'Municipal',
        position: 12,
        total: 156,
        status: 'IN PROGRESS',
        priority: 5,
        priorityLabel: 'MEDIUM',
        slaDays: 15,
        slaDaysLeft: 2,
        submittedAt: new Date(Date.now() - 13 * 86400000).toISOString(),
        officerState: { name: 'Officer #M9', load: 45, avgLoad: 42 },
        peerState: { name: 'Officer #M2', load: 41 },
        stage: 4
    }
];

export default function QueuePage() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { t } = useTranslation();
    const { highContrast } = useStore();

    const [activeTab, setActiveTab] = useState(0);
    const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);

    const activeComplaint = complaints[activeTab];

    // --- SIMULATED LIVE DECREMENT --- //
    useEffect(() => {
        const interval = setInterval(() => {
            setComplaints(prev => {
                const updated = [...prev];
                // Only decrement if position > 1
                if (updated[0].position > 1) {
                    updated[0] = { ...updated[0], position: updated[0].position - 1 };
                }
                if (updated[1] && updated[1].position > 1) {
                    // Make the second one decrement sometimes just for flavor
                    if (Math.random() > 0.5) {
                        updated[1] = { ...updated[1], position: updated[1].position - 1 };
                    }
                }
                return updated;
            });
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    // --- RENDER HELPERS --- //
    const getPriorityColor = (label: string) => {
        switch (label) {
            case 'CRITICAL': return 'text-red-600 bg-red-100';
            case 'HIGH': return 'text-orange-600 bg-orange-100';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-green-600 bg-green-100';
        }
    };

    const getPriorityBarColor = (label: string) => {
        switch (label) {
            case 'CRITICAL': return 'bg-red-500';
            case 'HIGH': return 'bg-orange-500';
            case 'MEDIUM': return 'bg-yellow-500';
            default: return 'bg-green-500';
        }
    };

    const calculateRingStroke = (left: number, total: number) => {
        const percent = Math.max(0, left / total);
        const circumference = 2 * Math.PI * 45; // r=45
        return circumference * (1 - percent);
    };

    const isScaBreached = activeComplaint.slaDaysLeft <= 0;

    return (
        <div className={`flex-grow p-4 lg:p-8 ${highContrast ? 'bg-black text-white' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto space-y-6">

                {/* HEADER & TABS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Live Queue Tracker</h1>
                        <p className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-500'}`}>Real-time transparency into your municipal requests.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 border-b border-gray-200">
                        {complaints.map((c, idx) => (
                            <button
                                key={c.id}
                                onClick={() => setActiveTab(idx)}
                                className={`px-6 py-3 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === idx
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {idx === 0 ? 'Latest Complaint' : `Complaint ${idx + 1}`}
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    #{c.position}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
                    <DemoDataBadge />

                    {/* LEFT COLUMN: MAIN DISPLAY & CORRUPTION PANEL */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* MAIN QUEUE VISUAL */}
                        <div className={`p-8 rounded-3xl shadow-sm border ${highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8">

                                <div className="space-y-6 flex-1">
                                    <div>
                                        <p className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-1">Active Ticket</p>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-mono font-bold">{activeComplaint.id}</h2>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full border border-current ${activeComplaint.department === 'Electricity' ? 'text-yellow-600 bg-yellow-50' :
                                                activeComplaint.department === 'Municipal' ? 'text-green-600 bg-green-50' :
                                                    'text-blue-600 bg-blue-50'
                                                }`}>
                                                {activeComplaint.department} Dept.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-end gap-4">
                                        <div className="relative">
                                            <AnimatePresence mode="popLayout">
                                                <motion.h1
                                                    key={activeComplaint.position}
                                                    initial={{ y: -20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: 20, opacity: 0, position: 'absolute' }}
                                                    className={`text-7xl font-black tabular-nums tracking-tighter ${highContrast ? 'text-white' : 'text-gray-900'}`}
                                                >
                                                    #{activeComplaint.position}
                                                </motion.h1>
                                            </AnimatePresence>
                                        </div>
                                        <p className="text-gray-500 mb-2 whitespace-nowrap">of {activeComplaint.total} total complaints in queue</p>
                                    </div>

                                    <div className="flex flex-wrap gap-4 items-center">
                                        <div className={`px-4 py-2 rounded-lg font-bold text-sm tracking-widest animate-pulse ${activeComplaint.status === 'UNDER INVESTIGATION' ? 'bg-blue-100 text-blue-700' :
                                            activeComplaint.status === 'IN PROGRESS' ? 'bg-purple-100 text-purple-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {activeComplaint.status}
                                        </div>

                                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityColor(activeComplaint.priorityLabel)}`}>
                                                {activeComplaint.priorityLabel} PRIORITY
                                            </span>
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className={`h-full ${getPriorityBarColor(activeComplaint.priorityLabel)}`} style={{ width: `${(activeComplaint.priority / 10) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SLA RING RIGHT ALIGNED ON DESKTOP */}
                                <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl border min-w-[200px]">
                                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                                            <motion.circle
                                                cx="64" cy="64" r="45"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="transparent"
                                                strokeDasharray={2 * Math.PI * 45}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                                                animate={{ strokeDashoffset: calculateRingStroke(activeComplaint.slaDaysLeft, activeComplaint.slaDays) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className={isScaBreached ? 'text-red-500' : 'text-blue-500'}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <span className={`text-3xl font-black ${isScaBreached ? 'text-red-600' : 'text-gray-900'}`}>
                                                {activeComplaint.slaDaysLeft}
                                            </span>
                                            <span className="text-xs uppercase font-bold text-gray-500">Days Left</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">SLA Deadline</p>
                                        <p className={`text-sm font-semibold ${isScaBreached ? 'text-red-500' : 'text-gray-900'}`}>
                                            {new Date(Date.now() + activeComplaint.slaDaysLeft * 86400000).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ANTI-CORRUPTION PANEL */}
                        <div className={`p-6 rounded-3xl shadow-sm border ${highContrast ? 'bg-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50/50 border-gray-100'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-green-500" />
                                    Department Accountability Interface
                                </h3>
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> No queue jumps detected
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 mb-6">Queue Transparency: All positions are sequentially bound and public. Officer workloads are balanced to prevent artificial delays.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Officer Workload Comparison */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Workload Balancing
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-semibold">{activeComplaint.officerState.name} (Assigned)</span>
                                                <span className="text-gray-500">{activeComplaint.officerState.load} active tickets</span>
                                            </div>
                                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                                <div className="bg-blue-500 h-full" style={{ width: `${(activeComplaint.officerState.load / 60) * 100}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-500">{activeComplaint.peerState.name} (Available Peer)</span>
                                                <span className="text-gray-500">{activeComplaint.peerState.load} active tickets</span>
                                            </div>
                                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                                <div className="bg-gray-400 h-full" style={{ width: `${(activeComplaint.peerState.load / 60) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-4">
                                    <UserCircle2 className="w-8 h-8 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-sm text-blue-900 mb-1">Verified Fair Distribution</h4>
                                        <p className="text-xs text-blue-700 leading-relaxed">System logs confirm this ticket was assigned automatically via round-robin weighting. Manual overrides were not engaged.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PROGRESS TIMELINE */}
                    <div className="lg:col-span-4">
                        <div className={`p-6 rounded-3xl shadow-sm border h-full ${highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <h3 className="text-lg font-bold mb-6">Resolution Timeline</h3>

                            <div className="relative pl-4 space-y-8">
                                {/* Vertical Line Track */}
                                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 z-0" />

                                {[
                                    { step: 1, title: 'Complaint Submitted', date: new Date(activeComplaint.submittedAt).toLocaleString(), icon: CheckCircle2, complete: activeComplaint.stage >= 1 },
                                    { step: 2, title: 'Routed to Department', date: new Date(new Date(activeComplaint.submittedAt).getTime() + 3600000).toLocaleString(), icon: ArrowRight, complete: activeComplaint.stage >= 2 },
                                    { step: 3, title: 'Under Investigation', date: 'Active Phase', icon: PlayCircle, active: activeComplaint.stage === 3, complete: activeComplaint.stage > 3 },
                                    { step: 4, title: 'Resolution in Progress', date: 'Pending', icon: Clock, active: activeComplaint.stage === 4, complete: activeComplaint.stage > 4 },
                                    { step: 5, title: 'Resolved & Closed', date: 'Pending Completion', icon: ShieldCheck, complete: activeComplaint.stage >= 5 },
                                ].map((item, idx) => (
                                    <div key={idx} className={`relative z-10 flex gap-4 ${!item.complete && !item.active ? 'opacity-40' : ''}`}>
                                        <div className={`w-5 h-5 rounded-full mt-1 flex-shrink-0 flex items-center justify-center border-2 ${item.complete ? 'bg-green-500 border-green-500' :
                                            item.active ? 'bg-blue-500 border-blue-500 ring-4 ring-blue-100 animate-pulse' :
                                                'bg-white border-gray-300'
                                            }`}>
                                            {item.complete && <CheckCircle2 className="w-3 h-3 text-white" />}
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold ${item.active ? 'text-primary' : ''}`}>{item.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t space-y-3">
                                <Button className="w-full" asChild>
                                    <a href="/kiosk/complaint">
                                        <PlusCircle className="w-4 h-4 mr-2" /> File New Complaint
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <a href="/kiosk">
                                        <Home className="w-4 h-4 mr-2" /> Return Home
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
