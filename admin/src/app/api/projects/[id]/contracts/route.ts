import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/projects/:id/contracts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = Number(params.id);
    if (isNaN(projectId)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });

    const rows = await db.select().from(contracts).where(eq(contracts.projectId, projectId));
    return NextResponse.json({ contracts: rows });
  } catch (err) {
    console.error('Failed to fetch contracts:', err);
    return NextResponse.json({ contracts: [] }, { status: 500 });
  }
}

// POST /api/projects/:id/contracts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = Number(params.id);
    if (isNaN(projectId)) return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });

    const body = await request.json();
    const [row] = await db.insert(contracts).values({
      projectId,
      title: body.title || 'Contract',
      fileUrl: body.fileUrl || null,
      status: body.status || 'draft',
      contractType: body.contractType || 'general',
      signedAt: body.signedAt ? new Date(body.signedAt) : null,
      expiryDate: body.expiryDate || null,
      terms: body.terms || null,
      counterpartyName: body.counterpartyName || null,
      counterpartyEmail: body.counterpartyEmail || null,
    }).returning();

    return NextResponse.json({ contract: row });
  } catch (err) {
    console.error('Failed to create contract:', err);
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}

// DELETE /api/projects/:id/contracts?contractId=X
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(request: Request, _context: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = Number(searchParams.get('contractId'));
    if (!contractId) return NextResponse.json({ error: 'Missing contractId' }, { status: 400 });

    await db.delete(contracts).where(eq(contracts.id, contractId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete contract:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
