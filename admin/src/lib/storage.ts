import { put } from "@vercel/blob";
import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";
import path from "path";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export function isBlobConfigured(): boolean {
  return !!BLOB_TOKEN && BLOB_TOKEN.startsWith("vercel_blob_rw_");
}

export function getBlobStatus(): { configured: boolean; tokenPrefix: string | null; error?: string } {
  if (!BLOB_TOKEN) {
    return { configured: false, tokenPrefix: null, error: "BLOB_READ_WRITE_TOKEN not set. Add it in Vercel dashboard → Project Settings → Environment Variables." };
  }
  if (!BLOB_TOKEN.startsWith("vercel_blob_rw_")) {
    return { configured: false, tokenPrefix: BLOB_TOKEN.slice(0, 20), error: "BLOB_READ_WRITE_TOKEN has invalid format. Should start with 'vercel_blob_rw_'." };
  }
  return { configured: true, tokenPrefix: BLOB_TOKEN.slice(0, 20) };
}

export async function storeFile(
  file: File | Buffer,
  filename: string,
  options?: { access?: "public" | "private"; contentType?: string }
): Promise<{ url: string; size: number }> {
  const size = Buffer.isBuffer(file) ? file.length : file.size;

  if (BLOB_TOKEN) {
    try {
      const body = Buffer.isBuffer(file) ? file : await file.arrayBuffer();
      const result = await put(filename, body, {
        access: options?.access || "public",
        contentType: options?.contentType,
        token: BLOB_TOKEN,
      });
      return { url: result.url, size };
    } catch (err: any) {
      console.error("[Blob] Upload failed:", err);
      // If blob fails, throw a clear error so the API can report it
      throw new Error(`Vercel Blob upload failed: ${err.message || err}. Check BLOB_READ_WRITE_TOKEN in Vercel dashboard.`);
    }
  }

  // Local fallback (dev only)
  const uploadsDir = path.join(process.cwd(), "..", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.isBuffer(file) ? file : Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return { url: `/uploads/${filename}`, size };
}
