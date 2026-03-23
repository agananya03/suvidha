import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimiter } from '@/lib/rateLimit';
import { regexes } from '@/lib/sanitization';

// Example: app/api/bills/[consumerNumber]/route.ts
export async function GET(
    request: Request,
    { params }: { params: { consumerNumber: string } }
) {
    try {
        const { consumerNumber } = params;

        if (!consumerNumber || !regexes.consumerNumber.test(consumerNumber)) {
            return NextResponse.json({ error: 'Invalid consumer number format' }, { status: 400 });
        }

        // Fetch user context if token exists (skipped for simplicity in this endpoint)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = rateLimiter.checkBillFetch(ip);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: `Too many bill fetching requests. Please wait ${rateLimitResult.retryAfter} seconds.` },
                { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
            );
        }

        // Handle Hardcoded Demo Case FIRST to bypass DB
        if (consumerNumber === "MH-NP-2024-001247") {
            return NextResponse.json({
                consumerNumber: 'MH-NP-2024-001247',
                connectionId: 'demo-conn-1234',
                providerName: 'Maharashtra State Electricity Board',
                holderName: 'Rahul Sharma',
                address: 'B-104, Sunrise Apartments, Pune',
                currentBill: 1247.50,
                lastBill: 540.00,
                dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
                billDate: new Date().toISOString(),
                billPeriod: 'Feb 2026',
                anomaly: {
                    flagged: true,
                    ratio: 2.31,
                    message: "This bill is 2.31x higher than your usual amount"
                },
                breakdown: {
                    fixed: 499.00,
                    variable: 561.37,
                    taxes: 124.75,
                    surcharges: 62.38
                },
                paymentHistory: [
                    { month: 'Jan', amount: 540.00, paidOn: '2026-01-15', status: 'PAID' },
                    { month: 'Feb', amount: 1247.50, paidOn: null, status: 'PENDING' }
                ]
            }, { status: 200 });
        }

        // 1. Fetch connection details from DB
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const connectionModel = (prisma as any).connection;
        
        let connection = null;
        if (connectionModel) {
            connection = await connectionModel.findFirst({
                where: { consumerNumber },
                include: { user: true }
            });
        }

        if (!connection) {
            if (!connectionModel) {
                console.warn("Prisma 'connection' model is not defined. Using mock fallback.");
            }
            // MOCK DEMO FALLBACK if connection not found in DB
            const mockCurrent = Math.floor(Math.random() * 2000) + 500;
            return NextResponse.json({
                consumerNumber: consumerNumber,
                connectionId: `demo-conn-${Date.now()}`,
                providerName: 'SUVIDHA Utility Provider',
                holderName: 'Sample Citizen',
                address: '12 Demo Street, Model Town',
                currentBill: mockCurrent,
                lastBill: mockCurrent - 100,
                dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
                billDate: new Date().toISOString(),
                billPeriod: 'Current Month',
                anomaly: {
                    flagged: false,
                    ratio: 1.0,
                    message: "Your bill is within the normal range."
                },
                breakdown: {
                    fixed: Math.floor(mockCurrent * 0.3),
                    variable: Math.floor(mockCurrent * 0.5),
                    taxes: Math.floor(mockCurrent * 0.1),
                    surcharges: Math.floor(mockCurrent * 0.1)
                },
                paymentHistory: []
            }, { status: 200 });
        }

        const currentBill = connection.outstandingAmt;
        const lastBill = connection.lastBillAmt;
        const providerName = connection.provider;
        const holderName = connection.user?.name || 'Unknown User';
        const address = connection.address || connection.user?.address || 'Unknown Address';

        let anomaly = {
            flagged: false,
            ratio: 1.0,
            message: "Your bill is within the normal range."
        };

        if (lastBill > 0 && currentBill > (lastBill * 2.0)) {
            const ratio = parseFloat((currentBill / lastBill).toFixed(2));
            anomaly = {
                flagged: true,
                ratio,
                message: `This bill is ${ratio}x higher than your usual amount`
            };
        }

        // Mocking dates and payment history for now
        const billDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(billDate.getDate() + 15); // Due in 15 days

        const breakdown = {
            fixed: parseFloat((currentBill * 0.4).toFixed(2)),
            variable: parseFloat((currentBill * 0.45).toFixed(2)),
            taxes: parseFloat((currentBill * 0.1).toFixed(2)),
            surcharges: parseFloat((currentBill * 0.05).toFixed(2))
        };

        const paymentHistory = [
            { month: 'Jan', amount: lastBill, paidOn: '2026-01-15', status: 'PAID' },
            { month: 'Feb', amount: currentBill, paidOn: null, status: 'PENDING' }
        ];

        // 3. Construct Full Bill Response
        const responseData = {
            consumerNumber,
            providerName,
            holderName,
            address,
            currentBill,
            lastBill,
            dueDate: dueDate.toISOString(),
            billDate: billDate.toISOString(),
            billPeriod: 'Feb 2026',
            anomaly,
            breakdown,
            paymentHistory
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error('Error fetching bill details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
