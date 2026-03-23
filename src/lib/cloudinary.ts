import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * 📤 UPLOAD DOCUMENT TO CLOUDINARY
 * Returns: URL and public_id for later deletion
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string;
    filename?: string;
    resource_type?: "auto" | "image" | "video" | "raw";
  } = {}
) {
  try {
    // Convert Buffer to data URI if necessary
    const uploadData = typeof file === "string" 
      ? file 
      : `data:application/octet-stream;base64,${file.toString("base64")}`;

    const result = await cloudinary.uploader.upload(uploadData, {
      folder: options.folder || "suvidha_complaints",
      public_id: options.filename,
      resource_type: options.resource_type || "auto",
      invalidate: true,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      size: result.bytes,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload document");
  }
}

/**
 * 🗑️ DELETE DOCUMENT FROM CLOUDINARY
 */
export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete document from Cloudinary");
  }
}

/**
 * 📋 GET DOCUMENT DETAILS FROM CLOUDINARY
 */
export async function getCloudinaryResource(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      publicId: result.public_id,
      url: result.secure_url,
      size: result.bytes,
      format: result.format,
      createdAt: new Date(result.created_at),
    };
  } catch (error) {
    console.error("Cloudinary fetch error:", error);
    return null;
  }
}

/**
 * 🔒 GENERATE SIGNED URL (useful for temporary access)
 */
export function generateSignedUrl(publicId: string, expirationSeconds: number = 3600) {
  try {
    const url = cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      custom_function: {
        function_type: "wasm",
      },
      expires_in: expirationSeconds,
    });
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
}
