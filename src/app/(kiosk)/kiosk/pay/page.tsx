'use client';

import { useState } from 'react';
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
    Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/navigation';

import { DemoDataBadge } from '@/components/ui/EmptyState';

export default function PaymentPage() {
    const router = useRouter();

    // Mock Bill State representing the fetched anomaly payload
    const [billData] = useState({
        consumerNumber: 'MH-NP-2024-001247',
        providerName: 'Maharashtra State Electricity Board',
        holderName: 'Rahul Sharma',
        address: 'B-104, Sunrise Apartments, Pune',
        currentBill: 1247.50,
        lastBill: 540.00,
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        billPeriod: 'Feb 2026',
        anomaly: {
            flagged: true,
            ratio: 2.31,
            message: 'This bill is 2.31x higher than your usual amount'
        },
        breakdown: {
            fixed: 499.00,
            variable: 561.37,
            taxes: 124.75,
            surcharges: 62.38
        }
    });

    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

    // UI State
    const [view, setView] = useState<'bill' | 'dispute' | 'payment_method' | 'processing' | 'success'>('bill');
    const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'cash' | null>(null);
    const [disputeReason, setDisputeReason] = useState('');

    // Receipt Data
    const [receiptData, setReceiptData] = useState({
        transactionId: '',
        receiptNumber: '',
        timestamp: ''
    });

    const handleDisputeSubmit = () => {
        // Mock saving dispute
        alert('Dispute submitted successfully! Our team will review within 48 hours.');
        router.push('/kiosk'); // Return to home
    };

    const simulatePayment = async (method: string) => {
        setView('processing');
        setSelectedMethod(method as 'upi' | 'card' | 'cash');

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Mock Success Response
        setReceiptData({
            transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            receiptNumber: `RCPT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            timestamp: new Date().toLocaleString()
        });

        setView('success');
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('SUVIDHA PAYMENT RECEIPT', 20, 20);

        doc.setFontSize(12);
        doc.text(`Transaction ID: ${receiptData.transactionId}`, 20, 40);
        doc.text(`Receipt Number: ${receiptData.receiptNumber}`, 20, 50);
        doc.text(`Date & Time: ${receiptData.timestamp}`, 20, 60);

        doc.text(`Consumer Number: ${billData.consumerNumber}`, 20, 80);
        doc.text(`Name: ${billData.holderName}`, 20, 90);
        doc.text(`Provider: ${billData.providerName}`, 20, 100);

        doc.setFontSize(16);
        doc.text(`Amount Paid: Rs. ${billData.currentBill.toFixed(2)}`, 20, 120);

        doc.save(`${receiptData.receiptNumber}.pdf`);
    };

    return (
        <div className="flex-grow p-8 max-w-4xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-8">Bill Payment Checkout</h1>

            <AnimatePresence mode="wait">

                {/* BILL DETAILS & ANOMALY WARNING VIEW */}
                {view === 'bill' && (
                    <motion.div
                        key="bill-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6 relative"
                    >
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
                                    <p className="text-sm text-gray-500">Bill Period</p>
                                    <p className="font-semibold">{billData.billPeriod}</p>
                                </div>
                            </div>

                            <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <p className="text-gray-500 mb-1">Consumer Details</p>
                                    <p className="font-semibold">{billData.holderName}</p>
                                    <p className="text-sm text-gray-600">{billData.address}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 mb-1">Total Amount Due</p>
                                    <p className="text-4xl font-bold text-gray-900">₹{billData.currentBill.toFixed(2)}</p>
                                    <p className={`text-sm mt-2 font-medium ${new Date(billData.dueDate) < new Date() ? 'text-red-500' : 'text-orange-500'}`}>
                                        Due: {new Date(billData.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Expandable Breakdown */}
                            <div className="border-t pt-4">
                                <button
                                    onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                                    className="flex items-center justify-between w-full text-left font-medium text-gray-700 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <span>View Itemized Breakdown</span>
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
                                                <div className="flex justify-between"><span>Fixed Charges</span><span>₹{billData.breakdown.fixed.toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span>Variable Consumption</span><span>₹{billData.breakdown.variable.toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span>Taxes</span><span>₹{billData.breakdown.taxes.toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span>Surcharges</span><span>₹{billData.breakdown.surcharges.toFixed(2)}</span></div>
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
                                        <h3 className="text-lg font-bold text-yellow-800">⚠️ Unusual Bill Amount Detected</h3>
                                        <p className="text-yellow-700 mt-1">
                                            This bill (<strong>₹{billData.currentBill.toFixed(2)}</strong>) is <strong>{billData.anomaly.ratio}x higher</strong> than your average (₹{billData.lastBill.toFixed(2)}).
                                        </p>

                                        <div className="mt-6 flex flex-wrap gap-4">
                                            <Button
                                                variant="outline"
                                                className="bg-white text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                                                onClick={() => setView('dispute')}
                                            >
                                                Dispute This Bill
                                            </Button>
                                            <Button
                                                onClick={() => setView('payment_method')}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                            >
                                                Pay Anyway
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!billData.anomaly.flagged && (
                            <div className="mt-6 flex justify-end">
                                <Button size="lg" onClick={() => setView('payment_method')}>Proceed to Payment</Button>
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
                        <h2 className="text-2xl font-bold mb-6">Dispute Bill Amount</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Reason for dispute</label>
                                <textarea
                                    className="w-full p-3 border rounded-xl bg-gray-50 min-h-[120px]"
                                    placeholder="Please explain why you believe this bill is incorrect..."
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Meter Photo Evidence (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">Tap to take photo or upload document</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Button variant="ghost" onClick={() => setView('bill')}>Cancel</Button>
                                <Button onClick={handleDisputeSubmit} disabled={!disputeReason.trim()}>Submit Dispute</Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* SECTION 3: PAYMENT METHOD SELECTION */}
                {view === 'payment_method' && (
                    <motion.div
                        key="payment-method"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">Select Payment Method</h2>
                            <p className="text-xl font-bold text-primary">₹{billData.currentBill.toFixed(2)}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* UPI Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border hover:border-primary hover:shadow-md transition-all cursor-pointer group relative overflow-hidden" onClick={() => simulatePayment('upi')}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                <Smartphone className="w-10 h-10 text-green-500 mb-4" />
                                <h3 className="text-lg font-bold mb-2">UPI Payment</h3>
                                <p className="text-sm text-gray-500 mb-4">Scan with Google Pay, PhonePe, Paytm, etc.</p>
                                <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <div className="text-center text-gray-400">
                                        <span className="block text-4xl mb-2">📱</span>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Show QR Code</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Payment */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border hover:border-primary hover:shadow-md transition-all cursor-pointer group relative" onClick={() => simulatePayment('card')}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                <CreditCard className="w-10 h-10 text-blue-500 mb-4" />
                                <h3 className="text-lg font-bold mb-2">Card Payment</h3>
                                <p className="text-sm text-gray-500 mb-4">Pay securely with Credit or Debit Card</p>
                                <div className="space-y-3 opacity-50 pointer-events-none">
                                    <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
                                    <div className="flex gap-3">
                                        <div className="h-10 bg-gray-100 rounded-lg w-1/2"></div>
                                        <div className="h-10 bg-gray-100 rounded-lg w-1/2"></div>
                                    </div>
                                    <div className="h-10 bg-blue-50 rounded-lg w-full mt-2 flex items-center justify-center text-blue-600 font-medium text-sm">
                                        Swipe to Pay
                                    </div>
                                </div>
                            </div>

                            {/* Cash Payment */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border hover:border-primary hover:shadow-md transition-all cursor-pointer group relative" onClick={() => simulatePayment('cash')}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                                <Banknote className="w-10 h-10 text-orange-500 mb-4" />
                                <h3 className="text-lg font-bold mb-2">Cash at Counter</h3>
                                <p className="text-sm text-gray-500 mb-4">Generate challan and pay at helping desk.</p>
                                <div className="mt-8 p-4 bg-orange-50 text-orange-700 text-sm rounded-lg border border-orange-100">
                                    Click here to generate your cash payment token slip.
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button variant="ghost" onClick={() => setView('bill')}>Back to Bill Details</Button>
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
                        <h2 className="text-2xl font-bold mb-2">Processing Payment...</h2>
                        <p className="text-gray-500">Please do not close this window or refresh the page.</p>
                    </motion.div>
                )}

                {/* SECTION 4: PAYMENT SUCCESS */}
                {view === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-2xl mx-auto border"
                    >
                        <div className="bg-green-500 p-10 text-center text-white relative flex flex-col items-center justify-center h-64">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                                className="bg-white text-green-500 rounded-full w-24 h-24 flex items-center justify-center shadow-lg mb-6 z-10"
                            >
                                <CheckCircle2 className="w-16 h-16" />
                            </motion.div>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-3xl font-bold relative z-10"
                            >
                                Payment Successful!
                            </motion.h2>

                            {/* Simple CSS Confetti Mock */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{
                                            y: -50,
                                            x: '50%',
                                            left: `${Math.random() * 100}%`,
                                            backgroundColor: ['#fff', '#fbbf24', '#60a5fa'][Math.floor(Math.random() * 3)]
                                        }}
                                        animate={{
                                            y: 300,
                                            rotate: Math.random() * 360,
                                            opacity: [1, 1, 0]
                                        }}
                                        transition={{
                                            duration: 2 + Math.random() * 2,
                                            ease: "linear",
                                            delay: Math.random() * 0.5
                                        }}
                                        className="absolute w-3 h-3 rounded-sm"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between border-b pb-4">
                                    <span className="text-gray-500">Transaction ID</span>
                                    <span className="font-mono font-medium">{receiptData.transactionId}</span>
                                </div>
                                <div className="flex justify-between border-b pb-4">
                                    <span className="text-gray-500">Receipt Number</span>
                                    <span className="font-mono font-medium">{receiptData.receiptNumber}</span>
                                </div>
                                <div className="flex justify-between border-b pb-4">
                                    <span className="text-gray-500">Date & Time</span>
                                    <span>{receiptData.timestamp}</span>
                                </div>
                                <div className="flex justify-between border-b pb-4">
                                    <span className="text-gray-500">Amount Paid</span>
                                    <span className="font-bold text-lg">₹{billData.currentBill.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-b pb-4">
                                    <span className="text-gray-500">Payment Method</span>
                                    <span className="uppercase font-medium">{selectedMethod}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button onClick={generatePDF} className="flex-1 gap-2" variant="outline">
                                    <Download className="w-4 h-4" /> Download Receipt
                                </Button>
                                <Button onClick={() => window.print()} className="flex-1 gap-2" variant="outline">
                                    <Printer className="w-4 h-4" /> Print Receipt
                                </Button>
                            </div>

                            <div className="mt-6 text-center">
                                <Button onClick={() => router.push('/kiosk')} className="w-full sm:w-auto" size="lg">
                                    Return to Services
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
