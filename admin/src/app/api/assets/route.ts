import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const allAssets = await db.select().from(assets).orderBy(desc(assets.uploadedAt));
  return NextResponse.json({ assets: allAssets });
}
