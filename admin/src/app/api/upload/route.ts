import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { storeFile } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Cloudinary handles larger files, 10MB limit
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File too large. Max size is ${(MAX_SIZE / 1024 / 1024).toFixed(1)}MB` }, { status: 413 });
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() || "" : "";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext ? `.${ext}` : ""}`;

    console.log(`[Upload] Storing file: ${filename}, size: ${file.size}, type: ${file.type}, name: ${file.name}`);

    const { url, size } = await storeFile(file, filename);

    console.log(`[Upload] Stored at: ${url}`);

    const type = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("audio/")
      ? "audio"
      : "document";

    const [asset] = await db
      .insert(assets)
      .values({
        filename,
        originalName: file.name,
        type,
        size,
        path: url,
        thumbnailPath: type === "image" ? url : undefined,
        usedIn: JSON.stringify([]),
      })
      .returning();

    return NextResponse.json({ success: true, asset });
  } catch (err: any) {
    console.error("[Upload] Error:", err);
    console.error("[Upload] Error stack:", err.stack);
    return NextResponse.json(
      { error: err.message || "Upload failed", details: err.toString(), stack: err.stack?.substring(0, 200) },
      { status: 500 }
    );
  }
}
