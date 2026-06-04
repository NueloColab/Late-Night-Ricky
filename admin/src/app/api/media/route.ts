import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { storeFile } from '@/lib/storage';

export async function GET() {
  try {
    const allAssets = await db.select().from(assets).orderBy(desc(assets.uploadedAt)).all();
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

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;

    const { url, size } = await storeFile(file, filename, {
      contentType: file.type,
    });

    const assetType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
      ? 'video'
      : file.type.startsWith('audio/')
      ? 'audio'
      : 'image';

    const result = db.insert(assets).values({
      filename,
      originalName: file.name,
      type: assetType,
      size,
      path: url,
      thumbnailPath: assetType === 'image' ? url : undefined,
      usedIn: JSON.stringify([]),
    }).returning().get();

    return NextResponse.json({ asset: result });
  } catch (err) {
    console.error('Media POST error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
