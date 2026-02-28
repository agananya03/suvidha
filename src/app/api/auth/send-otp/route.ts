import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export async function POST(req: NextRequest) {
    try {
        const { mobile } = await req.json();

        // Validate mobile: exactly 10 digits, Indian format usually starts with 6-9, 
        // but the prompt only requested "exactly 10 digits" based on "Indian format"
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobile || !mobileRegex.test(mobile)) {
            return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 });
        }

        // Rate limit: max 5 OTPs per mobile per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentOtps = await prisma.oTPSession.count({
            where: {
                mobile,
                createdAt: {
                    gte: oneHourAgo,
                },
            },
        });

        if (recentOtps >= 5) {
            return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
        }

        // Generate cryptographically random 6-digit OTP
        const otpArray = new Uint32Array(1);
        crypto.getRandomValues(otpArray);
        const otp = (otpArray[0] % 900000 + 100000).toString(); // Ensures 6 digits

        // Set expiry to exactly 5 minutes from now
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Save to OTPSession table
        await prisma.oTPSession.create({
            data: {
                mobile,
                otp,
                expiresAt,
            },
        });

        if (DEMO_MODE) {
            // In DEMO MODE: return OTP in response
            return NextResponse.json({ success: true, expiresIn: 300, demoOtp: otp });
        }

        // In production: integrate Twilio SMS (stub the function, add TODO)
        // TODO: Implement Twilio SMS integration to send `otp` to `mobile`
        console.log(`[Twilio Stub] Sending OTP ${otp} to ${mobile}`);

        return NextResponse.json({ success: true, expiresIn: 300 });
    } catch (error) {
        console.error('Error generating OTP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
