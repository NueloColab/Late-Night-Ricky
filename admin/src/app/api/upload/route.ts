import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { storeFile } from "@/lib/storage";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() || "" : "";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext ? `.${ext}` : ""}`;

  const { url, size } = await storeFile(file, filename, {
    contentType: file.type,
  });

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
      size,
      path: url,
      thumbnailPath: type === "image" ? url : undefined,
      usedIn: JSON.stringify([]),
    })
    .returning()
    .get();

  return NextResponse.json({ success: true, asset });
}
