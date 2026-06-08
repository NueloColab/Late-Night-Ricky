import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { enquiries } from '@/lib/db/schema';
import { desc, eq, and, inArray } from 'drizzle-orm';
import { cookies } from 'next/headers';

function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get('origin') || undefined),
  });
}

async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get('lnr_admin_session')?.value || cookieStore.get('lnr_session')?.value;
  return !!session;
}

export async function GET(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = db.select().from(enquiries);
    const conditions: any[] = [];

    if (status && status !== 'all') {
      conditions.push(eq(enquiries.status, status as any));
    }

    const all = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(enquiries.createdAt))
      : await query.orderBy(desc(enquiries.createdAt));
    return NextResponse.json({ enquiries: all }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Enquiries GET error:', err);
    return NextResponse.json({ enquiries: [] }, { status: 500, headers: corsHeaders() });
  }
}

export async function PATCH(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400, headers: corsHeaders() });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    await db.update(enquiries).set(updates).where(eq(enquiries.id, id));
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Enquiry PATCH error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500, headers: corsHeaders() });
  }
}

export async function DELETE(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: 'IDs required' }, { status: 400, headers: corsHeaders() });
    }

    const idList = ids.split(',').map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
    if (idList.length === 0) {
      return NextResponse.json({ error: 'No valid IDs' }, { status: 400, headers: corsHeaders() });
    }

    await db.delete(enquiries).where(inArray(enquiries.id, idList));
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Enquiry DELETE error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500, headers: corsHeaders() });
  }
}
