import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tracks } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allTracks = await db.select().from(tracks).orderBy(asc(tracks.order));
    return NextResponse.json({ tracks: allTracks });
  } catch (err) {
    console.error('Failed to load tracks:', err);
    return NextResponse.json({ tracks: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [track] = await db.insert(tracks).values({
      title: body.title,
      filePath: body.filePath || null,
      duration: body.duration || '0:30',
      spotifyUrl: body.spotifyUrl || null,
      appleMusicUrl: body.appleMusicUrl || null,
      order: body.order ?? 0,
      isActive: body.isActive ?? true,
    }).returning();
    return NextResponse.json({ track });
  } catch (err) {
    console.error('Failed to create track:', err);
    return NextResponse.json({ error: 'Failed to create track' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    if (!idsParam) {
      return NextResponse.json({ error: 'Missing ids' }, { status: 400 });
    }
    const ids = idsParam.split(',').map(Number);
    for (const id of ids) {
      await db.delete(tracks).where(eq(tracks.id, id));
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete tracks:', err);
    return NextResponse.json({ error: 'Failed to delete tracks' }, { status: 500 });
  }
}
