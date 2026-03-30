'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Flame, ArrowLeft, Calendar, CheckCircle2, AlertTriangle,
  Download, MapPin, Phone, FileText, Gift, Package,
  Truck, ChevronRight, User, ShieldCheck, Info, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { jsPDF } from 'jspdf';

type Tab = 'refill' | 'subsidy' | 'kyc' | 'tracking' | 'emergency' | 'address' | 'history' | 'grievance' | 'policy';

const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'refill', label: 'Refill Booking', icon: Package },
  { id: 'subsidy', label: 'Subsidy Status', icon: ShieldCheck },
  { id: 'kyc', label: 'KYC Update', icon: User },
  { id: 'tracking', label: 'Delivery Tracking', icon: Truck },
  { id: 'emergency', label: 'Leakage Emergency', icon: AlertTriangle, badge: 'SOS' },
  { id: 'address', label: 'Address Update', icon: MapPin },
  { id: 'history', label: 'Refill History', icon: Clock },
  { id: 'grievance', label: 'Grievance', icon: FileText },
  { id: 'policy', label: 'Policy Benefits', icon: Gift },
];

const DELIVERY_STEPS = [
  { label: 'Order Placed', done: true },
  { label: 'Confirmed by Distributor', done: true },
  { label: 'Dispatched', done: true },
  { label: 'Out for Delivery', done: false },
  { label: 'Delivered', done: false },
];

const HISTORY = [
  { month: 'Feb 2026', date: '14 Feb', amount: 899 },
  { month: 'Dec 2025', date: '19 Dec', amount: 899 },
  { month: 'Oct 2025', date: '02 Oct', amount: 880 },
  { month: 'Aug 2025', date: '21 Aug', amount: 875 },
  { month: 'Jun 2025', date: '07 Jun', amount: 862 },
  { month: 'Apr 2025', date: '15 Apr', amount: 862 },
  { month: 'Feb 2025', date: '28 Feb', amount: 858 },
  { month: 'Dec 2024', date: '05 Dec', amount: 858 },
  { month: 'Oct 2024', date: '11 Oct', amount: 852 },
  { month: 'Aug 2024', date: '22 Aug', amount: 852 },
  { month: 'Jun 2024', date: '03 Jun', amount: 840 },
  { month: 'Apr 2024', date: '17 Apr', amount: 840 },
];

const POLICIES = [
  { title: 'PM Ujjwala Yojana', desc: 'Free LPG connection for BPL households. Get a free cylinder + regulator + hose.', icon: '🏠', color: 'bg-orange-50 border-orange-200 text-orange-800' },
  { title: 'PAHAL Subsidy Auto-Enrolment', desc: 'DBT subsidy ₹200–₹300 credited directly to your bank account per cylinder.', icon: '🏦', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { title: 'State LPG Subsidy Schemes', desc: 'Your state may offer additional subsidies for women-headed and SC/ST families.', icon: '📋', color: 'bg-green-50 border-green-200 text-green-800' },
];

const SLOTS = ['9:00 AM – 12:00 PM', '12:00 PM – 3:00 PM', '3:00 PM – 6:00 PM'];

function GasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useDynamicTranslation();
  const initialTab = (searchParams.get('tab') as Tab) ?? 'refill';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [refillDate, setRefillDate] = useState('');
  const [refillSlot, setRefillSlot] = useState('');
  const [refillBooked, setRefillBooked] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [pin, setPin] = useState('');
  const [pinValid, setPinValid] = useState<boolean | null>(null);
  const [kycMethod, setKycMethod] = useState<string | null>(null);
  const [kycDone, setKycDone] = useState(false);
  const [grievanceText, setGrievanceText] = useState('');
  const [grievanceDone, setGrievanceDone] = useState(false);

  const validatePin = (v: string) => {
    setPin(v);
    setPinValid(v.length === 6 ? v.startsWith('4') || v.startsWith('5') : null);
  };

  const downloadHistory = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('LPG Refill History — Last 12 Months', 14, 22);
    doc.setFontSize(10);
    doc.text('Consumer: Rahul Sharma | MNGL-992-11A', 14, 32);
    let y = 45;
    HISTORY.forEach((h, i) => {
      doc.text(`${i + 1}. ${h.month} (${h.date}) — Rs. ${h.amount} — Delivered`, 14, y);
      y += 10;
    });
    doc.save('LPG_Refill_History.pdf');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 flex items-center gap-4 shrink-0">
        <button onClick={() => router.push('/kiosk/dashboard')} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl"><Flame className="w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-black">{t('Gas (LPG Services)')}</h1>
            <p className="text-orange-100 text-sm">MNGL-992-11A · Rahul Sharma</p>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 px-4 py-3 bg-white border-b shrink-0" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl font-semibold text-sm transition-all shrink-0 ${active ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'}`}>
              <Icon className="w-4 h-4" />
              {t(tab.label)}
              {tab.badge && <span className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full">{tab.badge}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">

            {activeTab === 'refill' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Package className="w-7 h-7 text-orange-500" />{t('LPG Refill Booking')}</h2>
                {refillBooked ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-2xl font-bold mb-2">{t('Refill Booked!')}</h3>
                    <p className="text-gray-500">{t('Slot')}: <strong>{refillSlot}</strong> {t('on')} <strong>{refillDate}</strong></p>
                    <p className="text-gray-400 text-sm mt-2">{t('SMS confirmation will be sent to your registered mobile.')}</p>
                    <Button className="mt-6" onClick={() => { setRefillBooked(false); setRefillDate(''); setRefillSlot(''); }}>{t('Book Another')}</Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-orange-700 text-sm flex gap-3">
                      <Info className="w-5 h-5 shrink-0" />{t('You are eligible for 12 subsidised cylinders per year. Used: 2 / 12.')}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Select Delivery Date')}</label>
                      <input type="date" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 outline-none" value={refillDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setRefillDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Select Delivery Slot')}</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {SLOTS.map((slot) => (
                          <button key={slot} onClick={() => setRefillSlot(slot)} className={`p-4 rounded-xl border-2 font-semibold text-sm transition-all ${refillSlot === slot ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-orange-300'}`}>
                            <Calendar className="w-4 h-4 mx-auto mb-1" />{slot}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border">
                      <p className="text-sm font-semibold text-gray-700 mb-1">{t('Delivery Address')}</p>
                      <p className="text-gray-600">B-104, Sunrise Apartments, Pune, MH 411001</p>
                    </div>
                    <Button className="w-full text-lg py-6 bg-orange-500 hover:bg-orange-600" disabled={!refillDate || !refillSlot} onClick={() => setRefillBooked(true)}>{t('Confirm Refill Booking')}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subsidy' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><ShieldCheck className="w-7 h-7 text-orange-500" />{t('PAHAL / DBT Subsidy Status')}</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[{ l: 'PAHAL Enrolment', v: 'Active ✅', c: 'text-green-600' }, { l: 'Aadhaar Linked', v: 'Yes ✅', c: 'text-green-600' }, { l: 'Bank Account', v: 'SBI ****9821', c: 'text-gray-900' }, { l: 'Last Subsidy', v: '₹228 on 14 Feb', c: 'text-gray-900' }, { l: 'DBT Status', v: 'Credited ✅', c: 'text-green-600' }, { l: 'Cylinders Left', v: '10 / 12', c: 'text-blue-600' }].map((item) => (
                    <div key={item.l} className="bg-gray-50 p-4 rounded-2xl border">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mb-1">{t(item.l)}</p>
                      <p className={`text-lg font-bold ${item.c}`}>{item.v}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-sm">
                  <strong>{t('Great!')}</strong> {t('PAHAL subsidy of ₹200–₹300 is credited to your bank within 3 working days after each delivery.')}
                </div>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><User className="w-7 h-7 text-orange-500" />{t('KYC Document Update')}</h2>
                {kycDone ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold">{t('KYC Submitted Successfully!')}</h3>
                    <p className="text-gray-500 mt-2">{t('Verification takes 2–3 working days.')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[{ id: 'digilocker', label: 'DigiLocker', desc: 'Fetch Aadhaar, Driving Licence, or PAN digitally.', icon: '🔐' }, { id: 'scanner', label: 'Physical Scanner', desc: 'Place document on kiosk scanner to upload.', icon: '📄' }, { id: 'token', label: 'Pre-uploaded Web Token', desc: 'Enter your token from the SUVIDHA WhatsApp bot.', icon: '🔑' }].map((m) => (
                      <button key={m.id} onClick={() => setKycMethod(m.id)} className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${kycMethod === m.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                        <span className="text-3xl">{m.icon}</span>
                        <div><p className="font-bold">{t(m.label)}</p><p className="text-sm text-gray-500">{t(m.desc)}</p></div>
                      </button>
                    ))}
                    <Button className="w-full bg-orange-500 hover:bg-orange-600" disabled={!kycMethod} onClick={() => setKycDone(true)}>{t('Submit KYC')}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tracking' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-2 flex items-center gap-3"><Truck className="w-7 h-7 text-orange-500" />{t('Cylinder Delivery Tracking')}</h2>
                <p className="text-gray-500 mb-8">{t('Order ID')}: <span className="font-mono font-bold">GAS-8821-2026</span></p>
                <div className="space-y-4">
                  {DELIVERY_STEPS.map((step, i) => {
                    const firstPending = DELIVERY_STEPS.findIndex(s => !s.done);
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${step.done ? 'bg-green-500 border-green-500' : i === firstPending ? 'border-orange-500 bg-orange-50 animate-pulse' : 'border-gray-200 bg-gray-50'}`}>
                          {step.done ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span className="text-xs font-bold text-gray-500">{i + 1}</span>}
                        </div>
                        <p className={`font-semibold flex-grow ${step.done ? 'text-green-700' : i === firstPending ? 'text-orange-600' : 'text-gray-400'}`}>{t(step.label)}</p>
                        {i === firstPending && <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{t('In Progress')}</span>}
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-700">
                  <strong>{t('Est. Delivery')}:</strong> Today 3–6 PM · Agent: Suresh K. (+91 98XXX XXXXX)
                </div>
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="space-y-6">
                <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-8 text-center">
                  <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-200 animate-pulse">
                    <AlertTriangle className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-red-700 mb-3">{t('GAS LEAKAGE EMERGENCY')}</h2>
                  <p className="text-red-600 text-lg font-medium mb-6">{t('DO NOT use electrical switches. Evacuate immediately. Call:')}</p>
                  <a href="tel:1906" className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white text-2xl font-black px-10 py-5 rounded-2xl shadow-xl transition-all hover:scale-105">
                    <Phone className="w-8 h-8" />1906 — Emergency Gas Helpline
                  </a>
                  <p className="text-red-400 text-sm mt-4">{t('24×7 · Free from any phone')}</p>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-sm border">
                  <h3 className="text-xl font-black mb-4">{t('Log Leakage Complaint (Same Day SLA)')}</h3>
                  <textarea className="w-full border-2 border-red-200 rounded-xl p-4 min-h-[120px] focus:border-red-400 outline-none resize-none mb-4" placeholder={t('Describe the emergency: location, smell intensity, cylinder details...')} />
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6" onClick={() => router.push('/kiosk/complaint')}>
                    <AlertTriangle className="w-5 h-5 mr-2" />{t('Submit Emergency → Same Day SLA')}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'address' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><MapPin className="w-7 h-7 text-orange-500" />{t('Address Update Request')}</h2>
                <div className="space-y-5">
                  <div className="p-4 bg-gray-50 rounded-2xl border">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t('Current Address')}</p>
                    <p className="font-semibold">B-104, Sunrise Apartments, Pune, MH 411001</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">{t('New Address')}</label>
                    <textarea className="w-full border-2 border-gray-200 rounded-xl p-3 min-h-[100px] focus:border-orange-400 outline-none resize-none" placeholder={t('Enter full new address...')} value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">{t('PIN Code (India Post Validation)')}</label>
                    <input type="text" maxLength={6} placeholder="e.g. 411001" className={`w-full p-3 border-2 rounded-xl outline-none font-mono text-lg ${pinValid === true ? 'border-green-400 bg-green-50' : pinValid === false ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-orange-400'}`} value={pin} onChange={(e) => validatePin(e.target.value.replace(/\D/g, ''))} />
                    {pinValid === false && <p className="text-red-500 text-sm mt-1">{t('Invalid PIN. Please enter a valid 6-digit India Post PIN.')}</p>}
                    {pinValid === true && <p className="text-green-600 text-sm mt-1">✅ {t('PIN Validated — Maharashtra')}</p>}
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600" disabled={!newAddress || pinValid !== true} onClick={() => alert('Address update request submitted. Verification: 5–7 business days.')}>{t('Submit Address Update')}</Button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-3"><Clock className="w-7 h-7 text-orange-500" />{t('Refill History — Last 12 Months')}</h2>
                  <Button onClick={downloadHistory} variant="outline" className="gap-2 shrink-0"><Download className="w-4 h-4" />{t('PDF')}</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border border-gray-200">
                      <th className="text-left p-3 font-bold text-gray-700">{t('Month')}</th>
                      <th className="text-left p-3 font-bold text-gray-700">{t('Date')}</th>
                      <th className="text-right p-3 font-bold text-gray-700">{t('Amount')}</th>
                      <th className="text-center p-3 font-bold text-gray-700">{t('Status')}</th>
                    </tr></thead>
                    <tbody>
                      {HISTORY.map((h, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-orange-50/30">
                          <td className="p-3 font-medium">{h.month}</td>
                          <td className="p-3 text-gray-500">{h.date}</td>
                          <td className="p-3 text-right font-bold">₹{h.amount}</td>
                          <td className="p-3 text-center"><span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{t('Delivered')}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'grievance' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><FileText className="w-7 h-7 text-orange-500" />{t('Distributor Grievance Filing')}</h2>
                {grievanceDone ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold mb-2">{t('Grievance Submitted!')}</h3>
                    <p className="text-gray-500 text-sm">{t('AI Complaint DNA routing will assign this to the correct agency. SLA: 7 days.')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <select className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-orange-400">
                      {['Delayed delivery', 'Overcharging / Price irregularity', 'Cylinder weight shortage', 'Refused delivery', 'Rude behaviour', 'Subsidy not credited', 'Other'].map(o => <option key={o}>{t(o)}</option>)}
                    </select>
                    <textarea className="w-full border-2 border-gray-200 rounded-xl p-3 min-h-[140px] focus:border-orange-400 outline-none resize-none" placeholder={t('Describe your grievance in detail — dates, amounts, distributor name...')} value={grievanceText} onChange={(e) => setGrievanceText(e.target.value)} />
                    <Button className="w-full bg-orange-500 hover:bg-orange-600" disabled={grievanceText.length < 20} onClick={() => setGrievanceDone(true)}>{t('Submit → AI DNA Routing')}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'policy' && (
              <div className="space-y-5">
                <h2 className="text-2xl font-black flex items-center gap-3"><Gift className="w-7 h-7 text-orange-500" />{t('Policy Benefits & Schemes')}</h2>
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

export default function GasPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    }>
      <GasContent />
    </Suspense>
  );
}
