'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Zap, ArrowLeft, CreditCard, CheckCircle2, AlertTriangle,
  Download, MapPin, FileText, Gift, ChevronRight, Clock,
  Smartphone, Plus, Minus, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { jsPDF } from 'jspdf';

type Tab = 'bill' | 'history' | 'connection' | 'load' | 'outage' | 'meter' | 'prepaid' | 'track' | 'policy';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'bill', label: 'Bill & Payment', icon: CreditCard },
  { id: 'history', label: 'Bill History', icon: Clock },
  { id: 'connection', label: 'New Connection', icon: Plus },
  { id: 'load', label: 'Load Change', icon: Minus },
  { id: 'outage', label: 'Outage Complaint', icon: AlertTriangle },
  { id: 'meter', label: 'Meter Complaint', icon: Zap },
  { id: 'prepaid', label: 'Prepaid Recharge', icon: Smartphone },
  { id: 'track', label: 'Complaint Tracking', icon: Clock },
  { id: 'policy', label: 'Policy Benefits', icon: Gift },
];

const BILL_HISTORY = [
  { month: 'Feb 2026', units: 540, amount: 1247.50, status: 'Unpaid', anomaly: true },
  { month: 'Jan 2026', units: 245, amount: 540.00, status: 'Paid', anomaly: false },
  { month: 'Dec 2025', units: 280, amount: 620.00, status: 'Paid', anomaly: false },
  { month: 'Nov 2025', units: 230, amount: 510.00, status: 'Paid', anomaly: false },
  { month: 'Oct 2025', units: 210, amount: 465.00, status: 'Paid', anomaly: false },
  { month: 'Sep 2025', units: 255, amount: 570.00, status: 'Paid', anomaly: false },
  { month: 'Aug 2025', units: 295, amount: 650.00, status: 'Paid', anomaly: false },
  { month: 'Jul 2025', units: 315, amount: 700.00, status: 'Paid', anomaly: false },
  { month: 'Jun 2025', units: 270, amount: 600.00, status: 'Paid', anomaly: false },
  { month: 'May 2025', units: 220, amount: 488.00, status: 'Paid', anomaly: false },
  { month: 'Apr 2025', units: 200, amount: 445.00, status: 'Paid', anomaly: false },
  { month: 'Mar 2025', units: 218, amount: 485.00, status: 'Paid', anomaly: false },
];

const POLICIES = [
  { title: 'PM Surya Ghar Muft Bijli Yojana', desc: 'Install rooftop solar and get 300 units FREE every month. Subsidy up to ₹78,000 available.', icon: '☀️', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  { title: 'Har Ghar Bijli (New Connection)', desc: 'Every household is entitled to a free electricity connection under DDUGJY. Apply now.', icon: '💡', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { title: 'BPL Tariff Waivers', desc: 'Households below poverty line are eligible for subsidised electricity rates. Check eligibility.', icon: '🏚️', color: 'bg-green-50 border-green-200 text-green-800' },
  { title: 'RDSS Scheme Benefits', desc: 'Revamped Distribution Sector Scheme provides pre-paid smart meters and improved service quality.', icon: '📊', color: 'bg-purple-50 border-purple-200 text-purple-800' },
];

function AnomalyBarChart() {
  const months = [
    { month: 'Sep', units: 255, amount: 570 },
    { month: 'Oct', units: 210, amount: 465 },
    { month: 'Nov', units: 230, amount: 510 },
    { month: 'Dec', units: 280, amount: 620 },
    { month: 'Jan', units: 245, amount: 540 },
    { month: 'Feb', units: 540, amount: 1247, anomaly: true },
  ];

  const maxUnits = Math.max(...months.map(m => m.units));
  const chartHeight = 80;
  const barWidth = 32;
  const gap = 12;
  const totalWidth = months.length * (barWidth + gap) - gap;

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-gray-700">
          6-Month Consumption (units)
        </p>
        <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200 font-medium">
          ⚠️ Feb anomaly detected
        </span>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${totalWidth + 20} ${chartHeight + 40}`}
        className="overflow-visible"
      >
        {months.map((m, i) => {
          const barHeight = (m.units / maxUnits) * chartHeight;
          const x = i * (barWidth + gap);
          const y = chartHeight - barHeight;

          return (
            <g key={m.month}>
              {/* Bar */}
              <motion.rect
                x={x}
                y={y + 4}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={m.anomaly ? '#EF4444' : '#3B82F6'}
                opacity={m.anomaly ? 1 : 0.6}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  ease: 'easeOut',
                }}
                style={{ transformOrigin: `${x + barWidth / 2}px ${chartHeight + 4}px` }}
              />

              {/* Anomaly glow effect */}
              {m.anomaly && (
                <motion.rect
                  x={x - 2}
                  y={y + 2}
                  width={barWidth + 4}
                  height={barHeight + 4}
                  rx={6}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth={2}
                  opacity={0.4}
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Units label on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y}
                textAnchor="middle"
                fontSize={m.anomaly ? 11 : 9}
                fontWeight={m.anomaly ? 'bold' : 'normal'}
                fill={m.anomaly ? '#EF4444' : '#6B7280'}
              >
                {m.units}
              </text>

              {/* Month label below */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                fontSize={10}
                fill={m.anomaly ? '#EF4444' : '#9CA3AF'}
                fontWeight={m.anomaly ? 'bold' : 'normal'}
              >
                {m.month}
              </text>

              {/* Anomaly arrow */}
              {m.anomaly && (
                <text
                  x={x + barWidth / 2}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize={14}
                >
                  ↑
                </text>
              )}
            </g>
          );
        })}

        {/* Average line */}
        {(() => {
          const avgUnits = 245;
          const avgY = chartHeight - (avgUnits / maxUnits) * chartHeight + 4;
          return (
            <g>
              <line
                x1={0}
                y1={avgY}
                x2={totalWidth}
                y2={avgY}
                stroke="#9CA3AF"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <text
                x={totalWidth + 4}
                y={avgY + 4}
                fontSize={9}
                fill="#9CA3AF"
              >
                avg
              </text>
            </g>
          );
        })()}
      </svg>

      <p className="text-xs text-red-500 font-medium mt-1">
        Feb consumption is 2.2× your 6-month average — AI flagged for review
      </p>
    </div>
  );
}

function ElectricityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useDynamicTranslation();
  const initialTab = (searchParams.get('tab') as Tab) ?? 'bill';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeDone, setRechargeDone] = useState(false);
  const [connectionSubmitted, setConnectionSubmitted] = useState(false);
  const [loadType, setLoadType] = useState<'increase' | 'decrease' | null>(null);
  const [loadValue, setLoadValue] = useState('');
  const [outageText, setOutageText] = useState('');
  const [outageDone, setOutageDone] = useState(false);
  const [meterText, setMeterText] = useState('');
  const [meterDone, setMeterDone] = useState(false);

  const downloadHistory = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Electricity Bill History — Last 12 Months', 14, 22);
    doc.setFontSize(10);
    doc.text('Consumer: MH-NP-2024-001247 · Rahul Sharma', 14, 32);
    let y = 45;
    BILL_HISTORY.forEach((h, i) => {
      doc.text(`${i + 1}. ${h.month} — ${h.units} units — Rs. ${h.amount.toFixed(2)} — ${h.status}${h.anomaly ? ' ⚠️' : ''}`, 14, y);
      y += 9;
    });
    doc.save('Electricity_Bill_History.pdf');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F0F7FF]">
      <div className="bg-gradient-to-r from-[#002868] to-[#004085] text-white px-6 py-6 flex items-center gap-4 shrink-0 shadow-md">
        <button onClick={() => router.push('/kiosk/dashboard')} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl"><Zap className="w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-black">{t('Electricity Services')}</h1>
            <p className="text-yellow-100 text-sm">MH-NP-2024-001247 · MSEDCL</p>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 px-4 py-3 bg-white border-b shrink-0" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl font-bold text-base transition-all shrink-0 ${active ? 'bg-[#004085] text-white shadow-md' : 'bg-white text-[#4A6FA5] hover:bg-[#E8F4FD] hover:text-[#002868] border border-[#BEE3F8]'}`}>
              <Icon className="w-4 h-4" />
              {t(tab.label)}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">

            {activeTab === 'bill' && (
              <div className="space-y-5">
                <AnomalyBarChart />
                <div className="bg-[#FFFBEB] border-2 border-[#FBD38D] rounded-3xl p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
                    <div className="flex-grow">
                      <h3 className="text-lg font-black text-amber-800 mb-1">⚠️ {t('Consumption Anomaly Detected')}</h3>
                      <p className="text-amber-700">{t('This bill (₹1,247.50) is')} <strong>2.31× {t('higher')}</strong> {t('than your average (₹540). Units consumed: 540 vs usual ~235.')}</p>
                      <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="bg-white text-amber-800 border-amber-300" onClick={() => router.push('/kiosk/pay')}>{t('Dispute Bill')}</Button>
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => router.push('/kiosk/pay')}>{t('Pay ₹1,247.50')}</Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#BEE3F8]">
                  <h2 className="text-xl font-black mb-4">{t('Bill Details — Feb 2026')}</h2>
                  {[{ l: 'Consumer No.', v: 'MH-NP-2024-001247' }, { l: 'Provider', v: 'MSEDCL' }, { l: 'Units Consumed', v: '540 kWh' }, { l: 'Fixed Charges', v: '₹499.00' }, { l: 'Variable', v: '₹561.37' }, { l: 'Taxes', v: '₹187.13' }, { l: 'Total Due', v: '₹1,247.50' }, { l: 'Due Date', v: 'May 15, 2026' }].map((r) => (
                    <div key={r.l} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500 text-sm">{t(r.l)}</span>
                      <span className="font-semibold text-gray-900">{r.v}</span>
                    </div>
                  ))}
                  <Button className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full mt-4" onClick={() => router.push('/kiosk/pay')}>
                    <CreditCard className="w-4 h-4 mr-2" />{t('Proceed to Payment')}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-3xl p-8 shadow-md border-2 border-[#BEE3F8]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-3"><Clock className="w-7 h-7 text-[#004085]" />{t('Bill History — Last 12 Months')}</h2>
                  <Button onClick={downloadHistory} variant="outline" className="gap-2 shrink-0"><Download className="w-4 h-4" />{t('PDF')}</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border">
                      <th className="text-left p-3 font-bold">{t('Month')}</th>
                      <th className="text-right p-3 font-bold">{t('Units')}</th>
                      <th className="text-right p-3 font-bold">{t('Amount')}</th>
                      <th className="text-center p-3 font-bold">{t('Status')}</th>
                    </tr></thead>
                    <tbody>
                      {BILL_HISTORY.map((h, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-yellow-50/30">
                          <td className="p-3 font-medium">{h.month} {h.anomaly && <span className="text-orange-500 text-xs ml-1">⚠️</span>}</td>
                          <td className="p-3 text-right">{h.units}</td>
                          <td className="p-3 text-right font-bold">₹{h.amount.toFixed(2)}</td>
                          <td className="p-3 text-center"><span className={`text-xs font-bold px-2 py-1 rounded-full ${h.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t(h.status)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'connection' && (
              <div className="bg-white rounded-3xl p-8 shadow-md border-2 border-[#BEE3F8]">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Plus className="w-7 h-7 text-[#004085]" />{t('New Electricity Connection Request')}</h2>
                {connectionSubmitted ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold mb-2">{t('Application Submitted!')}</h3>
                    <p className="text-gray-500">{t('Application ID: MSEDCL-NEW-')}
                      <span className="font-mono font-bold">{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
                    </p>
                    <p className="text-gray-400 text-sm mt-2">{t('Track your application status in the "Complaint Tracking" tab. Est. 15–30 days.')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[{ label: 'Applicant Name', type: 'text', placeholder: 'Full name as on Aadhaar' }, { label: 'Property Address', type: 'text', placeholder: 'Full address with PIN code' }, { label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile' }, { label: 'Estimated Load Required (kW)', type: 'number', placeholder: 'e.g. 2' }].map((f) => (
                      <div key={f.label}>
                        <label className="block text-sm font-semibold mb-2">{t(f.label)}</label>
                        <input type={f.type} placeholder={t(f.placeholder)} className="bg-white border-2 border-[#90CDF4] rounded-xl px-5 py-4 text-xl text-[#0A1628] font-medium min-h-[60px] w-full placeholder:text-[#4A6FA5] transition-all focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] outline-none" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Upload Documents (Aadhaar + Property Proof)')}</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 cursor-pointer">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">{t('Tap to upload via DigiLocker or Scanner')}</p>
                      </div>
                    </div>
                    <Button className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full" onClick={() => setConnectionSubmitted(true)}>{t('Submit New Connection Request')}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'load' && (
              <div className="bg-white rounded-3xl p-8 shadow-md border-2 border-[#BEE3F8]">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Zap className="w-7 h-7 text-[#004085]" />{t('Load Change Application')}</h2>
                <div className="space-y-5">
                  <div className="p-4 bg-gray-50 rounded-2xl border">
                    <p className="text-sm font-bold text-gray-500 mb-1">{t('Current Sanctioned Load')}</p>
                    <p className="text-2xl font-black">3.0 kW</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-3">{t('Type of Change')}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(['increase', 'decrease'] as const).map((type) => (
                        <button key={type} onClick={() => setLoadType(type)} className={`p-4 rounded-2xl border-2 font-bold transition-all ${loadType === type ? 'border-[#004085] bg-[#EBF8FF] text-[#004085] shadow-sm' : 'border-gray-200'}`}>
                          {type === 'increase' ? '⬆️' : '⬇️'} {t(type === 'increase' ? 'Increase Load' : 'Decrease Load')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">{t('Requested Load (kW)')}</label>
                    <input type="number" min="0.5" max="50" step="0.5" placeholder="e.g. 5" className="bg-white border-2 border-[#90CDF4] rounded-xl px-5 py-4 text-xl text-[#0A1628] font-medium min-h-[60px] w-full placeholder:text-[#4A6FA5] transition-all focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] outline-none" value={loadValue} onChange={(e) => setLoadValue(e.target.value)} />
                  </div>
                  <Button className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full" disabled={!loadType || !loadValue} onClick={() => alert(t('Load change application submitted. Processing time: 15 days.'))}>{t('Submit Load Change Request')}</Button>
                </div>
              </div>
            )}

            {activeTab === 'outage' && (
              <div className="bg-white rounded-3xl p-8 shadow-md border-2 border-[#BEE3F8]">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><AlertTriangle className="w-7 h-7 text-[#004085]" />{t('Outage Complaint')}</h2>
                {outageDone ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold mb-2">{t('Outage Complaint Filed!')}</h3>
                    <p className="text-gray-400 text-sm">{t('SLA: Resolution within 4 hours for urban, 24 hours for rural areas.')}</p>
                    <Button className="mt-4" onClick={() => router.push('/kiosk/queue')}>{t('Track Complaint')}</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Location / Area Affected')}</label>
                      <div className="flex gap-3">
                        <input type="text" placeholder={t('Enter area / street name')} className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] outline-none" />
                        <button className="bg-yellow-100 text-yellow-700 px-4 rounded-xl font-semibold flex items-center gap-2 border-2 border-yellow-200">
                          <MapPin className="w-4 h-4" />{t('Pin')}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Describe the outage')}</label>
                      <textarea className="w-full border-2 border-gray-200 rounded-xl p-3 min-h-[120px] focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] outline-none resize-none" placeholder={t('Complete outage / flickering? Since when? Any visible damage?')} value={outageText} onChange={(e) => setOutageText(e.target.value)} />
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50">
                      <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-500">{t('Attach photo (optional)')}</p>
                    </div>
                    <Button className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full" disabled={outageText.length < 10} onClick={() => setOutageDone(true)}>{t('Submit Outage Complaint')}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'meter' && (
              <div className="bg-white rounded-3xl p-8 shadow-md border-2 border-[#BEE3F8]">
                <h2 className="text-2xl font-black mb-2 flex items-center gap-3"><Zap className="w-7 h-7 text-[#004085]" />{t('Meter Complaint')}</h2>
                <p className="text-gray-500 mb-6">{t('Fast-track escalation to DISCOM Meter Division.')}</p>
                {meterDone ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold mb-2">{t('Meter Complaint Escalated!')}</h3>
                    <p className="text-gray-400 text-sm">{t('A DISCOM meter inspector will visit within 48 hours.')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Meter Issue Type')}</label>
                      <select className="bg-white border-2 border-[#90CDF4] rounded-xl px-5 py-4 text-xl text-[#0A1628] font-medium min-h-[60px] w-full placeholder:text-[#4A6FA5] transition-all outline-none focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8]">
                        {['Running fast / slow', 'Meter not working / blank', 'Incorrect reading', 'Damaged meter box', 'Meter tampered'].map(o => <option key={o}>{t(o)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Meter Serial Number')}</label>
                      <input type="text" placeholder="e.g. MSB-2024-XXXXX" className="bg-white border-2 border-[#90CDF4] rounded-xl px-5 py-4 text-xl text-[#0A1628] font-medium min-h-[60px] w-full placeholder:text-[#4A6FA5] transition-all focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] outline-none font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Additional Details')}</label>
                      <textarea className="w-full border-2 border-gray-200 rounded-xl p-3 min-h-[100px] focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] outline-none resize-none" value={meterText} onChange={(e) => setMeterText(e.target.value)} placeholder={t('Any other details about the meter issue...')} />
                    </div>
                    <Button className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full" onClick={() => setMeterDone(true)}>{t('Escalate to DISCOM Meter Division')}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prepaid' && (
              <div className="bg-white rounded-3xl p-8 shadow-md border-2 border-[#BEE3F8]">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Smartphone className="w-7 h-7 text-[#004085]" />{t('Prepaid Meter Recharge')}</h2>
                {rechargeDone ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold mb-2">{t('Recharge Successful!')}</h3>
                    <p className="text-gray-600">₹{rechargeAmount} {t('added to your prepaid meter')}</p>
                    <p className="text-gray-400 text-sm mt-2">{t('Balance updated within 2 minutes.')}</p>
                    <Button className="mt-4" onClick={() => { setRechargeDone(false); setRechargeAmount(''); }}>{t('Recharge Again')}</Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="p-4 bg-gray-50 rounded-2xl border">
                      <p className="text-sm font-bold text-gray-500 mb-1">{t('Current Balance')}</p>
                      <p className="text-3xl font-black">₹85.40</p>
                      <p className="text-xs text-orange-500 mt-1">{t('Low balance! Recharge soon.')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Select Recharge Amount')}</label>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {['100', '200', '500', '1000', '2000', '5000'].map((amt) => (
                          <button key={amt} onClick={() => setRechargeAmount(amt)} className={`p-3 rounded-xl border-2 font-bold transition-all ${rechargeAmount === amt ? 'border-[#004085] bg-[#EBF8FF] text-[#004085] shadow-sm' : 'border-gray-200 hover:border-yellow-300'}`}>
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                      <input type="number" placeholder={t('Or enter custom amount')} className="bg-white border-2 border-[#90CDF4] rounded-xl px-5 py-4 text-xl text-[#0A1628] font-medium min-h-[60px] w-full placeholder:text-[#4A6FA5] transition-all focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] outline-none" value={rechargeAmount} onChange={(e) => setRechargeAmount(e.target.value)} />
                    </div>
                    <Button className="w-full bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] shadow-md text-white text-lg py-6" disabled={!rechargeAmount || Number(rechargeAmount) < 10} onClick={() => router.push('/kiosk/pay')}>{t('Proceed to Pay')} {rechargeAmount && `₹${rechargeAmount}`}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'track' && (
              <div className="space-y-5">
                <h2 className="text-2xl font-black flex items-center gap-3"><Clock className="w-7 h-7 text-[#004085]" />{t('Complaint Tracking')}</h2>
                {[{ id: 'TKT-ELEC-2026-8821', type: 'Outage', dept: 'MSEDCL Distribution', pos: 12, sla: '4 hrs', status: 'In Progress' }, { id: 'TKT-ELEC-2026-7654', type: 'Bill Dispute', dept: 'MSEDCL Billing', pos: 4, sla: '48 hrs', status: 'Under Review' }].map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-2xl p-8 shadow-md border-2 border-[#BEE3F8]">
                    <div className="flex items-start justify-between mb-4">
                      <div><p className="font-mono font-bold text-gray-900">{ticket.id}</p><p className="text-gray-500 text-sm">{t(ticket.type)} · {ticket.dept}</p></div>
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{t(ticket.status)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-xl text-center">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">{t('Queue Position')}</p>
                        <p className="text-2xl font-black">#{ticket.pos}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl text-center">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">{t('SLA Target')}</p>
                        <p className="text-2xl font-black">{ticket.sla}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => router.push('/kiosk/queue')}>{t('View Full Queue Dashboard')}</Button>
              </div>
            )}

            {activeTab === 'policy' && (
              <div className="space-y-5">
                <h2 className="text-2xl font-black flex items-center gap-3"><Gift className="w-7 h-7 text-[#004085]" />{t('Policy Benefits & Schemes')}</h2>
                {POLICIES.map((p) => (
                  <div key={p.title} className={`rounded-3xl p-6 border-2 ${p.color}`}>
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{p.icon}</span>
                      <div>
                        <h3 className="font-black text-lg mb-1">{p.title}</h3>
                        <p className="text-sm leading-relaxed">{p.desc}</p>
                        <button className="mt-3 flex items-center gap-1 text-sm font-bold">{t('Check Eligibility')} <ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ElectricityPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-[#F0F7FF]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004085]"></div>
      </div>
    }>
      <ElectricityContent />
    </Suspense>
  );
}
