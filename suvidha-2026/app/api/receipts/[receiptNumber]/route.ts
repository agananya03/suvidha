import { NextResponse } from 'next/server';

// In a real application, this would interface with a database (like Prisma).
// For the demo/hackathon, we're returning a formatted mock object if the receipt matches expectations.

export async function GET(
    request: Request,
    { params }: { params: { receiptNumber: string } }
) {
    const receiptNumber = params.receiptNumber;

    // Basic validation
    if (!receiptNumber || receiptNumber.length < 5) {
        return NextResponse.json(
            { error: 'Invalid receipt number format.' },
            { status: 400 }
        );
    }

    // Simulate a database lookup delay (200ms)
    await new Promise((resolve) => setTimeout(resolve, 200));

    // If the receipt starts with "RCPT", assume it's valid for demo purposes.
    // In production, this checks `prisma.payment.findUnique(...)`
    if (receiptNumber.startsWith('RCPT-')) {
        return NextResponse.json({
            valid: true,
            data: {
                receiptNumber: receiptNumber,
                transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                dateTime: new Date().toISOString(),
                method: "UPI (Unified Payments Interface)",
                status: "PAID",
                serviceDetails: {
                    provider: "Dakshin Haryana Bijli Vitran Nigam (DHBVN)",
                    consumerNumber: "DHBVN-8472910384",
                    billingPeriod: "Jan 2026 - Feb 2026"
                },
                breakdown: {
                    baseAmount: 1450.00,
                    taxes: 261.00,
                    surcharges: 15.00,
                    total: 1726.00
                }
            }
        });
    }

    // If the receipt is definitively NOT found
    return NextResponse.json(
        {
            valid: false,
            error: 'Receipt not found in SUVIDHA secure ledger.'
        },
        { status: 404 }
    );
}
