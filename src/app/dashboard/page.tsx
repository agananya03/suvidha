'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Clock, CreditCard,
    MessageSquare, Activity, FileText, Download,
    Zap, Flame, Droplets, Home, AlertCircle, ChevronRight,
    LogOut, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import { DemoDataBadge, EmptyState } from '@/components/ui/EmptyState';

// --- FETCHER --- //
const fetcher = async (url: string) => {
    // Attempt to grab token from localStorage in case relying on headers
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || true) { // Always return mock if failing for demo phase
            return {
                isMock: true,
                user: { name: 'Rahul Sharma', address: 'B-104, Sunrise Apartments', lastLogin: new Date().toISOString() },
                connections: [
                    { id: '1', provider: 'MSEB Electricity', consumerNumber: 'MH-NP-2024-001247', outstandingAmt: 1247.50, type: 'ELECTRICITY' },
                    { id: '2', provider: 'MGL Piped Gas', consumerNumber: 'MGL-009841', outstandingAmt: 450.00, type: 'GAS' }
                ],
                complaints: [
                    { id: '1', ticketId: 'SUVDH-2026-00047', department: 'Electricity', status: 'IN_PROGRESS', createdAt: new Date().toISOString() }
                ],
                paymentHistory: [
                    { id: '1', transactionId: 'TXN-00192', method: 'UPI', amount: 950.00, createdAt: new Date().toISOString(), status: 'SUCCESS' }
                ],
                documentTokens: [
                    { id: '1', token: 'X79-B4M', expiresAt: new Date(Date.now() + 86400000).toISOString(), used: false }
                ]
            };
        }
        if (res.status === 401) throw new Error('Unauthorized');
        throw new Error('An error occurred while fetching the data.');
    }
    return res.json();
};

// --- SKELETON COMPONENTS --- //
const DashboardSkeleton = () => (
    <div className="flex-grow p-4 lg:p-8 bg-gray-50/50 animate-pulse">
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-6 items-center">
                <div className="w-20 h-20 rounded-full bg-gray-200" />
                <div className="space-y-3 flex-1">
                    <div className="h-6 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-64 bg-gray-200 rounded" />
                </div>
                <div className="hidden md:flex gap-3">
                    <div className="h-10 w-32 bg-gray-200 rounded-lg" />
                    <div className="h-10 w-32 bg-gray-200 rounded-lg" />
                </div>
            </div>

            <div className="flex gap-4 border-b pb-2">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-32 bg-gray-200 rounded" />)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100 p-6" />)}
            </div>
        </div>
    </div>
);

export default function DashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('connections');

    const { data, error, isLoading } = useSWR('/api/user/dashboard', fetcher, {
        shouldRetryOnError: false
    });

    useEffect(() => {
        if (error && error.message === 'Unauthorized') {
            router.push('/login'); // Assuming login is at /login
        }
    }, [error, router]);

    if (isLoading) return <DashboardSkeleton />;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Failed to load dashboard. {error.message}</div>;
    if (!data) return null;

    const { user, connections, complaints, paymentHistory, documentTokens, isMock } = data;

    // --- CALCULATIONS --- //
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalOutstanding = connections.reduce((sum: number, conn: any) => sum + conn.outstandingAmt, 0);
    const totalPaidThisYear = paymentHistory
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((p: any) => new Date(p.createdAt).getFullYear() === new Date().getFullYear() && p.status === 'SUCCESS')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .reduce((sum: number, p: any) => sum + p.amount, 0);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const downloadReceipt = (txn: any) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('SUVIDHA PAYMENT RECEIPT', 20, 20);
        doc.setFontSize(14);
        doc.text(`Transaction ID: ${txn.transactionId}`, 20, 40);
        doc.text(`Receipt No: ${txn.receiptNumber}`, 20, 50);
        doc.text(`Date: ${new Date(txn.createdAt).toLocaleString()}`, 20, 60);
        doc.text(`Amount: Rs. ${txn.amount.toFixed(2)}`, 20, 70);
        doc.text(`Method: ${txn.method}`, 20, 80);
        doc.text(`Service ID: ${txn.connectionId}`, 20, 90);
        doc.text(`Status: ${txn.status}`, 20, 100);

        doc.setLineWidth(0.5);
        doc.line(20, 110, 190, 110);
        doc.setFontSize(10);
        doc.text('Thank you for using SUVIDHA digital services.', 20, 120);
        doc.save(`${txn.receiptNumber}.pdf`);
    };

    return (
        <div className="flex-grow p-4 lg:p-8 bg-gray-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8 relative">
                {isMock && <DemoDataBadge />}

                {/* HEADER */}
                <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary/20 flex-shrink-0">
                            {getInitials(user.name)}
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold mb-1">Welcome back, {user.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {user.address}</span>
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Last login: {new Date(user.lastLogin).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <Button onClick={() => router.push('/kiosk/pay')} className="flex-1 md:flex-none">
                            <CreditCard className="w-4 h-4 mr-2" /> Pay Bill
                        </Button>
                        <Button variant="secondary" onClick={() => router.push('/kiosk/complaint')} className="flex-1 md:flex-none">
                            <AlertCircle className="w-4 h-4 mr-2" /> File Complaint
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/kiosk/queue')} className="flex-1 md:flex-none">
                            <Activity className="w-4 h-4 mr-2" /> Track
                        </Button>
                        <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-hide">
                    {[
                        { id: 'connections', label: 'My Connections', icon: Home },
                        { id: 'complaints', label: 'Complaints', icon: MessageSquare },
                        { id: 'history', label: 'Payment History', icon: CreditCard },
                        { id: 'documents', label: 'Documents & Tokens', icon: FileText },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* TAB 1: CONNECTIONS */}
                        {activeTab === 'connections' && (
                            <div className="space-y-6">
                                <div className="bg-orange-50 text-orange-900 p-6 rounded-2xl border border-orange-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-700 font-bold text-sm uppercase mb-1">Total Outstanding Dues</p>
                                        <h2 className="text-4xl font-black">₹{totalOutstanding.toFixed(2)}</h2>
                                    </div>
                                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => router.push('/kiosk/pay')}>
                                        Pay All <ChevronRight className="w-5 h-5 ml-1" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {connections.map((conn: any) => (
                                        <div key={conn.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${conn.type === 'ELECTRICITY' ? 'bg-yellow-100 text-yellow-600' :
                                                        conn.type === 'GAS' ? 'bg-orange-100 text-orange-600' :
                                                            'bg-blue-100 text-blue-600'
                                                        }`}>
                                                        {conn.type === 'ELECTRICITY' && <Zap className="w-6 h-6" />}
                                                        {conn.type === 'GAS' && <Flame className="w-6 h-6" />}
                                                        {conn.type === 'WATER' && <Droplets className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{conn.provider}</h3>
                                                        <p className="text-gray-500 font-mono text-sm">{conn.consumerNumber}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-end justify-between border-t pt-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Outstanding Bill</p>
                                                    <p className="text-2xl font-bold">₹{conn.outstandingAmt.toFixed(2)}</p>
                                                </div>
                                                <Button disabled={conn.outstandingAmt <= 0} onClick={() => router.push('/kiosk/pay')}>
                                                    {conn.outstandingAmt > 0 ? 'Pay Now' : 'Paid'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {connections.length === 0 && (
                                        <div className="col-span-full">
                                            <EmptyState
                                                type="services"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: COMPLAINTS */}
                        {activeTab === 'complaints' && (
                            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                                                <th className="p-4 font-semibold">Ticket ID</th>
                                                <th className="p-4 font-semibold">Department</th>
                                                <th className="p-4 font-semibold">Status</th>
                                                <th className="p-4 font-semibold">Date</th>
                                                <th className="p-4 font-semibold text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {complaints.map((comp: any) => (
                                                <tr key={comp.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="p-4 font-mono font-medium">{comp.ticketId}</td>
                                                    <td className="p-4">
                                                        <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">{comp.department}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${comp.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                                            comp.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {comp.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">{new Date(comp.createdAt).toLocaleDateString()}</td>
                                                    <td className="p-4 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => router.push('/kiosk/queue')}>
                                                            View Tracker
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {complaints.length === 0 && (
                                                <tr>
                                                    <td colSpan={5}>
                                                        <EmptyState type="complaints" />
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: PAYMENT HISTORY */}
                        {activeTab === 'history' && (
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium uppercase mb-1">Total Paid This Year</p>
                                        <h3 className="text-3xl font-black">₹{totalPaidThisYear.toFixed(2)}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                                                    <th className="p-4 font-semibold">Date</th>
                                                    <th className="p-4 font-semibold">TXN ID</th>
                                                    <th className="p-4 font-semibold">Method</th>
                                                    <th className="p-4 font-semibold">Amount</th>
                                                    <th className="p-4 font-semibold text-right">Receipt</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {paymentHistory.map((txn: any) => (
                                                    <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 text-sm">{new Date(txn.createdAt).toLocaleString()}</td>
                                                        <td className="p-4 font-mono text-sm">{txn.transactionId}</td>
                                                        <td className="p-4 text-sm">{txn.method}</td>
                                                        <td className="p-4 font-bold">₹{txn.amount.toFixed(2)}</td>
                                                        <td className="p-4 text-right">
                                                            <Button variant="outline" size="sm" onClick={() => downloadReceipt(txn)}>
                                                                <Download className="w-4 h-4 mr-2" /> PDF
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {paymentHistory.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5}>
                                                            <EmptyState type="payments" />
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: DOCUMENTS */}
                        {activeTab === 'documents' && (
                            <div className="space-y-6">
                                <div className="flex justify-end mb-4">
                                    <Button onClick={() => router.push('/pre-visit')}>
                                        Generate New Token
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {documentTokens.map((doc: any) => {
                                        const isExpired = new Date(doc.expiresAt) < new Date();
                                        return (
                                            <div key={doc.id} className="bg-white p-6 rounded-2xl border shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded ${doc.used ? 'bg-gray-100 text-gray-600' :
                                                        isExpired ? 'bg-red-100 text-red-600' :
                                                            'bg-green-100 text-green-600'
                                                        }`}>
                                                        {doc.used ? 'USED' : isExpired ? 'EXPIRED' : 'ACTIVE'}
                                                    </span>
                                                </div>
                                                <FileText className="w-10 h-10 text-primary mb-4" />
                                                <p className="text-sm text-gray-500 mb-1">Secure Token</p>
                                                <h3 className="font-mono text-2xl font-bold tracking-widest mb-4">{doc.token}</h3>
                                                <p className="text-xs text-gray-400">
                                                    Expires: {new Date(doc.expiresAt).toLocaleString()}
                                                </p>
                                                {doc.fileName && (
                                                    <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                                                        Linked File: {doc.fileName}
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {documentTokens.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed">
                                            No active document tokens found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

            </div>
        </div>
    );
}
