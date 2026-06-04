import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { venueTicker } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const rows = await db.select().from(venueTicker).all();
    const data = rows[0] || { venues: [] };
    return NextResponse.json({ ticker: data });
  } catch (err) {
    console.error('Venue ticker GET error:', err);
    return NextResponse.json({ ticker: { venues: [] } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const venues = body.venues || [];

    const rows = await db.select().from(venueTicker).all();
    if (rows.length > 0) {
      await db.update(venueTicker).set({ venues }).where(eq(venueTicker.id, rows[0].id)).run();
    } else {
      await db.insert(venueTicker).values({ venues }).run();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Venue ticker PUT error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
