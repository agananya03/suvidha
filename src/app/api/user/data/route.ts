import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        const token =
            (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) ||
            req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token) as { userId?: string };
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.userId;

        // Perform cascading deletion or delete related records for DPDP Act Compliance
        // Note: Prisma schema `onDelete: Cascade` handles child records if configured. 
        // Here we explicitly delete what we can just to be safe.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) => {
            // Delete Complaints linked to user (if direct relation exists)
            await tx.complaint.deleteMany({
                where: { userId }
            });

            // Delete Connections
            await tx.connection.deleteMany({
                where: { userId }
            });

            // Get user's mobile to delete OTP sessions
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user) {
                await tx.oTPSession.deleteMany({
                    where: { mobile: user.mobile }
                });
            }

            // Delete User Profile
            await tx.user.delete({
                where: { id: userId }
            });
        });

        // Clear the response cookie to log the user out fully
        const response = NextResponse.json({ success: true, message: 'All personal data successfully deleted' });
        response.cookies.delete('token');

        return response;

    } catch (error) {
        console.error('Error deleting user data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
