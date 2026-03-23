import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token || token.length !== 6) {
      return NextResponse.json({ error: 'Invalid token format.' }, { status: 400 });
    }

    const documentToken = await (prisma as any).documentToken.findUnique({
      where: { token: token.toUpperCase() },
    });

    if (!documentToken) {
      return NextResponse.json({ error: 'Token not found.' }, { status: 404 });
    }
    if (documentToken.used) {
      return NextResponse.json({ error: 'Token already used.' }, { status: 410 });
    }
    if (new Date(documentToken.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Token expired.' }, { status: 410 });
    }
    if (!documentToken.cloudinaryUrl) {
      return NextResponse.json(
        { error: 'No file associated with this token.' },
        { status: 404 }
      );
    }

    await (prisma as any).documentToken.update({
      where: { token: token.toUpperCase() },
      data: { used: true },
    });

    return NextResponse.json({
      success: true,
      fileName: documentToken.fileName,
      mimeType: documentToken.mimeType,
      fileSize: documentToken.fileSize,
      serviceType: documentToken.serviceType,
      cloudinaryUrl: documentToken.cloudinaryUrl,
    }, { status: 200 });

  } catch (error) {
    console.error('[Retrieve API] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
