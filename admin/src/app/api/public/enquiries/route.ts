import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enquiries } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

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

// POST /api/public/enquiries — submit a contact form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, email, clubName, city, fee, eventDate, message } = body;

    if (!type || !name || !email) {
      return NextResponse.json(
        { error: 'Type, name and email are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const [result] = await db.insert(enquiries).values({
      type,
      name,
      email,
      clubName: clubName || null,
      city: city || null,
      fee: fee || null,
      eventDate: eventDate || null,
      message: message || null,
      status: 'new',
    }).returning();

    return NextResponse.json(
      { success: true, enquiry: result },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err: any) {
    console.error('[Public Enquiries POST] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to submit enquiry' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// GET /api/public/enquiries — list enquiries (public read-only)
export async function GET() {
  try {
    const all = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
    return NextResponse.json({ enquiries: all }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('[Public Enquiries GET] Error:', err);
    return NextResponse.json(
      { enquiries: [] },
      { status: 500, headers: corsHeaders() }
    );
  }
}
