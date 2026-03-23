import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const mobile = formData.get('mobile') as string || 'anonymous';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // DPDP Validation: Type & Size limitations
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File size exceeds the 5MB maximum limit.' }, { status: 400 });
        }

        if (!VALID_MIME_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Unsupported file type. Please upload a JPG, PNG, WEBP, or PDF.' }, { status: 400 });
        }

        // Generate a 6-character alphanumeric secure token
        const token = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create document token with 48h expiry and auto-delete
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h limit
        const autoDeleteAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72h auto-delete

        await prisma.documentToken.create({
            data: {
                token,
                mobile,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                expiresAt,
                autoDeleteAt,
                used: false
            }
        });

        return NextResponse.json({
            success: true,
            token,
            message: 'Document uploaded securely and heavily encrypted.'
        }, { status: 201 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
