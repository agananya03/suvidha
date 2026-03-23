import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        let description, type, userId, primaryDepartment, secondaryDepartment, priority, queuePosition, vulnerabilityScore, agingBonus, slaDeadline;

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
        }

        // 1. Basic validation
        if (!description || !primaryDepartment) {
            return NextResponse.json({ error: 'Missing required tracking domains' }, { status: 400 });
        }

        // Simple sanitization
        const sanitizedDesc = description.replace(/<\/?[^>]+(>|$)/g, "").trim();
        if (!sanitizedDesc) {
            return NextResponse.json({ error: 'Description contains invalid characters or is empty after sanitization.' }, { status: 400 });
        }

        // 2. Ticket ID Generation (SUVDH-2026-XXXXX)
        const randomNum = Math.floor(Math.random() * 90000) + 10000;
        const ticketId = `SUVDH-2026-${randomNum}`;

        // 3. Database Transaction
        const newComplaint = await prisma.$transaction(async (tx) => {

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
