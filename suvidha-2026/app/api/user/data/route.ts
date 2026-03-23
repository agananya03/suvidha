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
        await prisma.$transaction(async (tx) => {
            // Delete Complaints linked to user
            await tx.complaint.deleteMany({
                where: { userId }
            });

            // Delete Connections
            await tx.connection.deleteMany({
                where: { userId }
            });

            // Delete DocumentTokens by mobile
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user) {
                await tx.documentToken.deleteMany({
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
