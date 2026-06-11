import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects, tracks, submissions, invoices, enquiries, quotes, clients } from '@/lib/db/schema';
import { sql, eq, and, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [projectCount] = await db.select({ count: sql<number>`count(*)::int` }).from(projects);
    const [trackCount] = await db.select({ count: sql<number>`count(*)::int` }).from(tracks);
    const [submissionCount] = await db.select({ count: sql<number>`count(*)::int` }).from(submissions);
    const [invoiceCount] = await db.select({ count: sql<number>`count(*)::int` }).from(invoices);
    const [enquiryCount] = await db.select({ count: sql<number>`count(*)::int` }).from(enquiries);
    const [quoteCount] = await db.select({ count: sql<number>`count(*)::int` }).from(quotes);
    const [clientCount] = await db.select({ count: sql<number>`count(*)::int` }).from(clients);

    // Revenue from paid invoices
    const [revenue] = await db.select({ total: sql<number>`COALESCE(sum(total), 0)::int` }).from(invoices).where(eq(invoices.status, 'paid'));

    // Pending counts
    const [pendingEnquiries] = await db.select({ count: sql<number>`count(*)::int` }).from(enquiries).where(eq(enquiries.status, 'new'));
    const [draftQuotes] = await db.select({ count: sql<number>`count(*)::int` }).from(quotes).where(eq(quotes.status, 'draft'));
    const [unpaidInvoices] = await db.select({ count: sql<number>`count(*)::int` }).from(invoices).where(and(eq(invoices.status, 'sent'), eq(invoices.paymentConfirmedByClient, false)));

    // Recent enquiries
    const recentEnquiries = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(5);

    // Recent quotes
    const recentQuotes = await db.select().from(quotes).orderBy(desc(quotes.sentAt)).limit(5);

    return NextResponse.json({
      shows: projectCount?.count ?? 0,
      tracks: trackCount?.count ?? 0,
      submissions: submissionCount?.count ?? 0,
      invoices: invoiceCount?.count ?? 0,
      enquiries: enquiryCount?.count ?? 0,
      quotes: quoteCount?.count ?? 0,
      clients: clientCount?.count ?? 0,
      revenue: revenue?.total ?? 0,
      pendingEnquiries: pendingEnquiries?.count ?? 0,
      draftQuotes: draftQuotes?.count ?? 0,
      unpaidInvoices: unpaidInvoices?.count ?? 0,
      recentEnquiries,
      recentQuotes,
    });
  } catch (err: any) {
    console.error('Dashboard stats error:', err);
    return NextResponse.json({ shows: 0, tracks: 0, submissions: 0, invoices: 0, enquiries: 0, quotes: 0, clients: 0, revenue: 0, pendingEnquiries: 0, draftQuotes: 0, unpaidInvoices: 0, recentEnquiries: [], recentQuotes: [] });
  }
}
