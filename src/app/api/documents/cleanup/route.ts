import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 🗑️ AUTO-DELETE DOCUMENTS AFTER 24 HOURS OR WHEN USED IN KIOSK
 * 
 * This endpoint should be called by a cron job (e.g., EasyCron, AWS Lambda, etc.) every hour
 * to clean up expired documents and mark used documents as deleted.
 * 
 * Security: Only allow calls from authorized cron service with proper token verification
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron job token (optional but recommended)
    const cronToken = req.headers.get("authorization");
    if (cronToken !== `Bearer ${process.env.CRON_TOKEN}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    // 1️⃣ Delete documents that expired (24 hours passed)
    const expiredDocs = await prisma.document.updateMany({
      where: {
        expiresAt: { lte: now },
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    // 2️⃣ Delete documents that were used in kiosk
    const usedDocs = await prisma.document.updateMany({
      where: {
        usedInKiosk: true,
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    // 3️⃣ Optionally delete from Cloudinary
    // (You can implement this if needed)

    console.log(`🗑️ Cleanup completed:`);
    console.log(`   - Expired documents deleted: ${expiredDocs.count}`);
    console.log(`   - Used documents deleted: ${usedDocs.count}`);

    return NextResponse.json({
      message: "Document cleanup completed",
      stats: {
        expiredDeleted: expiredDocs.count,
        usedDeleted: usedDocs.count,
        totalDeleted: expiredDocs.count + usedDocs.count,
      },
    });
  } catch (error) {
    console.error("Error during document cleanup:", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}

/**
 * 🔍 GET CLEANUP STATUS
 * View documents pending deletion or already deleted
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "all";

    let query: any = {};

    if (type === "expired") {
      const now = new Date();
      query = { expiresAt: { lte: now }, deletedAt: null };
    } else if (type === "used") {
      query = { usedInKiosk: true, deletedAt: null };
    } else if (type === "deleted") {
      query = { deletedAt: { not: null } };
    }

    const documents = await prisma.document.findMany({
      where: query,
      orderBy: { deletedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      type,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Error fetching cleanup status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
