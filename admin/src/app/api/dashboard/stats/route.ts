import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSections, assets, submissions, projects } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export async function GET() {
  const [sections] = await db.select({ count: count() }).from(siteSections);
  const [assetsCount] = await db.select({ count: count() }).from(assets);
  const [submissionsCount] = await db.select({ count: count() }).from(submissions);
  const [projectsCount] = await db.select({ count: count() }).from(projects);

  return NextResponse.json({
    sections: sections.count,
    assets: assetsCount.count,
    submissions: submissionsCount.count,
    projects: projectsCount.count,
  });
}
