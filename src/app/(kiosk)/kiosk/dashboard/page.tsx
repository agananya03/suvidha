'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Flame, Zap, Building2, ArrowRight, CreditCard, FileText, AlertTriangle, ChevronRight } from 'lucide-react';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

const DEPARTMENTS = [
  {
    id: 'gas',
    icon: Flame,
    label: 'Gas (LPG Services)',
    subtitle: 'Refill booking, subsidy, KYC, delivery tracking & more',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    textColor: 'text-orange-700',
    amount: '₹620.00',
    amountLabel: 'MNGL Piped Gas · Due May 12',
    href: '/kiosk/gas',
    features: ['LPG Refill Booking', 'Subsidy Status', 'Delivery Tracking', 'Emergency Complaint'],
  },
  {
    id: 'electricity',
    icon: Zap,
    label: 'Electricity',
    subtitle: 'Bill payment, new connection, outage & meter complaints',
    color: 'from-yellow-400 to-amber-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    textColor: 'text-yellow-700',
    amount: '₹1,247.50',
    amountLabel: 'MSEDCL · Due May 15 · ⚠️ Anomaly Flagged',
    href: '/kiosk/electricity',
    features: ['Bill Payment', 'New Connection', 'Outage Complaint', 'Prepaid Recharge'],
  },
  {
    id: 'municipal',
    icon: Building2,
    label: 'Municipal Corporation',
    subtitle: 'Property tax, certificates, complaints & permissions',
    color: 'from-emerald-500 to-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    textColor: 'text-green-700',
    amount: '₹8,400.00',
    amountLabel: 'NMC Property Tax · Due Jun 30',
    href: '/kiosk/municipal',
    features: ['Property Tax Payment', 'Water Bill', 'Birth/Death Cert', 'Pothole Reporting'],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useDynamicTranslation();

  const totalDue = 620 + 1247.5 + 8400;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            {t('Your Services')}
          </h1>
          <p className="text-gray-500 text-lg">{t('Select a department to access its full service menu.')}</p>
        </motion.div>

        {/* Total Outstanding Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0A192F] text-white rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg"
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-300 mb-1">{t('Total Outstanding')}</p>
            <p className="text-4xl font-black">₹{totalDue.toLocaleString('en-IN')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('Across 3 linked utilities')}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => router.push('/kiosk/pay')}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105"
            >
              <CreditCard className="w-5 h-5" />
              {t('Pay All Bills')}
            </button>
            <button
              onClick={() => router.push('/kiosk/complaint')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all border border-white/20"
            >
              <FileText className="w-5 h-5" />
              {t('File Complaint')}
            </button>
          </div>
        </motion.div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 gap-6">
          {DEPARTMENTS.map((dept, i) => {
            const Icon = dept.icon;
            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                onClick={() => router.push(dept.href)}
                className={`bg-white border-2 ${dept.border} rounded-3xl p-6 md:p-8 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group relative overflow-hidden`}
              >
                {/* Gradient bar */}
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${dept.color}`} />

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${dept.color} flex items-center justify-center shadow-md shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-grow">
                    <h2 className="text-2xl font-black text-gray-900 mb-1">{t(dept.label)}</h2>
                    <p className="text-gray-500 mb-4">{t(dept.subtitle)}</p>

                    {/* Feature chips */}
                    <div className="flex flex-wrap gap-2">
                      {dept.features.map((f) => (
                        <span
                          key={f}
                          className={`${dept.bg} ${dept.textColor} text-xs font-semibold px-3 py-1 rounded-full border ${dept.border}`}
                        >
                          {t(f)}
                        </span>
                      ))}
                      <span className={`${dept.bg} ${dept.textColor} text-xs font-semibold px-3 py-1 rounded-full border ${dept.border} opacity-70`}>
                        +more
                      </span>
                    </div>
                  </div>

                  {/* Bill amount + Arrow */}
                  <div className="md:text-right shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                    <div>
                      <p className="text-2xl font-black text-gray-900">{dept.amount}</p>
                      <p className={`text-xs font-medium mt-1 ${dept.amountLabel.includes('⚠️') ? 'text-orange-600' : 'text-gray-400'}`}>
                        {dept.amountLabel}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${dept.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: AlertTriangle, label: 'Emergency Complaint', color: 'text-red-600 bg-red-50 border-red-200', href: '/kiosk/complaint' },
            { icon: FileText, label: 'Track Complaint', color: 'text-blue-600 bg-blue-50 border-blue-200', href: '/kiosk/queue' },
            { icon: ChevronRight, label: 'Back to Discovery', color: 'text-gray-600 bg-gray-50 border-gray-200', href: '/kiosk/discovery' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-semibold transition-all hover:shadow-md ${action.color}`}
              >
                <Icon className="w-5 h-5" />
                {t(action.label)}
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
