'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Zap, Building2, FileText, PlusCircle, AlertTriangle, Search, ShieldCheck, MapPin } from 'lucide-react';
import { useKioskStore } from '@/store/useKioskStore';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

export default function DashboardPage() {
    const router = useRouter();
    const { t } = useDynamicTranslation();
    const user = useKioskStore(state => state.user);
    const [activeTab, setActiveTab] = useState<'electricity' | 'gas' | 'municipal'>('electricity');

    // Mapped content
    const tabs = [
        { id: 'electricity', label: '⚡ Electricity' },
        { id: 'gas', label: '🔥 Gas' },
        { id: 'municipal', label: '🏙️ Municipal' },
    ] as const;

    const services = {
        electricity: [
            { icon: Zap, label: 'Pay Bill', action: () => router.push('/kiosk/pay') },
            { icon: AlertTriangle, label: 'Outage Complaint', action: () => router.push('/kiosk/complaint') },
            { icon: PlusCircle, label: 'New Connection', action: () => {} },
            { icon: Search, label: 'Track Status', action: () => router.push('/kiosk/queue') },
        ],
        gas: [
            { icon: Flame, label: 'Book Cylinder', action: () => {} },
            { icon: ShieldCheck, label: 'Subsidy Status', action: () => {} },
            { icon: AlertTriangle, label: 'Leak Complaint', action: () => router.push('/kiosk/complaint') },
            { icon: Search, label: 'Delivery Status', action: () => router.push('/kiosk/queue') },
        ],
        municipal: [
            { icon: Building2, label: 'Property Tax', action: () => router.push('/kiosk/pay') },
            { icon: FileText, label: 'Birth Request', action: () => {} },
            { icon: AlertTriangle, label: 'Streetlight Issue', action: () => router.push('/kiosk/complaint') },
            { icon: MapPin, label: 'Find Centers', action: () => {} },
        ]
    };

    return (
        <div className="kiosk-page">
            
            {/* Header with Greeting */}
            <div className="flex justify-between items-center mb-6 border-b-2 border-[var(--irs-gray-200)] pb-4">
                <div>
                    <h1 className="text-[var(--font-xl)] font-bold text-[var(--irs-navy)]">
                        {t('Welcome')}, {user?.name || t('Citizen')}
                    </h1>
                    <p className="text-[var(--font-sm)] text-[var(--irs-gray-600)] font-medium">
                        {t('Select a service below to begin')}
                    </p>
                </div>
            </div>

            {/* Quick Pay Info Banner */}
            <div className="kiosk-banner">
                <ShieldCheck className="w-5 h-5 shrink-0 text-[var(--irs-blue-mid)] mt-0.5" />
                <div>
                    <strong className="block mb-1 text-[var(--font-sm)]">{t('Quick Pay available — no login required')}</strong>
                    <span className="opacity-90">{t('Use the dashboard to securely pay utility bills directly without complex forms.')}</span>
                </div>
            </div>

            {/* Department Tabs */}
            <div className="kiosk-subnav mb-8 rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`kiosk-subnav-tab flex-1 justify-center text-[var(--font-md)] ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {t(tab.label)}
                    </button>
                ))}
            </div>

            {/* Service Grid Section */}
            <h2 className="text-[var(--font-lg)] font-bold text-[var(--irs-navy)] border-l-4 border-[var(--irs-blue-mid)] pl-3 mb-4">
                {tabs.find(t => t.id === activeTab)?.label} {t('Services')}
            </h2>
            
            <div className="service-grid">
                {services[activeTab].map((service, index) => {
                    const Icon = service.icon;
                    return (
                        <button
                            key={index}
                            className="service-card group"
                            onClick={service.action}
                        >
                            <div className="bg-[var(--irs-blue-pale)] p-3 rounded-full mr-2 group-hover:bg-[var(--irs-blue-mid)] transition-colors">
                                <Icon className="w-8 h-8 text-[var(--irs-blue-mid)] group-hover:text-white" />
                            </div>
                            <span className="service-card-label">{t(service.label)}</span>
                        </button>
                    );
                })}
            </div>

        </div>
    );
}
