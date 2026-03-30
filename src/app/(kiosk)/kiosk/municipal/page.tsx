'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2, ArrowLeft, CreditCard, CheckCircle2, AlertTriangle,
  Download, MapPin, FileText, Gift, ChevronRight, Image as ImageIcon,
  Baby, Briefcase, Lightbulb, Construction
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { jsPDF } from 'jspdf';

type Tab = 'property' | 'water' | 'waste' | 'certificate' | 'trade' | 'streetlight' | 'pothole' | 'building' | 'policy';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'property', label: 'Property Tax', icon: CreditCard },
  { id: 'water', label: 'Water Bill', icon: Building2 },
  { id: 'waste', label: 'Waste Complaint', icon: AlertTriangle },
  { id: 'certificate', label: 'Birth/Death Cert', icon: Baby },
  { id: 'trade', label: 'Trade License', icon: Briefcase },
  { id: 'streetlight', label: 'Streetlight', icon: Lightbulb },
  { id: 'pothole', label: 'Pothole Report', icon: MapPin },
  { id: 'building', label: 'Building Permission', icon: Construction },
  { id: 'policy', label: 'Policy Benefits', icon: Gift },
];

const BUILDING_STAGES = [
  { label: 'Application Submitted', done: true },
  { label: 'Document Verification', done: true },
  { label: 'Site Inspection Scheduled', done: false },
  { label: 'Technical Approval', done: false },
  { label: 'Sanction Letter Issued', done: false },
];

const POLICIES = [
  { title: 'Jal Jeevan Mission', desc: 'Every rural/urban household is entitled to a functional tap water connection under JJM.', icon: '💧', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { title: 'PM Awas Yojana (PMAY-U)', desc: 'Housing subsidy up to ₹2.67 lakh for EWS/LIG households to build or upgrade homes.', icon: '🏠', color: 'bg-green-50 border-green-200 text-green-800' },
  { title: 'Property Tax Rebate', desc: 'Senior citizens (60+) and women property owners get 10–30% rebate on property tax.', icon: '📋', color: 'bg-purple-50 border-purple-200 text-purple-800' },
  { title: 'PMAY-U Urban Housing', desc: 'Affordable housing under Credit Linked Subsidy Scheme — interest subsidy up to 6.5%.', icon: '🏗️', color: 'bg-orange-50 border-orange-200 text-orange-800' },
];

function MunicipalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useDynamicTranslation();
  const initialTab = (searchParams.get('tab') as Tab) ?? 'property';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [taxPaid, setTaxPaid] = useState(false);
  const [waterPaid, setWaterPaid] = useState(false);
  const [wasteDone, setWasteDone] = useState(false);
  const [wasteText, setWasteText] = useState('');
  const [certType, setCertType] = useState('');
  const [certSubmitted, setCertSubmitted] = useState(false);
  const [tradeDone, setTradeDone] = useState(false);
  const [streetlightDone, setStreetlightDone] = useState(false);
  const [potholeDone, setPotholeDone] = useState(false);
  const [potholeText, setPotholeText] = useState('');

  const downloadTaxReceipt = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('NMC Property Tax Receipt', 14, 22);
    doc.setFontSize(10);
    doc.text('Property ID: PTAX-2026-X8M', 14, 32);
    doc.text('Owner: Rahul Sharma', 14, 42);
    doc.text('Address: B-104, Sunrise Apartments, Pune', 14, 52);
    doc.text('Amount Paid: Rs. 8,400.00', 14, 62);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 72);
    doc.text(`Txn ID: TXN-${Date.now()}`, 14, 82);
    doc.save('Property_Tax_Receipt.pdf');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 flex items-center gap-4 shrink-0">
        <button onClick={() => router.push('/kiosk/dashboard')} className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl"><Building2 className="w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-black">{t('Municipal Corporation')}</h1>
            <p className="text-green-100 text-sm">Nagpur Municipal Corporation (NMC)</p>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 px-4 py-3 bg-white border-b shrink-0" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl font-semibold text-sm transition-all shrink-0 ${active ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>
              <Icon className="w-4 h-4" />
              {t(tab.label)}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">

            {activeTab === 'property' && (
              <div className="space-y-5">
                <div className="bg-white rounded-3xl p-8 shadow-sm border">
                  <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><CreditCard className="w-7 h-7 text-emerald-500" />{t('Property Tax Payment')}</h2>
                  {taxPaid ? (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                      <h3 className="text-xl font-bold mb-2">{t('Payment Successful!')}</h3>
                      <p className="text-gray-500 mb-4">₹8,400.00 {t('paid for FY 2025–26')}</p>
                      <Button onClick={downloadTaxReceipt} variant="outline" className="gap-2"><Download className="w-4 h-4" />{t('Download Receipt')}</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-3">{t('Property Details (Auto-fetched by Address)')}</p>
                        {[{ l: 'Property ID', v: 'PTAX-2026-X8M' }, { l: 'Owner', v: 'Rahul Sharma' }, { l: 'Address', v: 'B-104, Sunrise Apartments, Pune' }, { l: 'Area', v: '850 sq.ft.' }, { l: 'Tax Amount', v: '₹8,400.00' }, { l: 'Due Date', v: 'Jun 30, 2026' }].map((r) => (
                          <div key={r.l} className="flex justify-between py-1.5 border-b border-green-100 last:border-0">
                            <span className="text-gray-600 text-sm">{t(r.l)}</span>
                            <span className="font-semibold text-sm">{r.v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
                        💡 {t('Senior citizens and women property owners are eligible for 10–30% tax rebate. Check Policy Benefits tab.')}
                      </div>
                      <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg py-5" onClick={() => router.push('/kiosk/pay')}>
                        <CreditCard className="w-5 h-5 mr-2" />{t('Pay ₹8,400 via UPI / Card')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'water' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Building2 className="w-7 h-7 text-emerald-500" />{t('Water Bill Payment')}</h2>
                {waterPaid ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold mb-2">{t('Payment Successful!')}</h3>
                    <p className="text-gray-500">₹450.00 {t('via BBPS — Nagpur Jal')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                      {[{ l: 'Consumer No.', v: 'WAT-7890-XX' }, { l: 'Provider', v: 'Nagpur Jal (BBPS)' }, { l: 'Bill Amount', v: '₹450.00' }, { l: 'Due Date', v: 'May 18, 2026' }, { l: 'Arrears', v: '₹0.00' }].map((r) => (
                        <div key={r.l} className="flex justify-between py-1.5 border-b border-blue-100 last:border-0">
                          <span className="text-gray-600 text-sm">{t(r.l)}</span>
                          <span className="font-semibold text-sm">{r.v}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg py-5" onClick={() => router.push('/kiosk/pay')}>
                      <CreditCard className="w-5 h-5 mr-2" />{t('Pay ₹450 via BBPS / UPI')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'waste' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><AlertTriangle className="w-7 h-7 text-emerald-500" />{t('Waste Collection Complaint')}</h2>
                {wasteDone ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold mb-2">{t('Complaint Registered!')}</h3>
                    <p className="text-gray-400 text-sm">{t('NMC Solid Waste team will attend within 24 hours.')}</p>
                    <Button className="mt-4" onClick={() => router.push('/kiosk/queue')}>{t('Track Complaint')}</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Complaint Type')}</label>
                      <select className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-400">
                        {['Garbage not collected', 'Overflowing bins', 'Littering / dumping on road', 'Dead animal not removed', 'Construction debris not cleared'].map(o => <option key={o}>{t(o)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Location (with Geo-tag)')}</label>
                      <div className="flex gap-3">
                        <input type="text" className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 outline-none" placeholder={t('Street / area name')} />
                        <button className="bg-emerald-100 text-emerald-700 px-4 rounded-xl font-semibold flex items-center gap-2 border-2 border-emerald-200"><MapPin className="w-4 h-4" />{t('GPS')}</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Description')}</label>
                      <textarea className="w-full border-2 border-gray-200 rounded-xl p-3 min-h-[100px] focus:border-emerald-400 outline-none resize-none" placeholder={t('Describe the issue in detail...')} value={wasteText} onChange={(e) => setWasteText(e.target.value)} />
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50">
                      <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-500">{t('Attach photo evidence (optional)')}</p>
                    </div>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={wasteText.length < 5} onClick={() => setWasteDone(true)}>{t('Submit Waste Complaint')}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certificate' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Baby className="w-7 h-7 text-emerald-500" />{t('Birth / Death Certificate Request')}</h2>
                {certSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold mb-2">{t('Request Submitted!')}</h3>
                    <p className="text-gray-500 text-sm">{t('Application ID: NMC-CERT-')}<span className="font-mono font-bold">{Math.random().toString(36).substring(2, 8).toUpperCase()}</span></p>
                    <p className="text-gray-400 text-sm mt-2">{t('Certificate will be issued within 7 working days. Track status below.')}</p>
                    <div className="mt-4 space-y-2">
                      {['Application Received ✅', 'Records Verification – Pending', 'Digital Certificate Issued – Pending'].map((s, i) => (
                        <div key={i} className={`text-sm p-2 rounded-lg ${i === 0 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>{s}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Certificate Type')}</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Birth Certificate', 'Death Certificate'] as const).map((type) => (
                          <button key={type} onClick={() => setCertType(type)} className={`p-4 rounded-2xl border-2 font-bold transition-all ${certType === type ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200'}`}>{type === 'Birth Certificate' ? '👶' : '📜'} {t(type)}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Full Name of Person')}</label>
                      <input type="text" placeholder={t('As on hospital records')} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Date of Birth / Death')}</label>
                      <input type="date" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Supporting Documents')}</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:bg-gray-50">
                        <ImageIcon className="w-7 h-7 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">{t('Upload Hospital Records / Aadhaar via DigiLocker')}</p>
                      </div>
                    </div>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={!certType} onClick={() => setCertSubmitted(true)}>{t('Submit Certificate Request')}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trade' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Briefcase className="w-7 h-7 text-emerald-500" />{t('Trade License Renewal')}</h2>
                {tradeDone ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold mb-2">{t('Renewal Application Submitted!')}</h3>
                    <p className="text-gray-400 text-sm">{t('Processing: 10–15 working days. You will receive SMS updates.')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <p className="text-sm font-bold text-gray-700 mb-2">{t('Document Checklist (Pre-visit Readiness Check)')}</p>
                      {['Current Trade License copy', 'Aadhaar / PAN of proprietor', 'GST Registration Certificate', 'Property tax receipt (latest)', 'Fire NOC (if applicable)', 'Shop establishment proof'].map((doc, i) => (
                        <label key={i} className="flex items-center gap-3 py-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 accent-emerald-500" />
                          <span className="text-sm text-gray-700">{t(doc)}</span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('License Number')}</label>
                      <input type="text" placeholder="e.g. NMC-TL-2024-XXXXX" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 outline-none font-mono" />
                    </div>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setTradeDone(true)}>{t('Submit Renewal Application')}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'streetlight' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Lightbulb className="w-7 h-7 text-emerald-500" />{t('Streetlight Complaint')}</h2>
                {streetlightDone ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold mb-2">{t('Complaint Filed!')}</h3>
                    <p className="text-gray-400 text-sm">{t('NMC Electrical team will repair within 48 hours.')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Issue Type')}</label>
                      <select className="w-full p-3 border-2 border-gray-200 rounded-xl outline-none focus:border-emerald-400">
                        {['Light not working', 'Flickering light', 'Damaged pole', 'Light burning in daytime (wastage)', 'Missing light in dark area'].map(o => <option key={o}>{t(o)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Location / Pole Number')}</label>
                      <div className="flex gap-3">
                        <input type="text" placeholder={t('Street name or pole number')} className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 outline-none" />
                        <button className="bg-emerald-100 text-emerald-700 px-4 rounded-xl font-semibold border-2 border-emerald-200 flex items-center gap-2"><MapPin className="w-4 h-4" />{t('Pin')}</button>
                      </div>
                    </div>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setStreetlightDone(true)}>{t('Submit Streetlight Complaint')}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pothole' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><MapPin className="w-7 h-7 text-emerald-500" />{t('Pothole Reporting')}</h2>
                {potholeDone ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
                    <h3 className="text-xl font-bold mb-2">{t('Pothole Reported!')}</h3>
                    <p className="text-gray-400 text-sm">{t('Road & Infrastructure team SLA: 7 days for repair.')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('GPS Coordinates / Address')}</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Latitude" className="p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 outline-none font-mono" defaultValue="21.1458° N" />
                        <input type="text" placeholder="Longitude" className="p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 outline-none font-mono" defaultValue="79.0882° E" />
                      </div>
                      <p className="text-xs text-emerald-600 mt-1">✅ {t('GPS captured automatically from kiosk location')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Pothole Severity')}</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Minor', 'Moderate', 'Severe'].map((s) => (
                          <button key={s} className="p-3 rounded-xl border-2 border-gray-200 font-semibold text-sm hover:border-emerald-400 hover:bg-emerald-50">{t(s)}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('Description')}</label>
                      <textarea className="w-full border-2 border-gray-200 rounded-xl p-3 min-h-[80px] focus:border-emerald-400 outline-none resize-none" placeholder={t('Road name, pothole size, accident risk...')} value={potholeText} onChange={(e) => setPotholeText(e.target.value)} />
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50">
                      <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-500">{t('Attach photo')}</p>
                    </div>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setPotholeDone(true)}>{t('Submit Pothole Report')}</Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'building' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border">
                <h2 className="text-2xl font-black mb-2 flex items-center gap-3"><Construction className="w-7 h-7 text-emerald-500" />{t('Building Permission Tracking')}</h2>
                <p className="text-gray-500 mb-6">{t('Application ID')}: <span className="font-mono font-bold">NMC-BP-2025-4921</span></p>
                <div className="space-y-4 mb-6">
                  {BUILDING_STAGES.map((stage, i) => {
                    const firstPending = BUILDING_STAGES.findIndex(s => !s.done);
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${stage.done ? 'bg-green-500 border-green-500' : i === firstPending ? 'border-emerald-500 bg-emerald-50 animate-pulse' : 'border-gray-200 bg-gray-50'}`}>
                          {stage.done ? <CheckCircle2 className="w-5 h-5 text-white" /> : <span className="text-xs font-bold text-gray-500">{i + 1}</span>}
                        </div>
                        <p className={`font-semibold flex-grow ${stage.done ? 'text-green-700' : i === firstPending ? 'text-emerald-600' : 'text-gray-400'}`}>{t(stage.label)}</p>
                        {i === firstPending && <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">{t('Next Step')}</span>}
                      </motion.div>
                    );
                  })}
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm">
                  <strong>{t('Next Step')}:</strong> {t('Site inspection is scheduled for March 25, 2026. Ensure the property is accessible between 10 AM – 4 PM.')}
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-sm">
                  <strong>{t('Documents Pending')}:</strong> {t('Structural Engineer Certificate (SE-Cert) must be uploaded before inspection.')}
                  <button className="block mt-2 font-bold underline">{t('Upload Now')}</button>
                </div>
              </div>
            )}

            {activeTab === 'policy' && (
              <div className="space-y-5">
                <h2 className="text-2xl font-black flex items-center gap-3"><Gift className="w-7 h-7 text-emerald-500" />{t('Policy Benefits & Schemes')}</h2>
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

export default function MunicipalPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <MunicipalContent />
    </Suspense>
  );
}
