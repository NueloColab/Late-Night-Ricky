import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { clientNames } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const names = await db.select().from(clientNames).orderBy(asc(clientNames.order));
    return NextResponse.json({ names });
  } catch (err) {
    console.error('Public client names GET error:', err);
    return NextResponse.json({ names: [] }, { status: 500 });
  }
}
