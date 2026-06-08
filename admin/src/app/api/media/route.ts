import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { storeFile } from '@/lib/storage';

export async function GET() {
  try {
    const allAssets = await db.select().from(assets).orderBy(desc(assets.uploadedAt));
    return NextResponse.json({ assets: allAssets });
  } catch (err) {
    console.error('Media GET error:', err);
    return NextResponse.json({ assets: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB, Cloudinary handles larger files
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File too large. Max ${(MAX_SIZE / 1024 / 1024).toFixed(1)}MB` }, { status: 413 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;

    console.log(`[Media Upload] Storing: ${filename}, size: ${file.size}, type: ${file.type}`);

    const { url, size } = await storeFile(file, filename);

    console.log(`[Media Upload] Stored at: ${url}`);

    const assetType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
      ? 'video'
      : file.type.startsWith('audio/')
      ? 'audio'
      : 'document';

    const [result] = await db.insert(assets).values({
      filename,
      originalName: file.name,
      type: assetType,
      size,
      path: url,
      thumbnailPath: assetType === 'image' ? url : undefined,
      usedIn: JSON.stringify([]),
    }).returning();

    return NextResponse.json({ asset: result });
  } catch (err: any) {
    console.error('Media POST error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed', details: err.toString() }, { status: 500 });
  }
}
