import { NextResponse } from 'next/server';
import { validateFile } from '@/lib/sanitization';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const serviceType = formData.get('serviceType') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileValidation = validateFile(file);
    if (!fileValidation.isValid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum 5MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudinaryResult = await uploadToCloudinary(buffer, file.name, file.type);

    const token = Math.random().toString(36).substring(2, 8).toUpperCase();

    await (prisma as any).documentToken.create({
      data: {
        token,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        serviceType: serviceType ?? null,
        cloudinaryUrl: cloudinaryResult.secureUrl,
        cloudinaryId: cloudinaryResult.publicId,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        used: false,
      },
    });

    return NextResponse.json({
      success: true,
      token,
      fileName: file.name,
      fileSize: file.size,
      previewUrl: cloudinaryResult.secureUrl,
      message: 'Document uploaded securely.',
    }, { status: 201 });

  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
