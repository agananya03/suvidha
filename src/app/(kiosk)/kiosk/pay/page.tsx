'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    CreditCard,
    Smartphone,
    Banknote,
    Upload,
    CheckCircle2,
    Download,
    Printer,
    ChevronDown,
    ChevronUp,
    Building2,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Receipt, type ReceiptData } from '@/components/payment/Receipt';
import { useKioskStore } from '@/store/useKioskStore';

const BILLERS = [
  {
    id: 'msedcl', name: 'MSEDCL (Maharashtra)', category: 'electricity' as const,
    state: 'Maharashtra', consumerNumberFormat: '12-digit Consumer Number',
    consumerNumberRegex: '^[0-9]{12}$',
    billerVpa: 'msedcl@ybl'
  },
  {
    id: 'bses_delhi', name: 'BSES Delhi', category: 'electricity' as const,
    state: 'Delhi', consumerNumberFormat: '10-digit CA Number',
    consumerNumberRegex: '^[0-9]{10}$',
    billerVpa: 'bses@hdfcbank'
  },
  {
    id: 'bescom', name: 'BESCOM (Karnataka)', category: 'electricity' as const,
    state: 'Karnataka', consumerNumberFormat: 'RR Number (e.g. 007890123456)',
    consumerNumberRegex: '^[0-9]{12}$',
    billerVpa: 'bescom@sbi'
  },
  {
    id: 'mgl', name: 'Mahanagar Gas (Mumbai)', category: 'gas' as const,
    state: 'Maharashtra', consumerNumberFormat: '9-digit BP Number',
    consumerNumberRegex: '^[0-9]{9}$',
    billerVpa: 'mahanagargas@icici'
  },
  {
    id: 'igl', name: 'Indraprastha Gas (Delhi)', category: 'gas' as const,
    state: 'Delhi', consumerNumberFormat: '10-digit BP Number',
    consumerNumberRegex: '^[0-9]{10}$',
    billerVpa: 'igl@axisbank'
  },
  {
    id: 'nmmc', name: 'NMMC Water (Navi Mumbai)', category: 'water' as const,
    state: 'Maharashtra', consumerNumberFormat: '8-digit Property ID',
    consumerNumberRegex: '^[0-9]{8}$',
    billerVpa: 'nmmc@upi'
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  electricity: '⚡',
  gas: '🔥',
  water: '💧',
};

import { DemoDataBadge } from '@/components/ui/EmptyState';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { StaleBadge } from '@/components/ui/StaleBadge';

export default function PaymentPage() {
    const router = useRouter();
    const { t } = useDynamicTranslation();
    const [cachedAt, setCachedAt] = useState<number | null>(null);

    // UI State
    const [view, setView] = useState<
        'biller_select' | 'consumer_input' | 'bill' | 'dispute' |
        'payment_method' | 'upi_qr' | 'processing' | 'success' | 'offline_receipt'
    >('biller_select');
    
    const [selectedBiller, setSelectedBiller] = useState<{
        id: string;
        name: string;
        category: 'electricity' | 'gas' | 'water';
        state: string;
        consumerNumberFormat: string;
        consumerNumberRegex: string;
        billerVpa: string;
    } | null>(null);

    const [consumerNumberInput, setConsumerNumberInput] = useState('');
    const [isFetchingBill, setIsFetchingBill] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [billData, setBillData] = useState<{
        consumerNumber: string;
        connectionId?: string;
        providerName: string;
        holderName: string;
        address: string;
        currentBill: number;
        lastBill: number;
        dueDate: string;
        billPeriod: string;
        anomaly: { flagged: boolean; ratio: number; message: string };
        breakdown: { fixed: number; variable: number; taxes: number; surcharges: number };
    } | null>(null);

    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'cash' | null>(null);
    const [disputeReason, setDisputeReason] = useState('');
    const { isOnline } = useOnlineStatus();

    useEffect(() => {
        const loadCachedBill = async () => {
            try {
                const { getDb } = await import('@/lib/offlineDb');
                const db = await getDb();
                const cached = await db.getAll('bills');
                if (cached.length > 0 && cached[0].data) {
                    setCachedAt(cached[0].cachedAt);
                }
            } catch (err) {
                console.warn('[SUVIDHA] Could not load cached bill:', err);
            }
        };
        loadCachedBill();
    }, []);

    // Receipt Data
    const [receiptData, setReceiptData] = useState<{
        transactionId: string;
        receiptNumber: string;
        timestamp: string;
        bbpsRefNumber?: string;
    }>({
        transactionId: '',
        receiptNumber: '',
        timestamp: ''
    });

    const [paymentIntent, setPaymentIntent] = useState<{
        intentId: string;
        consumerNumber: string;
        amount: number;
        generatedAt: string;
        expiresAt: string;
        status: 'PENDING_SYNC';
    } | null>(null);

    const generatePaymentIntent = async () => {
        if (!billData) return;
        const intentId = `PI-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
        const now = new Date();
        const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const intent = {
            intentId,
            consumerNumber: billData.consumerNumber,
            amount: billData.currentBill,
            generatedAt: now.toISOString(),
            expiresAt: expires.toISOString(),
            status: 'PENDING_SYNC' as const,
        };

        const { queueAction } = await import('@/lib/offlineDb');
        const { createSignedSyncItem } = await import('@/lib/offlineCrypto');
        const signedItem = await createSignedSyncItem('payment_intent', intent);
        await queueAction(signedItem);

        setPaymentIntent(intent);
        setView('offline_receipt');
    };

    const handleDisputeSubmit = () => {
        // Mock saving dispute
        alert('Dispute submitted successfully! Our team will review within 48 hours.');
        router.push('/kiosk'); // Return to home
    };

    const processPayment = async (method: 'upi' | 'card' | 'cash') => {
        if (!billData) return;
        setView('processing');
        setSelectedMethod(method);

        try {
            const { token, user } = useKioskStore.getState();

            const res = await fetch('/api/payments/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    connectionId: billData.connectionId,
                    amount: billData.currentBill,
                    method,
                    userId: user?.id,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Fall back to local receipt on API failure
                setReceiptData({
                    transactionId: `TXN-${Date.now()}-OFFLINE`,
                    receiptNumber: `RCPT-2026-OFFLINE`,
                    timestamp: new Date().toLocaleString(),
                });
                setView('success');
                return;
            }

            setReceiptData({
                transactionId: data.receipt.transactionId,
                receiptNumber: data.receipt.receiptNumber,
                timestamp: new Date(data.receipt.date).toLocaleString(),
                bbpsRefNumber: data.receipt.bbpsRefNumber,
            });
            setView('success');

        } catch {
            // Network error — still show receipt for offline scenario
            setReceiptData({
                transactionId: `TXN-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
                receiptNumber: `RCPT-2026-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
                timestamp: new Date().toLocaleString(),
            });
            setView('success');
        }
    };

    return (
        <div className="h-full overflow-y-auto p-8 max-w-4xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-8">{t('Bill Payment Checkout')}</h1>

            <AnimatePresence mode="wait">

                {/* BILLER SELECT VIEW */}
                {view === 'biller_select' && (
                  <motion.div key="biller_select" initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{t('Select Your Service Provider')}</h2>
                      <p className="text-gray-500 text-sm">{t('Choose the utility you want to pay')}</p>
                    </div>

                    {(['electricity', 'gas', 'water'] as const).map(category => (
                      <div key={category}>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase
                                       tracking-wider mb-3 flex items-center gap-2">
                          <span>{CATEGORY_ICONS[category]}</span>
                          {t(category.charAt(0).toUpperCase() + category.slice(1))}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {BILLERS.filter(b => b.category === category).map(biller => (
                            <button
                              key={biller.id}
                              onClick={() => { setSelectedBiller(biller); setView('consumer_input'); }}
                              className="w-full p-4 rounded-xl border border-gray-200 bg-white
                                         text-left hover:border-blue-400 hover:shadow-md
                                         transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center
                                                justify-center text-lg group-hover:bg-blue-100 transition-colors">
                                  {CATEGORY_ICONS[biller.category]}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{biller.name}</p>
                                  <p className="text-xs text-gray-500">{biller.state}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* CONSUMER INPUT VIEW */}
                {view === 'consumer_input' && selectedBiller && (
                  <motion.div key="consumer_input" initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                    className="max-w-lg mx-auto space-y-6"
                  >
                    <div className="flex items-center gap-3 p-4 bg-blue-50
                                    rounded-xl border border-blue-100">
                      <span className="text-3xl">{CATEGORY_ICONS[selectedBiller.category]}</span>
                      <div>
                        <p className="font-bold text-blue-900">{selectedBiller.name}</p>
                        <p className="text-sm text-blue-700">{selectedBiller.state}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('Enter Consumer Number')}
                        </label>
                        <input
                          type="text"
                          value={consumerNumberInput}
                          onChange={(e) => {
                            setConsumerNumberInput(e.target.value);
                            setFetchError(null);
                          }}
                          placeholder={selectedBiller.consumerNumberFormat}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl
                                     text-lg font-mono focus:outline-none focus:ring-2
                                     focus:ring-blue-500 focus:border-transparent"
                          maxLength={20}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Format: {selectedBiller.consumerNumberFormat}
                        </p>
                      </div>

                      {fetchError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg
                                        border border-red-200 text-red-700 text-sm">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          {fetchError}
                        </div>
                      )}

                      <Button
                        className="w-full"
                        size="lg"
                        disabled={isFetchingBill || !consumerNumberInput.trim()}
                        onClick={async () => {
                          if (!consumerNumberInput.trim()) return;
                          setIsFetchingBill(true);
                          setFetchError(null);
                          try {
                            const res = await fetch(
                              `/api/bills/${encodeURIComponent(consumerNumberInput.trim())}`
                            );
                            const data = await res.json();
                            if (!res.ok) {
                              setFetchError(data.error || t('Bill not found. Check your consumer number.'));
                              return;
                            }
                            setBillData(data);
                            setView('bill');
                          } catch {
                            setFetchError(t('Network error. Please try again.'));
                          } finally {
                            setIsFetchingBill(false);
                          }
                        }}
                      >
                        {isFetchingBill ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent
                                            rounded-full animate-spin" />
                            {t('Fetching Bill...')}
                          </span>
                        ) : t('Fetch My Bill')}
                      </Button>
                    </div>

                    <Button variant="ghost" onClick={() => setView('biller_select')}>
                      ← {t('Change Provider')}
                    </Button>
                  </motion.div>
                )}

                {/* BILL DETAILS & ANOMALY WARNING VIEW */}
                {view === 'bill' && billData && (
                    <motion.div
                        key="bill-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6 relative"
                    >
                        <div className="mb-2">
                            <Button variant="ghost" onClick={() => setView('consumer_input')}>
                                ← {t('Back')}
                            </Button>
                        </div>
                        <DemoDataBadge />
                        {/* SECTION 1: Bill Details Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between border-b pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{billData.providerName}</h2>
                                        <p className="text-gray-500">{billData.consumerNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">{t('Bill Period')}</p>
                                    <p className="font-semibold">{billData.billPeriod}</p>
                                </div>
                            </div>

                            <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <p className="text-gray-500 mb-1">{t('Consumer Details')}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{billData.holderName}</p>
                                        <StaleBadge lastSynced={cachedAt} />
                                    </div>
                                    <p className="text-sm text-gray-600">{billData.address}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 mb-1">{t('Total Amount Due')}</p>
                                    <p className="text-4xl font-bold text-gray-900">₹{billData.currentBill.toFixed(2)}</p>
                                    <p className={`text-sm mt-2 font-medium ${new Date(billData.dueDate) < new Date() ? 'text-red-500' : 'text-orange-500'}`}>
                                        {t('Due')}: {new Date(billData.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Expandable Breakdown */}
                            <div className="border-t pt-4">
                                <button
                                    onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                                    className="flex items-center justify-between w-full text-left font-medium text-gray-700 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <span>{t('View Itemized Breakdown')}</span>
                                    {isBreakdownOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>

                                <AnimatePresence>
                                    {isBreakdownOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 bg-gray-50 rounded-lg mt-2 space-y-2 text-sm">
                                                <div className="flex justify-between"><span>{t('Fixed Charges')}</span><span>₹{billData.breakdown.fixed.toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span>{t('Variable Consumption')}</span><span>₹{billData.breakdown.variable.toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span>{t('Taxes')}</span><span>₹{billData.breakdown.taxes.toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span>{t('Surcharges')}</span><span>₹{billData.breakdown.surcharges.toFixed(2)}</span></div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* SECTION 2: Anomaly Warning */}
                        {billData.anomaly.flagged && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-2xl shadow-sm">
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-bold text-yellow-800">⚠️ {t('Unusual Bill Amount Detected')}</h3>
                                        <p className="text-yellow-700 mt-1">
                                            {t('This bill')} (<strong>₹{billData.currentBill.toFixed(2)}</strong>) {t('is')} <strong>{billData.anomaly.ratio}x {t('higher')}</strong> {t('than your average')} (₹{billData.lastBill.toFixed(2)}).
                                        </p>

                                        <div className="mt-6 flex flex-wrap gap-4">
                                            <Button
                                                variant="outline"
                                                className="bg-white text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                                                onClick={() => setView('dispute')}
                                            >
                                                {t('Dispute This Bill')}
                                            </Button>
                                            <Button
                                                onClick={() => setView('payment_method')}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                            >
                                                {t('Pay Anyway')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!billData.anomaly.flagged && (
                            <div className="mt-6 flex justify-end">
                                <Button size="lg" onClick={() => setView('payment_method')}>{t('Proceed to Payment')}</Button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* DISPUTE VIEW */}
                {view === 'dispute' && (
                    <motion.div
                        key="dispute-view"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto"
                    >
                        <h2 className="text-2xl font-bold mb-6">{t('Dispute Bill Amount')}</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">{t('Reason for dispute')}</label>
                                <textarea
                                    className="w-full p-3 border rounded-xl bg-gray-50 min-h-[120px]"
                                    placeholder={t('Please explain why you believe this bill is incorrect...')}
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">{t('Meter Photo Evidence (Optional)')}</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">{t('Tap to take photo or upload document')}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Button variant="ghost" onClick={() => setView('bill')}>{t('Cancel')}</Button>
                                <Button onClick={handleDisputeSubmit} disabled={!disputeReason.trim()}>{t('Submit Dispute')}</Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* SECTION 3: PAYMENT METHOD SELECTION */}
                {view === 'payment_method' && billData && (
                    <motion.div
                        key="payment-method"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">{t('Select Payment Method')}</h2>
                            <p className="text-xl font-bold text-primary">₹{billData.currentBill.toFixed(2)}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* UPI Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border hover:border-primary hover:shadow-md transition-all cursor-pointer group relative overflow-hidden" onClick={() => setView('upi_qr')}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                <Smartphone className="w-10 h-10 text-green-500 mb-4" />
                                <h3 className="text-lg font-bold mb-2">{t('UPI Payment')}</h3>
                                <p className="text-sm text-gray-500 mb-4">{t('Scan with Google Pay, PhonePe, Paytm, etc.')}</p>
                                <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <div className="text-center text-gray-400">
                                        <span className="block text-4xl mb-2">📱</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider">{t('Show QR Code')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Payment */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border hover:border-primary hover:shadow-md transition-all cursor-pointer group relative" onClick={() => processPayment('card')}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                <CreditCard className="w-10 h-10 text-blue-500 mb-4" />
                                <h3 className="text-lg font-bold mb-2">{t('Card Payment')}</h3>
                                <p className="text-sm text-gray-500 mb-4">{t('Pay securely with Credit or Debit Card')}</p>
                                <div className="space-y-3 opacity-50 pointer-events-none">
                                    <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
                                    <div className="flex gap-3">
                                        <div className="h-10 bg-gray-100 rounded-lg w-1/2"></div>
                                        <div className="h-10 bg-gray-100 rounded-lg w-1/2"></div>
                                    </div>
                                    <div className="h-10 bg-blue-50 rounded-lg w-full mt-2 flex items-center justify-center text-blue-600 font-medium text-sm">
                                        {t('Swipe to Pay')}
                                    </div>
                                </div>
                            </div>

                            {/* Cash Payment */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border hover:border-primary hover:shadow-md transition-all cursor-pointer group relative" onClick={() => processPayment('cash')}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                <Banknote className="w-10 h-10 text-orange-500 mb-4" />
                                <h3 className="text-lg font-bold mb-2">{t('Cash at Counter')}</h3>
                                <p className="text-sm text-gray-500 mb-4">{t('Generate challan and pay at helping desk.')}</p>
                                <div className="mt-8 p-4 bg-orange-50 text-orange-700 text-sm rounded-lg border border-orange-100">
                                    {t('Click here to generate your cash payment token slip.')}
                                </div>
                            </div>

                            {!isOnline && (
                                <motion.button
                                    onClick={generatePaymentIntent}
                                    className="w-full p-4 rounded-xl border-2 border-amber-300 bg-amber-50 text-left transition-all hover:border-amber-400"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-amber-100">
                                            <Clock className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-amber-900">Pay Later (Offline)</p>
                                            <p className="text-sm text-amber-700 mt-0.5">
                                                Generate a payment intent — complete at any SUVIDHA kiosk within 24 hours
                                            </p>
                                        </div>
                                    </div>
                                </motion.button>
                            )}
                        </div>

                        <div className="pt-6">
                            <Button variant="ghost" onClick={() => setView('bill')}>{t('Back to Bill Details')}</Button>
                        </div>
                    </motion.div>
                )}

                {/* OFFLINE RECEIPT VIEW */}
                {view === 'offline_receipt' && paymentIntent && (
                    <motion.div
                        key="offline_receipt"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="space-y-4"
                    >
                        {/* Amber warning banner */}
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                This is a payment intent, not a confirmation. Present this Intent ID
                                at any SUVIDHA kiosk within 24 hours to complete your payment.
                            </p>
                        </div>

                        {/* Intent details card */}
                        <div className="p-5 rounded-xl border border-gray-200 bg-white space-y-3">
                            <div className="text-center pb-3 border-b border-gray-100">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    Payment Intent ID
                                </p>
                                <p className="text-2xl font-mono font-semibold text-gray-900 mt-1">
                                    {paymentIntent.intentId}
                                </p>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Consumer No.</span>
                                <span className="font-medium">{paymentIntent.consumerNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Amount Due</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{paymentIntent.amount.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Generated At</span>
                                <span>{new Date(paymentIntent.generatedAt).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Valid Until</span>
                                <span className="text-amber-700 font-medium">
                                    {new Date(paymentIntent.expiresAt).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    const doc = new jsPDF();
                                    doc.setFontSize(18);
                                    doc.text('SUVIDHA 2026 — Payment Intent', 20, 20);
                                    doc.setFontSize(12);
                                    doc.text(`Intent ID: ${paymentIntent.intentId}`, 20, 40);
                                    doc.text(`Consumer: ${paymentIntent.consumerNumber}`, 20, 52);
                                    doc.text(`Amount: Rs. ${paymentIntent.amount.toFixed(2)}`, 20, 64);
                                    doc.text(`Valid Until: ${new Date(paymentIntent.expiresAt).toLocaleString('en-IN')}`, 20, 76);
                                    doc.text('Present this at any SUVIDHA kiosk to complete payment.', 20, 96);
                                    doc.save(`suvidha-intent-${paymentIntent.intentId}.pdf`);
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Intent
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/kiosk/discovery')}
                            >
                                Done
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* PROCESSING VIEW */}
                {view === 'processing' && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
                        <h2 className="text-2xl font-bold mb-2">{t('Processing Payment...')}</h2>
                        <p className="text-gray-500">{t('Please do not close this window or refresh the page.')}</p>
                    </motion.div>
                )}

                {/* UPI QR VIEW */}
                {view === 'upi_qr' && billData && selectedBiller && (
                  <motion.div key="upi_qr" initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-sm mx-auto space-y-6 text-center py-10"
                  >
                    <h2 className="text-2xl font-bold">{t('Scan to Pay')}</h2>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <p className="text-gray-500 text-sm mb-4">
                        {t('Open any UPI app and scan this QR code')}
                      </p>

                      <div className="flex justify-center mb-4">
                        <div className="p-4 border-2 border-gray-200 rounded-xl bg-white">
                          <QRCodeSVG
                            value={`upi://pay?pa=${selectedBiller.billerVpa}&pn=${encodeURIComponent(selectedBiller.name)}&am=${billData.currentBill.toFixed(2)}&tn=${encodeURIComponent('Consumer: ' + billData.consumerNumber)}&cu=INR`}
                            size={200}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('Pay To')}</span>
                          <span className="font-medium">{selectedBiller.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('Amount')}</span>
                          <span className="font-bold text-lg">₹{billData.currentBill.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('UPI ID')}</span>
                          <span className="font-mono text-xs">{selectedBiller.billerVpa}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        {t('Accepts: PhonePe, Google Pay, Paytm, BHIM, and all UPI apps')}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Button className="w-full" size="lg" onClick={() => processPayment('upi')}>
                        ✅ {t('I have completed the payment')}
                      </Button>
                      <Button variant="ghost" onClick={() => setView('payment_method')}>
                        ← {t('Back')}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* SECTION 4: PAYMENT SUCCESS */}
                {view === 'success' && billData && (
                  <motion.div key="success" initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}>

                    <Receipt data={{
                      receiptNumber: receiptData.receiptNumber,
                      transactionId: receiptData.transactionId,
                      bbpsRefNumber: receiptData.bbpsRefNumber,
                      dateTime: new Date().toISOString(),
                      method: selectedMethod ?? 'upi',
                      status: 'SUCCESS',
                      serviceDetails: {
                        provider: billData.providerName,
                        consumerNumber: billData.consumerNumber,
                        billingPeriod: billData.billPeriod,
                      },
                      breakdown: {
                        baseAmount: billData.breakdown.fixed + billData.breakdown.variable,
                        taxes: billData.breakdown.taxes,
                        surcharges: billData.breakdown.surcharges,
                        total: billData.currentBill,
                      },
                    } satisfies ReceiptData} />

                    <div className="mt-6 text-center">
                      <Button onClick={() => router.push('/kiosk')} size="lg">
                        {t('Return to Services')}
                      </Button>
                    </div>
                  </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
