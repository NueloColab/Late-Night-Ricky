import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);

    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    // Find the asset
    const [asset] = await db.select().from(assets).where(eq(assets.id, assetId));

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Delete from database
    await db.delete(assets).where(eq(assets.id, assetId));

    // Note: We don't delete from Cloudinary here because:
    // 1. The file might still be referenced in site_sections
    // 2. Cloudinary deletion requires the destroy API with the public_id
    // 3. It's safer to orphan files than to break live content
    // If you want Cloudinary cleanup, add it here with the public_id

    return NextResponse.json({ success: true, deleted: assetId });
  } catch (err: any) {
    console.error('Media DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}