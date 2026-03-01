import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assumes src/lib/prisma exports PrismaClient singleton

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { connectionId, amount, method, userId } = body;

        // 1. Basic Validation
        if (!connectionId || amount === undefined || !method) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Fetch the existing connection
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const connection = await (prisma as any).connection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
        }

        // 3. Validate amounts match broadly (floating point arithmetic safety)
        if (Math.abs(connection.outstandingAmt - amount) > 0.01) {
            return NextResponse.json({
                error: 'Amount mismatch',
                message: `The amount provided (${amount}) does not match the outstanding balance ($${connection.outstandingAmt}).`
            }, { status: 400 });
        }

        // 4. Generate Identifiers
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();

        const transactionId = `TXN-${timestamp}-${randomString}`;
        const receiptNumber = `RCPT-2026-${randomString}`;

        // 5. Database Transaction to Record Payment & Clear Outstanding Balance
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paymentRecord = await prisma.$transaction(async (tx: any) => {

            // Create the payment record
            const payment = await tx.paymentRecord.create({
                data: {
                    userId: userId || connection.userId,
                    connectionId,
                    amount,
                    method,
                    transactionId,
                    receiptNumber,
                    status: 'SUCCESS',
                    anomalyFlagged: false // Could be tied to anomaly logic if requested
                }
            });

            // Update the connection
            await tx.connection.update({
                where: { id: connectionId },
                data: {
                    lastBillAmt: connection.outstandingAmt, // The paid bill becomes the last bill
                    outstandingAmt: 0,
                    lastPaymentDate: new Date()
                }
            });

            return payment;
        });

        // 6. Return successful receipt data
        return NextResponse.json({
            success: true,
            receipt: {
                transactionId: paymentRecord.transactionId,
                receiptNumber: paymentRecord.receiptNumber,
                amount: paymentRecord.amount,
                method: paymentRecord.method,
                date: paymentRecord.createdAt,
                status: paymentRecord.status
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
