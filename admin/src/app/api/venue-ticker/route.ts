import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { venueTicker } from '@/lib/db/schema';

export async function GET() {
  try {
    const rows = await db.select().from(venueTicker);
    return NextResponse.json({ venues: rows[0]?.venues ?? [] });
  } catch (err) {
    console.error('Venue ticker GET error:', err);
    return NextResponse.json({ venues: [] }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    await db.delete(venueTicker);
    const [ticker] = await db.insert(venueTicker).values({ venues: body.venues || [] }).returning();
    return NextResponse.json({ ticker });
  } catch (err: any) {
    console.error('Venue ticker PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
