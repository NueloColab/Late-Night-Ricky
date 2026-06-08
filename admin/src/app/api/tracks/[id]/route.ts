import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tracks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const [track] = await db.update(tracks).set({
      title: body.title,
      filePath: body.filePath,
      duration: body.duration,
      spotifyUrl: body.spotifyUrl,
      appleMusicUrl: body.appleMusicUrl,
      order: body.order,
      isActive: body.isActive,
    }).where(eq(tracks.id, Number(id))).returning();
    return NextResponse.json({ track });
  } catch (err) {
    console.error('Failed to update track:', err);
    return NextResponse.json({ error: 'Failed to update track' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(tracks).where(eq(tracks.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete track:', err);
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
  }
}
