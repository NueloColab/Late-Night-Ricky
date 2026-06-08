import { NextResponse } from 'next/server';
import { getShowCards } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cards = await getShowCards();
    return NextResponse.json({ cards });
  } catch (err) {
    console.error('Public show cards GET error:', err);
    return NextResponse.json({ cards: [] }, { status: 500 });
  }
}
