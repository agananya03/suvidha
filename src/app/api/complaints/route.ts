import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔹 LIST COMPLAINTS (for a user by phone number)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const phoneNumber = url.searchParams.get("phoneNumber");
    const status = url.searchParams.get("status");

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const query: any = { phoneNumber };
    if (status) {
      query.status = status;
    }

    const complaints = await prisma.complaint.findMany({
      where: query,
      include: { documents: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

// 🔹 CREATE COMPLAINT (via API)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, department, issueType, description } = body;

    if (!phoneNumber || !department || !issueType || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validDepartments = ["ELECTRICITY", "GAS", "MUNICIPAL"];
    if (!validDepartments.includes(department)) {
      return NextResponse.json(
        { error: "Invalid department" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        phoneNumber,
        department,
        issueType,
        description,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Complaint created successfully",
      complaint,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Failed to create complaint" },
      { status: 500 }
    );
  }
}
