import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getTokenFromRequest, TokenPayload } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded: TokenPayload;
        try {
            decoded = verifyToken(token) as TokenPayload;
        } catch {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const userId = decoded.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                connections: true,
                complaints: {
                    orderBy: { createdAt: 'desc' }
                },
                documentTokens: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const paymentHistory = await prisma.paymentRecord.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Simulate last login time dynamically (in a real app, track this in DB)
        const lastLogin = new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(); // 2 hours ago

        return NextResponse.json({
            user: {
                name: user.name || 'Citizen',
                mobile: user.mobile,
                address: user.address || 'Address not provided',
                preferredLanguage: user.preferredLanguage,
                accessibilityMode: user.accessibilityMode,
                lastLogin
            },
            connections: user.connections,
            complaints: user.complaints,
            paymentHistory,
            documentTokens: user.documentTokens
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
