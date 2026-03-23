import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  originalFilename: string;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'suvidha-documents',
        public_id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        resource_type: mimeType.startsWith('image/') ? 'image' : 'raw',
        invalidate: true,
        tags: ['suvidha', 'citizen-document'],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          format: result.format,
          bytes: result.bytes,
          originalFilename: filename,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('[Cloudinary] Delete failed:', err);
  }
}

export default cloudinary;
