import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Fields that should not be directly set from request body
const JSONB_FIELDS = ['services', 'team', 'files', 'tasks', 'moodBoard'];

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [row] = await db.select().from(projects).where(eq(projects.id, Number(params.id)));
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ project: row });
  } catch (err) {
    console.error('Project GET error:', err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    // Build update object, handling JSONB fields
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (key === 'id' || key === 'createdAt') continue; // Don't update these
      if (JSONB_FIELDS.includes(key)) {
        // Parse JSONB fields if they come as strings
        updateData[key] = typeof value === 'string' ? JSON.parse(value) : value;
      } else {
        updateData[key] = value;
      }
    }

    await db.update(projects).set(updateData).where(eq(projects.id, Number(params.id)));
    const [row] = await db.select().from(projects).where(eq(projects.id, Number(params.id)));
    return NextResponse.json({ project: row });
  } catch (err) {
    console.error('Project PUT error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(projects).where(eq(projects.id, Number(params.id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Project DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}