import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { logout } from "@/lib/auth";

export async function POST() {
  await logout();
  return NextResponse.json({ success: true });
}
