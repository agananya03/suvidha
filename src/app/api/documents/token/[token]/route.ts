import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assumes src/lib/prisma exports PrismaClient singleton

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
    try {
        const { token } = params;

        if (!token || token.length !== 6) {
            return NextResponse.json({ error: 'Invalid token format. Must be 6 characters.' }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const documentToken = await (prisma as any).documentToken.findUnique({
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
  token: documentToken.token,
  fileName: documentToken.fileName ?? 'Citizen Document',
  fileSize: documentToken.fileSize ?? 0,
  mimeType: documentToken.mimeType ?? 'application/octet-stream',
  serviceType: documentToken.serviceType ?? null,
  uploadedAt: documentToken.uploadedAt,
  expiresAt: documentToken.expiresAt,
  hasFile: !!documentToken.cloudinaryUrl,
  message: 'Document ready. Confirm consent to view.',
}, { status: 200 });

    } catch (error) {
        console.error('Document Retrieval Error:', error);
        return NextResponse.json({ error: 'Internal server error while resolving token.' }, { status: 500 });
    }
}
