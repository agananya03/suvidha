import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assumes src/lib/prisma exports PrismaClient singleton

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            description,
            type, // optional string
            userId, // optional
            // The following would come from calling the /analyze endpoint internally or passed from frontend
            primaryDepartment,
            secondaryDepartment,
            priority,
            queuePosition,
            vulnerabilityScore,
            agingBonus,
            slaDeadline
        } = body;

        // 1. Basic validation
        if (!description || !primaryDepartment) {
            return NextResponse.json({ error: 'Missing required tracking domains' }, { status: 400 });
        }

        // 2. Ticket ID Generation (SUVDH-2026-XXXXX)
        const randomNum = Math.floor(Math.random() * 90000) + 10000;
        const ticketId = `SUVDH-2026-${randomNum}`;

        // 3. Database Transaction
        const newComplaint = await prisma.$transaction(async (tx: any) => {

            // Create Complaint
            const complaint = await tx.complaint.create({
                data: {
                    ticketId,
                    userId: userId || null,
                    type: type || 'GENERAL',
                    description,
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
