import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ReceiptData {
    receiptNumber: string;
    transactionId: string;
    dateTime: string;
    method: string;
    status: string;
    serviceDetails: {
        provider: string;
        consumerNumber: string;
        billingPeriod: string;
    };
    breakdown: {
        baseAmount: number;
        taxes: number;
        surcharges: number;
        total: number;
    };
}

interface ReceiptProps {
    data: ReceiptData;
}

export function Receipt({ data }: ReceiptProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Generate the unique verification URL
    const [verificationUrl, setVerificationUrl] = useState('');

    useEffect(() => {
        // Generate full URL dynamically on client side
        setVerificationUrl(`${window.location.origin}/verify/${data.receiptNumber}`);
    }, [data.receiptNumber]);

    // Handle native window printing
    const handlePrint = () => {
        window.print();
    };

    // Handle PDF Generation via html2canvas -> jsPDF
    const handleDownloadPDF = async () => {
        if (!receiptRef.current) return;
        setIsGeneratingPdf(true);

        try {
            // Small timeout to ensure fonts/icons are loaded before canvas capture
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(receiptRef.current, {
                scale: 2, // Higher resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            // Calculate dimensions (A4 paper standard)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`SUVIDHA-Receipt-${data.receiptNumber}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto my-8">

            {/* 
        Action Buttons - Hidden during print via Tailwind's print:hidden 
        This is independent of the receipt component itself so the receipt stays pure
      */}
            <div className="flex gap-4 mb-8 w-full justify-end print:hidden">
                <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="flex items-center gap-2 border-gray-300 shadow-sm"
                >
                    <Printer className="w-4 h-4" /> Print Receipt
                </Button>
                <Button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                    <Download className="w-4 h-4" /> {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                </Button>
            </div>

            {/* 
        CORE RECEIPT CONTAINER 
        Has specific styling overrides for physical printing via print:* classes
      */}
            <div
                ref={receiptRef}
                id="RCPT-COMPONENT"
                className="w-full bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0"
            >
                {/* Header - Government Branding */}
                <div className="bg-slate-50 border-b border-gray-200 p-8 flex flex-col items-center text-center print:bg-white print:border-b-2 print:border-black">
                    {/* Mock Ashoka Chakra / Gov Emblem Placeholder */}
                    <div className="w-16 h-16 rounded-full border-2 border-blue-800 flex items-center justify-center mb-4">
                        <div className="w-12 h-12 rounded-full border-[1px] border-blue-800 flex items-center justify-center relative">
                            {/* Simplified mock chakra spokes */}
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="absolute w-[1px] h-full bg-blue-800" style={{ transform: `rotate(${i * 15}deg)` }} />
                            ))}
                            <div className="absolute w-2 h-2 rounded-full bg-white z-10" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-1 print:text-black">
                        Government of India
                    </h1>
                    <h2 className="text-xl font-bold text-blue-700 uppercase tracking-widest mb-3 print:text-black">
                        SUVIDHA 2026 — Official Payment Receipt
                    </h2>
                    <div className="bg-orange-100 text-orange-800 px-3 py-1 text-xs font-bold rounded-full tracking-widest print:border print:border-gray-500 print:bg-transparent print:text-black">
                        POWERED BY C-DAC
                    </div>
                </div>

                <div className="p-8">
                    {/* Metadata Split Columns */}
                    <div className="flex flex-col md:flex-row justify-between border-b pb-6 mb-6 gap-6 print:flex-row print:border-black">
                        <div className="space-y-2">
                            <div className="text-sm text-gray-500 print:text-gray-700">Receipt Number</div>
                            <div className="font-mono font-bold text-lg text-slate-800">{data.receiptNumber}</div>

                            <div className="text-sm text-gray-500 mt-4 print:text-gray-700">Transaction ID</div>
                            <div className="font-mono text-slate-600">{data.transactionId}</div>

                            <div className="text-sm text-gray-500 mt-4 print:text-gray-700">Date & Time</div>
                            <div className="text-slate-600 font-medium">{new Date(data.dateTime).toLocaleString('en-IN')}</div>
                        </div>

                        <div className="space-y-2 md:text-right print:text-right">
                            <div className="text-sm text-gray-500 print:text-gray-700">Payment Method</div>
                            <div className="font-bold text-slate-800 uppercase">{data.method}</div>

                            <div className="text-sm text-gray-500 mt-4 print:text-gray-700">Status</div>
                            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold border border-green-200 print:border-black print:bg-transparent print:text-black">
                                PAID ✅
                            </div>
                        </div>
                    </div>

                    {/* Service Details & Big Amount */}
                    <div className="bg-slate-50 rounded-xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center print:bg-white print:border-2 print:border-gray-300 gap-6">
                        <div>
                            <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold print:text-gray-700">Service Billed</div>
                            <div className="text-xl font-bold text-slate-800">{data.serviceDetails.provider}</div>
                            <div className="text-slate-600 mt-1">Consumer: <span className="font-mono font-medium">{data.serviceDetails.consumerNumber}</span></div>
                            <div className="text-slate-500 text-sm mt-1">Period: {data.serviceDetails.billingPeriod}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold print:text-gray-700">Amount Received</div>
                            <div className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                                ₹{data.breakdown.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Itemized Breakdown Table */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 print:border-black">Payment Breakdown</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Base Bill Amount</span>
                                <span className="font-mono">₹{data.breakdown.baseAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Taxes & Duties (GST)</span>
                                <span className="font-mono">₹{data.breakdown.taxes.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Convenience Fees / Surcharges</span>
                                <span className="font-mono">₹{data.breakdown.surcharges.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center font-black text-lg pt-4 border-t-2 border-slate-200 text-slate-900 print:border-black">
                                <span>Total Paid</span>
                                <span className="font-mono">₹{data.breakdown.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* QR Code & Verification Block */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-blue-50/50 p-6 rounded-xl border border-blue-100 print:bg-white print:border-gray-300">
                        <div className="flex flex-col justify-center bg-white p-3 rounded-xl border border-gray-200 print:border-black">
                            {verificationUrl && (
                                <QRCodeSVG
                                    value={verificationUrl}
                                    size={120}
                                    level={"Q"}
                                    includeMargin={false}
                                />
                            )}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h4 className="font-bold text-slate-800 mb-2 print:text-black">Instant Digital Verification</h4>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3 print:text-gray-700">
                                Scan the QR code to instantly verify the authenticity of this receipt on the official SUVIDHA portal.
                            </p>
                            <div className="text-xs font-mono bg-white px-3 py-2 rounded border border-gray-200 text-slate-500 break-all print:border-gray-400 print:bg-transparent">
                                {verificationUrl || `suvidha2026.gov.in/verify/${data.receiptNumber}`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-800 text-slate-400 p-6 text-center text-xs space-y-2 print:bg-white print:text-gray-600 print:border-t-2 print:border-black">
                    <p className="font-medium tracking-widest uppercase">This is a computer-generated receipt. No physical signature is required.</p>
                    <p>Toll-Free Helpline: <span className="font-bold tracking-wider text-white print:text-black">1800-111-2026</span></p>
                    <p className="pt-2 opacity-50 text-[10px]">Generated by SUVIDHA Edge Network Node</p>
                </div>

            </div>
        </div>
    );
}
