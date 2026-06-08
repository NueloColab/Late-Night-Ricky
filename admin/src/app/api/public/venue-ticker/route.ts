import { NextResponse } from 'next/server';
import { getVenueTicker } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const venues = await getVenueTicker();
    return NextResponse.json({ ticker: { venues } });
  } catch (err) {
    console.error('Public venue ticker GET error:', err);
    return NextResponse.json({ ticker: { venues: [] } }, { status: 500 });
  }
}
