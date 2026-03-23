'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useKioskStore } from '@/store/useKioskStore';

const STEPS = [
    { id: 'entry',     label: 'Start',      paths: ['/kiosk'] },
    { id: 'auth',      label: 'Identity',   paths: ['/kiosk/auth'] },
    { id: 'discovery', label: 'Services',   paths: ['/kiosk/discovery'] },
    { id: 'dashboard', label: 'Dashboard',  paths: ['/kiosk/dashboard', '/kiosk/electricity', '/kiosk/gas', '/kiosk/municipal'] },
    { id: 'transact',  label: 'Pay / File', paths: ['/kiosk/pay', '/kiosk/complaint'] },
    { id: 'done',      label: 'Done',       paths: ['/kiosk/queue'] },
];

function getStepIndex(pathname: string): number {
    for (let i = STEPS.length - 1; i >= 0; i--) {
        if (STEPS[i].paths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
            return i;
        }
    }
    return 0;
}

export function JourneyBar() {
    const pathname = usePathname();
    const { isAuthenticated } = useKioskStore();

    // Suppress unused-var warning — isAuthenticated available for future guards
    void isAuthenticated;

    const currentIndex = getStepIndex(pathname);

    // Don't show on entry page — redundant there
    if (pathname === '/kiosk') return null;

    return (
        <div className="w-full px-4 py-2 bg-white/5 border-b border-white/10 shrink-0">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-1">
                {STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent  = index === currentIndex;
                    const isUpcoming = index > currentIndex;

                    return (
                        <div key={step.id} className="flex items-center gap-1 flex-1">
                            {/* Step dot + label */}
                            <div className="flex flex-col items-center gap-0.5 flex-1">
                                <div className="relative flex items-center justify-center">
                                    {isCompleted && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-3 h-3 rounded-full bg-green-400"
                                        />
                                    )}
                                    {isCurrent && (
                                        <div className="relative w-3 h-3">
                                            <motion.div
                                                animate={{ scale: [1, 1.4, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="absolute inset-0 rounded-full bg-orange-400 opacity-40"
                                            />
                                            <div className="w-3 h-3 rounded-full bg-orange-400 relative z-10" />
                                        </div>
                                    )}
                                    {isUpcoming && (
                                        <div className="w-3 h-3 rounded-full border border-white/30 bg-white/10" />
                                    )}
                                </div>

                                <span className={`text-[9px] font-medium whitespace-nowrap transition-colors ${
                                    isCompleted ? 'text-green-400' :
                                    isCurrent   ? 'text-orange-400' :
                                                  'text-white/30'
                                }`}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line — not after last step */}
                            {index < STEPS.length - 1 && (
                                <div className="flex-1 h-px mb-4 mx-1 relative overflow-hidden rounded-full bg-white/10">
                                    {isCompleted && (
                                        <motion.div
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 0.4 }}
                                            className="absolute inset-0 bg-green-400 rounded-full"
                                        />
                                    )}
                                    {isCurrent && (
                                        <motion.div
                                            animate={{ width: ['0%', '60%', '40%'] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-orange-400/50 rounded-full"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
