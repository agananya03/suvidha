import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

/**
 * 📤 UPLOAD DOCUMENT VIA FORM DATA
 * Accepts multipart form with: complaintId, file, documentType
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const complaintId = formData.get("complaintId") as string;
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string || "document";

    if (!complaintId || !file) {
      return NextResponse.json(
        { error: "Complaint ID and file are required" },
        { status: 400 }
      );
    }

    // Verify complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(buffer, {
      folder: `complaints/${complaintId}`,
      filename: `${Date.now()}-${file.name}`,
      resource_type: "auto",
    });

    // Create document record in database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const document = await prisma.document.create({
      data: {
        complaintId,
        url: cloudinaryResult.url,
        type: documentType,
        expiresAt,
      },
    });

    return NextResponse.json({
      message: "Document uploaded successfully",
      document,
      cloudinary: {
        publicId: cloudinaryResult.publicId,
        size: cloudinaryResult.size,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

/**
 * 🗑️ DELETE DOCUMENT BY ID (also removes from Cloudinary)
 */
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const documentId = url.searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Extract public ID from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud/image/upload/v1xxx/folder/filename.ext
    const urlParts = document.url.split("/");
    const fileName = urlParts[urlParts.length - 1].split(".")[0];
    const folder = urlParts[urlParts.length - 2];
    const publicId = `${folder}/${fileName}`;

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(publicId);
    } catch (err) {
      console.error("Failed to delete from Cloudinary:", err);
      // Continue even if Cloudinary deletion fails
    }

    // Mark as deleted in database
    const deletedDoc = await prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      message: "Document deleted successfully",
      document: deletedDoc,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
