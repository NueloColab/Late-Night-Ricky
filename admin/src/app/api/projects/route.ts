import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

export async function GET() {
  try {
    const all = await db.select().from(projects).orderBy(projects.createdAt).all();
    return NextResponse.json({ projects: all });
  } catch (err) {
    console.error('Projects GET error:', err);
    return NextResponse.json({ projects: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inserted = await db.insert(projects).values(body).returning();
    return NextResponse.json({ project: inserted[0] });
  } catch (err) {
    console.error('Projects POST error:', err);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
}
