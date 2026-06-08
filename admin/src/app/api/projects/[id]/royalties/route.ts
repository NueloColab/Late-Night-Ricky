import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { royalties } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/projects/:id/royalties
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = Number(params.id);
    if (isNaN(projectId)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });

    const rows = await db.select().from(royalties).where(eq(royalties.projectId, projectId));
    return NextResponse.json({ royalties: rows });
  } catch (err) {
    console.error('Failed to fetch royalties:', err);
    return NextResponse.json({ royalties: [] }, { status: 500 });
  }
}

// POST /api/projects/:id/royalties
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = Number(params.id);
    if (isNaN(projectId)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });

    const body = await request.json();
    const [row] = await db.insert(royalties).values({
      projectId,
      source: body.source || 'other',
      amount: body.amount ? Number(body.amount) : 0,
      currency: body.currency || 'GBP',
      periodStart: body.periodStart || null,
      periodEnd: body.periodEnd || null,
      streams: body.streams ? Number(body.streams) : null,
      status: body.status || 'pending',
      notes: body.notes || null,
    }).returning();

    return NextResponse.json({ royalty: row });
  } catch (err) {
    console.error('Failed to create royalty:', err);
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}

// DELETE /api/projects/:id/royalties?royaltyId=X
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(request: Request, _context: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const royaltyId = Number(searchParams.get('royaltyId'));
    if (!royaltyId) return NextResponse.json({ error: 'Missing royaltyId' }, { status: 400 });

    await db.delete(royalties).where(eq(royalties.id, royaltyId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete royalty:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
