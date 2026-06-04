import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const allAssets = await db.select().from(assets).orderBy(desc(assets.uploadedAt));
  return NextResponse.json({ assets: allAssets });
}
