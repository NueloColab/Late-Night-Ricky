import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects, tracks, submissions, invoices, enquiries } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [projectCount] = await db.select({ count: sql<number>`count(*)::int` }).from(projects);
    const [trackCount] = await db.select({ count: sql<number>`count(*)::int` }).from(tracks);
    const [submissionCount] = await db.select({ count: sql<number>`count(*)::int` }).from(submissions);
    const [invoiceCount] = await db.select({ count: sql<number>`count(*)::int` }).from(invoices);
    const [enquiryCount] = await db.select({ count: sql<number>`count(*)::int` }).from(enquiries);

    return NextResponse.json({
      shows: projectCount?.count ?? 0,
      tracks: trackCount?.count ?? 0,
      submissions: submissionCount?.count ?? 0,
      invoices: invoiceCount?.count ?? 0,
      enquiries: enquiryCount?.count ?? 0,
    });
  } catch {
    return NextResponse.json({ shows: 0, tracks: 0, submissions: 0, invoices: 0, enquiries: 0 });
  }
}
