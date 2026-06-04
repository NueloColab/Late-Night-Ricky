import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { siteSections, assets, submissions, projects } from '@/lib/db/schema';
import { count, desc } from 'drizzle-orm';

export async function GET() {
  const [sections] = await db.select({ count: count() }).from(siteSections);
  const [assetsCount] = await db.select({ count: count() }).from(assets);
  const [submissionsCount] = await db.select({ count: count() }).from(submissions);
  const [projectsCount] = await db.select({ count: count() }).from(projects);

  // Last updated section
  const lastUpdated = await db
    .select()
    .from(siteSections)
    .orderBy(desc(siteSections.updatedAt))
    .limit(1)
    .get();

  // Pending projects (not paid)
  const allProjects = await db.select().from(projects).all();
  const pendingProjects = allProjects.filter((p) => p.status !== 'paid').length;

  return NextResponse.json({
    sections: sections.count,
    assets: assetsCount.count,
    submissions: submissionsCount.count,
    projects: projectsCount.count,
    lastUpdated: lastUpdated
      ? { page: lastUpdated.page, section: lastUpdated.section, updatedAt: lastUpdated.updatedAt }
      : null,
    pendingProjects,
  });
}
