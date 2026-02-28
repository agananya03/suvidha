import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assumes src/lib/prisma exports PrismaClient singleton

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
    try {
        const { token } = params;

        if (!token || token.length !== 6) {
            return NextResponse.json({ error: 'Invalid token format. Must be 6 characters.' }, { status: 400 });
        }

        const documentToken = await prisma.documentToken.findUnique({
            where: { token: token.toUpperCase() }
        });

        if (!documentToken) {
            return NextResponse.json({ error: 'Token not found.' }, { status: 404 });
        }

        if (documentToken.used) {
            return NextResponse.json({ error: 'Token has already been used.' }, { status: 410 }); // Gone
        }

        if (new Date(documentToken.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'Token has expired.' }, { status: 410 }); // Gone
        }

        // --- SUCCESS CASE --- //
        // For a true integration, we would just return metadata at this stage until user clicks "Accept"
        // Return file metadata without the encrypted payload to save bandwidth
        return NextResponse.json({
            id: documentToken.id,
            fileName: documentToken.fileName || 'Citizen Document',
            fileSize: documentToken.fileSize,
            mimeType: documentToken.mimeType,
            expiresAt: documentToken.expiresAt,
            message: 'Document waiting to be retrieved. Confirm consent to view.'
        }, { status: 200 });

    } catch (error) {
        console.error('Document Retrieval Error:', error);
        return NextResponse.json({ error: 'Internal server error while resolving token.' }, { status: 500 });
    }
}
