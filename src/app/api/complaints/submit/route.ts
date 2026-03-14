import { NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rateLimit';
import { sanitizeString, validateFile } from '@/lib/sanitization';
import { File } from 'buffer';

export async function POST(request: Request) {
    try {
        let description, type, userId, primaryDepartment, secondaryDepartment, priority, queuePosition, vulnerabilityScore, agingBonus, slaDeadline;
        let file: File | null = null;

        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const body = await request.json();
            description = body.description;
            type = body.type;
            userId = body.userId;
            primaryDepartment = body.primaryDepartment;
            secondaryDepartment = body.secondaryDepartment;
            priority = body.priority;
            queuePosition = body.queuePosition;
            vulnerabilityScore = body.vulnerabilityScore;
            agingBonus = body.agingBonus;
            slaDeadline = body.slaDeadline;
        } else {
            const formData = await request.formData();
            description = formData.get('description') as string;
            type = formData.get('type') as string;
            userId = formData.get('userId') as string;
            primaryDepartment = formData.get('primaryDepartment') as string;
            secondaryDepartment = formData.get('secondaryDepartment') as string;
            priority = parseInt(formData.get('priority') as string);
            queuePosition = parseInt(formData.get('queuePosition') as string);
            vulnerabilityScore = parseInt(formData.get('vulnerabilityScore') as string);
            agingBonus = parseInt(formData.get('agingBonus') as string);
            slaDeadline = formData.get('slaDeadline') as string;
            file = formData.get('file') as File | null;
        }

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

        // 3. Mock Database Transaction for Demo
        // The Prisma schema doesn't have Complaint/QueueEntry models yet,
        // so we mock the creation for the kiosk demo flow.
        const newComplaint = {
            id: ticketId,
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
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return NextResponse.json({ success: true, complaint: newComplaint }, { status: 201 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
