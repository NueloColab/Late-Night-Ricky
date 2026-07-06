import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tracks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.filePath !== undefined) updateData.filePath = body.filePath;
    if (body.coverPath !== undefined) updateData.coverPath = body.coverPath;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.spotifyUrl !== undefined) updateData.spotifyUrl = body.spotifyUrl;
    if (body.appleMusicUrl !== undefined) updateData.appleMusicUrl = body.appleMusicUrl;
    if (body.youtubeUrl !== undefined) updateData.youtubeUrl = body.youtubeUrl;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    const [track] = await db.update(tracks).set(updateData).where(eq(tracks.id, Number(id))).returning();
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
