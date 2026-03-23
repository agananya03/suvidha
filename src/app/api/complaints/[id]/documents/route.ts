import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 ADD DOCUMENT TO COMPLAINT
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { url, type } = body;

    if (!url || !type) {
      return NextResponse.json(
        { error: "URL and type are required" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Calculate expiry time: 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create document with auto-deletion tracking
    const document = await prisma.document.create({
      data: {
        complaintId: id,
        url,
        type,
        expiresAt,
      },
    });

    return NextResponse.json({
      message: "Document added successfully",
      document,
    });
  } catch (error) {
    console.error("Error adding document:", error);
    return NextResponse.json(
      { error: "Failed to add document" },
      { status: 500 }
    );
  }
}

// 🔹 GET COMPLAINT DOCUMENTS
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const documents = await prisma.document.findMany({
      where: { complaintId: id, deletedAt: null },
    });

    return NextResponse.json({
      complaintId: id,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// 🔹 MARK DOCUMENT AS USED (when processed in kiosk)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        usedInKiosk: true,
        usedAt: new Date(),
        // Option: Mark as deleted immediately after kiosk usage
        // deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Document marked as used",
      document,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}
