import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "..", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadsDir, filename);
  const relativePath = `/uploads/${filename}`;

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const type = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("video/")
    ? "video"
    : "audio";

  const asset = await db
    .insert(assets)
    .values({
      filename,
      originalName: file.name,
      type,
      size: file.size,
      path: relativePath,
    })
    .returning()
    .get();

  return NextResponse.json({ success: true, asset });
}
