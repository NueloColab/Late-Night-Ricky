import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { showPages } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { cookies } from 'next/headers';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

// GET /api/show-pages — list all show pages
export async function GET() {
  try {
    const rows = await db.select().from(showPages).orderBy(desc(showPages.createdAt));
    return NextResponse.json({ showPages: rows }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Show pages GET error:', err);
    return NextResponse.json({ showPages: [] }, { status: 500, headers: corsHeaders() });
  }
}

// POST /api/show-pages — create new show page (admin only)
export async function POST(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const body = await request.json();
    const { slug, title, venue, location, season, description, heroImage, setLength } = body;

    if (!slug || !title || !venue || !location || !season) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders() });
    }

    const [result] = await db.insert(showPages).values({
      slug,
      title,
      venue,
      location,
      season,
      description: description || null,
      heroImage: heroImage || null,
      setLength: setLength || null,
      isActive: true,
    }).returning();

    return NextResponse.json({ showPage: result }, { status: 201, headers: corsHeaders() });
  } catch (err: any) {
    console.error('Show pages POST error:', err);
    return NextResponse.json({ error: err.message || 'Create failed' }, { status: 500, headers: corsHeaders() });
  }
}
