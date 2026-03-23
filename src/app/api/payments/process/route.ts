import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assumes src/lib/prisma exports PrismaClient singleton
import { verifyHmacSignature } from '@/lib/verifyHmac';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { connectionId, amount, method, userId } = body;

        const signature = request.headers.get('X-SUVIDHA-Signature');
        if (signature) {
            const isValid = verifyHmacSignature(body, signature);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'Invalid signature — request rejected' },
                    { status: 401 }
                );
            }
        }

        // 1. Basic Validation
        if (!connectionId || amount === undefined || !method) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Handle Demo Connection ID
        if (connectionId === 'demo-conn-1234') {
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
            return NextResponse.json({
                success: true,
                receipt: {
                    transactionId: `TXN-${timestamp}-${randomString}`,
                    receiptNumber: `RCPT-2026-${randomString}`,
                    amount: amount,
                    method: method,
                    date: new Date().toISOString(),
                    status: 'SUCCESS',
                    bbpsRefNumber: `BBPS${timestamp}${randomString}`
                }
            }, { status: 201 });
        }

        // 3. Fetch the existing connection from DB
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const connectionModel = (prisma as any).connection;
        if (!connectionModel) {
            console.warn("Prisma 'connection' model is not defined. Falling back to 404.");
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
        }

        const connection = await connectionModel.findUnique({
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
        const bbpsRefNumber = `BBPS${timestamp}${randomString}`;

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
                status: paymentRecord.status,
                bbpsRefNumber
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
