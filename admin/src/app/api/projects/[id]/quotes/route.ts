import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = Number(params.id);
    const all = await db.select().from(quotes).where(eq(quotes.projectId, projectId)).orderBy(quotes.id).all();
    return NextResponse.json({ quotes: all });
  } catch (err) {
    console.error('Project quotes GET error:', err);
    return NextResponse.json({ quotes: [] }, { status: 500 });
  }
}
