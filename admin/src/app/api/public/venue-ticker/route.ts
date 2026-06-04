import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { venueTicker } from '@/lib/db/schema';

export async function GET() {
  try {
    const rows = await db.select().from(venueTicker);
    const data = rows[0] || { venues: [] };
    return NextResponse.json({ ticker: data });
  } catch (err) {
    console.error('Public venue ticker GET error:', err);
    return NextResponse.json({ ticker: { venues: [] } }, { status: 500 });
  }
}
