'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Flame, Zap, Building2, FileText, PlusCircle, AlertTriangle, Search, ShieldCheck, MapPin, UploadCloud, Fingerprint, LayoutDashboard, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { BackButton } from '@/components/kiosk/BackButton';

const SMART_SUGGESTIONS = [
  {
    id: 'anomaly',
    icon: '⚠️',
    color: 'border-red-200 bg-red-50',
    textColor: 'text-red-800',
    labelColor: 'bg-red-100 text-red-600',
    label: 'Anomaly Alert',
    title: 'Electricity bill is 2.31× higher than usual',
    desc: 'Dispute before May 15 or pay ₹1,247.50',
    href: '/kiosk/electricity',
    urgent: true,
  },
  {
    id: 'due',
    icon: '📅',
    color: 'border-orange-200 bg-orange-50',
    textColor: 'text-orange-800',
    labelColor: 'bg-orange-100 text-orange-600',
    label: 'Due Soon',
    title: 'Gas bill due in 3 days',
    desc: '₹620.00 — MNGL Piped Gas',
    href: '/kiosk/gas',
    urgent: false,
  },
  {
    id: 'scheme',
    icon: '🌞',
    color: 'border-green-200 bg-green-50',
    textColor: 'text-green-800',
    labelColor: 'bg-green-100 text-green-600',
    label: 'You May Qualify',
    title: 'PM Surya Ghar — 300 units FREE/month',
    desc: 'Subsidy up to ₹78,000 available',
    href: '/kiosk/electricity',
    urgent: false,
  },
  {
    id: 'tax',
    icon: '🏛️',
    color: 'border-blue-200 bg-blue-50',
    textColor: 'text-blue-800',
    labelColor: 'bg-blue-100 text-blue-600',
    label: 'Pay Early',
    title: 'Property tax — 2% discount if paid before June 1',
    desc: '₹8,400.00 — NMC · 38 days left',
    href: '/kiosk/municipal',
    urgent: false,
  },
];

function SmartSuggestionsStrip() {
  const router = useRouter();
  const { t } = useDynamicTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-6 mb-2"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✨</span>
        <h2 className="text-base font-bold text-gray-900">
          {t('Smart Suggestions — For You')}
        </h2>
        <span className="ml-auto text-xs text-gray-400 italic">
          AI-powered · updates daily
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SMART_SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(s.href)}
            className={`w-full text-left p-3 rounded-xl border ${s.color} transition-all flex items-start gap-3`}
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">
              {s.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${s.labelColor}`}>
                  {s.label}
                </span>
                {s.urgent && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="text-xs text-red-500 font-bold"
                  >
                    URGENT
                  </motion.span>
                )}
              </div>
              <p className={`text-sm font-bold ${s.textColor} leading-snug`}>
                {s.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {s.desc}
              </p>
            </div>
            <span className="text-gray-400 flex-shrink-0 mt-1">›</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function LiveImpactCounter() {
  const [counts, setCounts] = useState({
    bills: 2847,
    complaints: 143,
    citizens: 891,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        bills: prev.bills + Math.floor(Math.random() * 3),
        complaints: prev.complaints + (Math.random() > 0.7 ? 1 : 0),
        citizens: prev.citizens + Math.floor(Math.random() * 2),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: '⚡', label: 'bills paid today', value: counts.bills },
    { icon: '📋', label: 'complaints resolved', value: counts.complaints },
    { icon: '👥', label: 'citizens served', value: counts.citizens },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-6 py-2 px-4 bg-blue-950/40 rounded-xl mb-6 border border-blue-800/30 flex-wrap"
    >
      {stats.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-sm">{s.icon}</span>
          <motion.span
            key={s.value}
            initial={{ opacity: 0.5, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-bold text-white"
          >
            {s.value.toLocaleString('en-IN')}
          </motion.span>
          <span className="text-xs text-blue-300">{s.label}</span>
          {i < stats.length - 1 && (
            <span className="text-blue-700 ml-4">|</span>
          )}
        </div>
      ))}

      <div className="flex items-center gap-1 ml-auto">
        <motion.div
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-green-400"
        />
        <span className="text-xs text-green-400 font-medium">LIVE</span>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
    const router = useRouter();
    const { t } = useDynamicTranslation();
    const user = useAuthStore(state => state.user);
    const discoveredServices = user?.connections || [];
    // Demo-ready: uses static hardcoded service tiles — no API fetch required
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
            { icon: PlusCircle, label: 'New Connection', action: () => router.push('/kiosk/electricity?tab=connection') },
            { icon: Search, label: 'Track Status', action: () => router.push('/kiosk/queue') },
        ],
        gas: [
            { icon: Flame, label: 'Book Cylinder', action: () => router.push('/kiosk/gas?tab=refill') },
            { icon: ShieldCheck, label: 'Subsidy Status', action: () => router.push('/kiosk/gas?tab=subsidy') },
            { icon: AlertTriangle, label: 'Leak Complaint', action: () => router.push('/kiosk/complaint') },
            { icon: Search, label: 'Delivery Status', action: () => router.push('/kiosk/queue') },
        ],
        municipal: [
            { icon: Building2, label: 'Property Tax', action: () => router.push('/kiosk/pay') },
            { icon: FileText, label: 'Birth Request', action: () => router.push('/kiosk/municipal?tab=certificate') },
            { icon: AlertTriangle, label: 'Streetlight Issue', action: () => router.push('/kiosk/complaint') },
            { icon: MapPin, label: 'Find Centers', action: () => router.push('/kiosk/municipal?tab=building') },
        ]
    };

    return (
        <div className="h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28 max-w-7xl mx-auto w-full">            
            <BackButton onClick={() => router.back()} variant="light" />
            
            <LiveImpactCounter />
            
            {/* Header with Greeting */}
            <div className="flex justify-between items-center mb-6 border-b-2 border-[var(--irs-gray-200)] pb-4">
                <div>
                    <h1 className="text-3xl font-black text-[#0A1628] mb-2">
                        {t('Welcome')}, {user?.name || t('Citizen')}
                        {discoveredServices.length > 0 && (
                            <span className="ml-2 text-lg font-medium text-[#004085]">
                                — {discoveredServices.length} {t('linked service')}{discoveredServices.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </h1>
                    <p className="text-lg font-medium text-[#4A6FA5]">
                        {discoveredServices.length > 0
                            ? t('Your linked services are ready below')
                            : t('Select a service below to begin')}
                    </p>
                </div>
            </div>

            {/* Quick Pay Info Banner */}
            <div className="bg-[#E8F4FD] border-2 border-[#90CDF4] text-[#0A1628] rounded-2xl p-4 flex gap-3 shadow-sm">
                <ShieldCheck className="w-5 h-5 shrink-0 text-[#004085] mt-0.5" />
                <div>
                    <strong className="block mb-1 text-sm font-bold">{t('Quick Pay available — no login required')}</strong>
                    <span className="opacity-90">{t('Use the dashboard to securely pay utility bills directly without complex forms.')}</span>
                </div>
            </div>

            {/* Department Tabs */}
            <div className="flex w-full bg-[#EBF5FB] border-2 border-[#BEE3F8] rounded-xl p-1 mb-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`flex-1 flex justify-center py-3 text-lg font-bold rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-[#004085] shadow-sm' : 'text-[#4A6FA5] hover:text-[#002868]'}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {t(tab.label)}
                    </button>
                ))}
            </div>

            {/* Service Grid Section */}
            <h2 className="text-2xl font-black text-[#0A1628] mb-6">
                {tabs.find(t => t.id === activeTab)?.label} {t('Services')}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {services[activeTab].map((service, index) => {
                    const Icon = service.icon;
                    return (
                        <button
                            key={index}
                            className="bg-white rounded-2xl p-5 min-h-[120px] border-2 border-[#BEE3F8] hover:border-[#004085] hover:shadow-md cursor-pointer transition-all duration-150 active:scale-95 flex flex-col items-center justify-center text-center gap-3 group shadow-sm"
                            onClick={service.action}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#E8F4FD] flex items-center justify-center text-2xl text-[#004085] transition-all group-hover:bg-[#004085]">
                                <Icon className="w-8 h-8 text-[#004085] group-hover:text-white" />
                            </div>
                            <span className="text-lg font-bold text-[#0A1628]">{t(service.label)}</span>
                        </button>
                    );
                })}
            </div>

            <SmartSuggestionsStrip />

            {/* More Services — previously hidden features */}
            <div className="mt-8 mb-4">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-black text-[#0A1628]">More Services</h2>
                    <span className="text-xs bg-[#004085] text-white px-2 py-0.5 rounded-full font-bold">NEW</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        {
                            icon: UploadCloud,
                            label: 'Upload Documents',
                            desc: 'DigiLocker, Scanner, Token',
                            action: () => router.push('/kiosk/documents'),
                            color: 'text-[#004085]',
                            bg: 'bg-[#E8F4FD]',
                        },
                        {
                            icon: Fingerprint,
                            label: 'Aadhaar eKYC',
                            desc: 'Verify with offline ZIP',
                            action: () => router.push('/kiosk/aadhaar'),
                            color: 'text-emerald-700',
                            bg: 'bg-emerald-50',
                        },
                        {
                            icon: LayoutDashboard,
                            label: 'Account Dashboard',
                            desc: 'Bills, complaints, history',
                            action: () => router.push('/dashboard'),
                            color: 'text-purple-700',
                            bg: 'bg-purple-50',
                        },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                onClick={item.action}
                                className="bg-white rounded-2xl p-5 border-2 border-[#BEE3F8] hover:border-[#004085] hover:shadow-md cursor-pointer transition-all duration-150 active:scale-95 flex flex-col items-start gap-3 group shadow-sm text-left"
                            >
                                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center transition-all group-hover:scale-110`}>
                                    <Icon className={`w-7 h-7 ${item.color}`} />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-[#0A1628]">{t(item.label)}</p>
                                    <p className="text-xs text-[#4A6FA5] mt-0.5">{item.desc}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[#90CDF4] mt-auto" />
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
