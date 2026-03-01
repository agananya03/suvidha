import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { rateLimiter } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        const { mobile, otp } = await req.json();

        if (!mobile || !otp) {
            return NextResponse.json({ error: 'Mobile and OTP are required' }, { status: 400 });
        }

        // Throttle Verify Attempts per IP basis
        const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
        const rateLimitResult = rateLimiter.checkLoginAttempt(ip);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: `Too many login attempts. Please wait ${rateLimitResult.retryAfter} seconds.` },
                { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
            );
        }

        // Find OTPSession: mobile match, otp match, not used, not expired
        const session = await prisma.oTPSession.findFirst({
            where: {
                mobile,
                otp,
                used: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!session) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Mark OTPSession as used
        await prisma.oTPSession.update({
            where: { id: session.id },
            data: { used: true },
        });

        // Find or create User by mobile
        let user = await prisma.user.findUnique({
            where: { mobile },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    mobile,
                },
            });
        }

        // Generate JWT
        const payload = {
            userId: user.id,
            mobile: user.mobile,
        };
        const token = signToken(payload);

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                mobile: user.mobile,
                name: user.name,
                address: user.address,
                preferredLanguage: user.preferredLanguage,
                accessibilityMode: user.accessibilityMode,
            },
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
