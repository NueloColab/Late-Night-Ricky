import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const ADMIN_PIN = process.env.ADMIN_PIN || "0000";
const SESSION_COOKIE = "lnr_admin_session";

export async function verifyPin(pin: string): Promise<boolean> {
  const hash = await bcrypt.hash(ADMIN_PIN, 10);
  return bcrypt.compare(pin, hash);
}

export async function createSession() {
  const cookieStore = await cookies();
  const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString("base64");
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}
