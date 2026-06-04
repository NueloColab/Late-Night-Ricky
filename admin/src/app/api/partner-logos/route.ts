import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { partnerLogos } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const logos = await db.select().from(partnerLogos).orderBy(asc(partnerLogos.order));
    return NextResponse.json({ logos });
  } catch (err) {
    console.error('Partner logos GET error:', err);
    return NextResponse.json({ logos: [] }, { status: 500 });
  }
}
