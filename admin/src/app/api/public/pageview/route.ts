import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pageViews } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const page = typeof body.page === 'string' ? body.page.slice(0, 200) : '/';

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Upsert: increment views for today, or insert if not exists
    await db
      .insert(pageViews)
      .values({ date: today, views: 1, uniqueVisitors: 1 })
      .onConflictDoUpdate({
        target: pageViews.date,
        set: { views: sql`${pageViews.views} + 1` },
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Silent fail - don't break the site if tracking fails
    console.error('Pageview tracking error:', err);
    return NextResponse.json({ ok: true });
  }
}