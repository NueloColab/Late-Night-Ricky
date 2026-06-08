import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, filename, originalName, type, size } = body;

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    console.log(`[Upload] Saving asset from Cloudinary URL: ${url}, name: ${originalName}`);

    const [asset] = await db
      .insert(assets)
      .values({
        filename: filename || `upload-${Date.now()}`,
        originalName: originalName || filename,
        type: type || 'document',
        size: size || 0,
        path: url,
        thumbnailPath: type === 'image' ? url : undefined,
        usedIn: JSON.stringify([]),
      })
      .returning();

    return NextResponse.json({ success: true, asset });
  } catch (err: any) {
    console.error('[Upload] Error:', err);
    console.error('[Upload] Error stack:', err.stack);
    return NextResponse.json(
      { error: err.message || 'Upload failed', details: err.toString(), stack: err.stack?.substring(0, 200) },
      { status: 500 }
    );
  }
}