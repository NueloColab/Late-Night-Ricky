import { v2 as cloudinary } from 'cloudinary';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfllse3az',
  api_key: process.env.CLOUDINARY_API_KEY || '999646942898938',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ZPTfioQjEGd-KeWpi-6cWZm2XrQ',
  secure: true,
});

const CLOUDINARY_FOLDER = 'nuelo/late-night-ricky/media';

export function isBlobConfigured(): boolean {
  return true;
}

export function getBlobStatus(): { configured: boolean; tokenPrefix: string | null; error?: string } {
  return { configured: true, tokenPrefix: 'cloudinary' };
}

export async function storeFile(
  file: File | Buffer,
  filename: string,
): Promise<{ url: string; size: number }> {
  const size = Buffer.isBuffer(file) ? file.length : file.size;

  try {
    const buffer = Buffer.isBuffer(file) ? file : Buffer.from(await file.arrayBuffer());
    const base64Data = `data:application/octet-stream;base64,${buffer.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64Data, {
      public_id: filename.replace(/\.[^.]+$/, ''),
      folder: CLOUDINARY_FOLDER,
      overwrite: true,
      resource_type: 'auto',
    });

    return { url: result.secure_url, size: result.bytes || size };
  } catch (err: any) {
    console.error('[Cloudinary] Upload failed:', err);
    // Fallback to local storage in development
    if (process.env.NODE_ENV === 'development') {
      const uploadsDir = path.join(process.cwd(), '..', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, filename);
      const buf = Buffer.isBuffer(file) ? file : Buffer.from(await (file as File).arrayBuffer());
      await writeFile(filePath, buf);
      return { url: `/uploads/${filename}`, size };
    }
    throw new Error(`Cloudinary upload failed: ${err.message || err}`);
  }
}

// Also export cloudinary for direct use if needed
export { cloudinary };