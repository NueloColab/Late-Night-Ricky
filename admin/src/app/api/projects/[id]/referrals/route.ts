import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { referrals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/projects/:id/referrals
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = Number(params.id);
    if (isNaN(projectId)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });

    const rows = await db.select().from(referrals).where(eq(referrals.projectId, projectId));
    return NextResponse.json({ referrals: rows });
  } catch (err) {
    console.error('Failed to fetch referrals:', err);
    return NextResponse.json({ referrals: [] }, { status: 500 });
  }
}

// POST /api/projects/:id/referrals
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = Number(params.id);
    if (isNaN(projectId)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });

    const body = await request.json();
    const [row] = await db.insert(referrals).values({
      projectId,
      name: body.name || 'Referral',
      email: body.email || null,
      commission: body.commission ? Number(body.commission) : 0,
      commissionPercent: body.commissionPercent ? Number(body.commissionPercent) : null,
      status: body.status || 'active',
      notes: body.notes || null,
    }).returning();

    return NextResponse.json({ referral: row });
  } catch (err) {
    console.error('Failed to create referral:', err);
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}

// DELETE /api/projects/:id/referrals?referralId=X
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(request: Request, _context: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const referralId = Number(searchParams.get('referralId'));
    if (!referralId) return NextResponse.json({ error: 'Missing referralId' }, { status: 400 });

    await db.delete(referrals).where(eq(referrals.id, referralId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete referral:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
