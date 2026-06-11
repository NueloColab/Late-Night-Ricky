import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { showPages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('lnr_admin_session')?.value || cookieStore.get('lnr_session')?.value;
  return !!session;
}

// GET /api/show-pages/[id] — get single show page
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const rows = await db.select().from(showPages).where(eq(showPages.id, parseInt(params.id))).limit(1);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders() });
    }
    return NextResponse.json({ showPage: rows[0] }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Show page GET error:', err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500, headers: corsHeaders() });
  }
}

// PUT /api/show-pages/[id] — update show page (admin only)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const body = await request.json();
    const updates: any = {};

    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.title !== undefined) updates.title = body.title;
    if (body.venue !== undefined) updates.venue = body.venue;
    if (body.location !== undefined) updates.location = body.location;
    if (body.season !== undefined) updates.season = body.season;
    if (body.description !== undefined) updates.description = body.description;
    if (body.heroImage !== undefined) updates.heroImage = body.heroImage;
    if (body.setLength !== undefined) updates.setLength = body.setLength;
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    updates.updatedAt = new Date();

    await db.update(showPages).set(updates).where(eq(showPages.id, parseInt(params.id)));
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Show page PUT error:', err);
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500, headers: corsHeaders() });
  }
}

// DELETE /api/show-pages/[id] — delete show page (admin only)
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    await db.delete(showPages).where(eq(showPages.id, parseInt(params.id)));
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Show page DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500, headers: corsHeaders() });
  }
}
