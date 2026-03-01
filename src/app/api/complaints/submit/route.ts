import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimiter } from '@/lib/rateLimit';
import { sanitizeString, validateFile } from '@/lib/sanitization';
import { File } from 'buffer';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // Extract fields from formData
        const description = formData.get('description') as string;
        const type = formData.get('type') as string;
        const userId = formData.get('userId') as string;
        const primaryDepartment = formData.get('primaryDepartment') as string;
        const secondaryDepartment = formData.get('secondaryDepartment') as string;
        const priority = parseInt(formData.get('priority') as string);
        const queuePosition = parseInt(formData.get('queuePosition') as string);
        const vulnerabilityScore = parseInt(formData.get('vulnerabilityScore') as string);
        const agingBonus = parseInt(formData.get('agingBonus') as string);
        const slaDeadline = formData.get('slaDeadline') as string;

        // Extract optional file
        const file = formData.get('file') as File | null;

        // 1. Basic validation
        if (!description || !primaryDepartment) {
            return NextResponse.json({ error: 'Missing required tracking domains' }, { status: 400 });
        }

        const sanitizedDesc = sanitizeString(description);
        if (!sanitizedDesc) {
            return NextResponse.json({ error: 'Description contains invalid characters or is empty after sanitization.' }, { status: 400 });
        }

        // Validate File Upload (if any)
        if (file) {
            const validation = validateFile(file as any); // Type cast due to Next/Buffer File differences
            if (!validation.isValid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
            // Logic to save file to cloud/local storage would go here
        }

        // Apply Rate Limit (max 5 per day per user)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const identifier = userId || ip;
        const rateLimitResult = rateLimiter.checkComplaintSubmit(identifier);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: `You have reached your daily complaint limit. Please try again in ${rateLimitResult.retryAfter} seconds.` },
                { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
            );
        }

        // 2. Ticket ID Generation (SUVDH-2026-XXXXX)
        const randomNum = Math.floor(Math.random() * 90000) + 10000;
        const ticketId = `SUVDH-2026-${randomNum}`;

        // 3. Database Transaction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newComplaint = await prisma.$transaction(async (tx: any) => {

            // Create Complaint
            const complaint = await tx.complaint.create({
                data: {
                    ticketId,
                    userId: userId || null,
                    type: type || 'GENERAL',
                    description: sanitizedDesc,
                    department: primaryDepartment,
                    secondaryDepartment: secondaryDepartment || null,
                    status: 'PENDING',
                    priority: priority || 5,
                    queuePosition: queuePosition || 100,
                    agingBonus: agingBonus || 0,
                    vulnerabilityScore: vulnerabilityScore || 0,
                    slaDeadline: slaDeadline ? new Date(slaDeadline) : null,
                }
            });

            // Create linked Queue Entry
            await tx.queueEntry.create({
                data: {
                    complaintId: complaint.id,
                    departmentQueue: primaryDepartment,
                    position: queuePosition || 100,
                    estimatedResolutionDate: slaDeadline ? new Date(slaDeadline) : new Date(Date.now() + 15 * 86400000), // Default 15 days
                }
            });

            return complaint;
        });

        return NextResponse.json({ success: true, complaint: newComplaint }, { status: 201 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
