import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { tracks } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allTracks = await db.select().from(tracks).orderBy(asc(tracks.order));
    return NextResponse.json({ tracks: allTracks });
  } catch (err) {
    console.error('Tracks GET error:', err);
    return NextResponse.json({ tracks: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [track] = await db.insert(tracks).values({
      title: body.title || 'New Track',
      duration: body.duration || '0:30',
      filePath: body.filePath || '/assets/snippet-1.mp3',
      order: body.order ?? 999,
      isActive: true,
    }).returning();
    return NextResponse.json({ track });
  } catch (err: any) {
    console.error('Tracks POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    const body = await request.json();
    const [track] = await db.update(tracks)
      .set({
        title: body.title,
        duration: body.duration,
        filePath: body.filePath,
        order: body.order,
        isActive: body.isActive,
      })
      .where(eq(tracks.id, Number(id)))
      .returning();
    return NextResponse.json({ track });
  } catch (err: any) {
    console.error('Tracks PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await db.delete(tracks).where(eq(tracks.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Tracks DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
