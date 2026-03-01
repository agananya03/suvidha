import React from 'react';
import { FileQuestion, Wallet, Layers } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    type: 'complaints' | 'payments' | 'services';
    title?: string;
    description?: string;
    actionText?: string;
    actionHref?: string;
}

/**
 * Universal Empty State visual constructor.
 * Resolves empty array fetches gracefully preventing blank white screens.
 */
export function EmptyState({
    type,
    title,
    description,
    actionText,
    actionHref
}: EmptyStateProps) {

    // Mapping logic handling generic fallback strings/icons if none explicitly provided
    const config = {
        complaints: {
            icon: <FileQuestion size={64} className="text-blue-200" />,
            defaultTitle: 'No complaints filed yet',
            defaultDesc: 'When you report civic issues like broken streetlights or water leaks, you can track their live resolution status here.',
            defaultAction: 'File your first complaint',
            defaultHref: '/kiosk/complaint'
        },
        payments: {
            icon: <Wallet size={64} className="text-emerald-200" />,
            defaultTitle: 'Your payment history is empty',
            defaultDesc: 'All successful utility and civic fee transactions will be securely logged and available for download here.',
            defaultAction: 'Pay a Utility Bill',
            defaultHref: '/kiosk'
        },
        services: {
            icon: <Layers size={64} className="text-orange-200" />,
            defaultTitle: 'Discover your services',
            defaultDesc: 'You do not have any utility consumer numbers explicitly linked to this profile.',
            defaultAction: 'Link a Connection',
            defaultHref: '/dashboard'
        }
    };

    const current = config[type];

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-100 border-dashed rounded-3xl w-full">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                {current.icon}
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-3">
                {title || current.defaultTitle}
            </h3>

            <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
                {description || current.defaultDesc}
            </p>

            {/* Conditionally render Action Hooks only if link provided */}
            {(actionHref || current.defaultHref) && (
                <Link
                    href={actionHref || current.defaultHref}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all active:scale-95"
                >
                    {actionText || current.defaultAction}
                </Link>
            )}
        </div>
    );
}

// Generates a floating absolute badge alerting developers the data is mock
export function DemoDataBadge() {
    return (
        <div className="absolute top-4 right-4 bg-orange-100 border border-orange-300 text-orange-800 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-50 flex items-center gap-2 select-none shadow-orange-900/10 animate-pulse">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            Demo Data
        </div>
    );
}
