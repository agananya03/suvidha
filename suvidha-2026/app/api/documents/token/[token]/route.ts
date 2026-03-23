import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { token: string } }
) {
    try {
        const { token } = params;

        if (!token || token.length !== 6) {
            return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
        }

        const docToken = await prisma.documentToken.findUnique({
            where: { token: token.toUpperCase() }
        });

        if (!docToken) {
            return NextResponse.json({ error: 'Token not found' }, { status: 404 });
        }

        if (docToken.expiresAt < new Date()) {
            return NextResponse.json({ error: 'Token has expired' }, { status: 410 });
        }

        if (docToken.used) {
            return NextResponse.json({ error: 'Token has already been used' }, { status: 410 });
        }

        // Mark as used
        await prisma.documentToken.update({
            where: { token: token.toUpperCase() },
            data: { used: true, usedAt: new Date() }
        });

        return NextResponse.json({
            success: true,
            fileName: docToken.fileName,
            fileSize: docToken.fileSize,
            mimeType: docToken.mimeType,
            message: 'Document retrieved successfully. Token invalidated.'
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
