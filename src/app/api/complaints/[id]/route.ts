import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 GET COMPLAINT STATUS
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const complaintId = id;

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { documents: true },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: complaint.id,
      department: complaint.department,
      issueType: complaint.issueType,
      description: complaint.description,
      status: complaint.status,
      documents: complaint.documents,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaint" },
      { status: 500 }
    );
  }
}

// 🔹 UPDATE COMPLAINT STATUS (Admin/Backend)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: { status },
      include: { documents: true },
    });

    return NextResponse.json({
      id: complaint.id,
      status: complaint.status,
      documents: complaint.documents,
      updatedAt: complaint.updatedAt,
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 }
    );
  }
}
