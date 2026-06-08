import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tracks } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allTracks = await db
      .select()
      .from(tracks)
      .where(eq(tracks.isActive, true))
      .orderBy(asc(tracks.order));
    return NextResponse.json({ tracks: allTracks });
  } catch (err) {
    console.error('Failed to load public tracks:', err);
    return NextResponse.json({ tracks: [] }, { status: 500 });
  }
}
