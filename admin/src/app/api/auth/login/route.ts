import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPin, createSession, PIN } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "PIN required" }, { status: 400 });
    }

    const [existingUser] = await db.select().from(users).where(eq(users.email, "admin@latenightricky.com"));
    let user = existingUser;

    if (!user) {
      const bcrypt = await import("bcryptjs");
      const hash = await bcrypt.hash(PIN, 10);
      const [inserted] = await db.insert(users).values({
        pinHash: hash,
        name: "Admin",
        email: "admin@latenightricky.com",
      }).returning();
      user = inserted;
    }

    const valid = await verifyPin(pin, user.pinHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
