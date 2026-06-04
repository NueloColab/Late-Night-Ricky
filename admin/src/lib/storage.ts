import { put } from "@vercel/blob";
import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";
import path from "path";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function storeFile(
  file: File | Buffer,
  filename: string,
  options?: { access?: "public" | "private"; contentType?: string }
): Promise<{ url: string; size: number }> {
  const size = Buffer.isBuffer(file) ? file.length : file.size;

  if (BLOB_TOKEN) {
    const body = Buffer.isBuffer(file) ? file : await file.arrayBuffer();
    const result = await put(filename, body, {
      access: options?.access || "public",
      contentType: options?.contentType,
      token: BLOB_TOKEN,
    });
    return { url: result.url, size };
  }

  // Local fallback
  const uploadsDir = path.join(process.cwd(), "..", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.isBuffer(file) ? file : Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return { url: `/uploads/${filename}`, size };
}
