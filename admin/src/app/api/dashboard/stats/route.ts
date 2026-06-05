import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { siteSections, submissions, projects, invoices } from '@/lib/db/schema';
import { count, desc, eq } from 'drizzle-orm';

export async function GET() {
  // Upcoming gigs: projects with eventDate >= today, not paid/completed
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const allProjects = await db.select().from(projects);
  const upcomingProjects = allProjects.filter(p => {
    if (!p.eventDate) return false;
    if (p.status === 'paid' || p.status === 'completed') return false;
    return (p.eventDate as string) >= today;
  });
  const upcomingGigsList = upcomingProjects
    .sort((a, b) => (a.eventDate as string).localeCompare(b.eventDate as string))
    .slice(0, 5);
  const upcomingGigs = upcomingProjects.length;

  // Revenue this month: sum of paid invoices
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const allInvoices = await db.select().from(invoices);
  const paidThisMonth = allInvoices.filter(i =>
    i.status === 'paid' && i.paidAt && new Date(i.paidAt).toISOString() >= monthStart
  );
  const revenueThisMonth = paidThisMonth.reduce((sum, i) => sum + (i.total || 0), 0);

  // Unpaid invoices
  const unpaidInvoices = allInvoices.filter(i => i.status !== 'paid');
  const unpaidTotal = unpaidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

  // New submissions
  const [submissionsCount] = await db.select({ count: count() }).from(submissions).where(eq(submissions.status, 'new'));

  // Last 5 updated sections
  const lastUpdated = await db
    .select()
    .from(siteSections)
    .orderBy(desc(siteSections.updatedAt))
    .limit(5);

  return NextResponse.json({
    upcomingGigs,
    upcomingGigsList,
    revenueThisMonth,
    unpaidInvoices: unpaidInvoices.length,
    unpaidTotal,
    newSubmissions: submissionsCount.count,
    lastUpdated: lastUpdated.map(s => ({
      page: s.page,
      section: s.section,
      updatedAt: s.updatedAt?.toISOString() || null,
    })),
  });
}