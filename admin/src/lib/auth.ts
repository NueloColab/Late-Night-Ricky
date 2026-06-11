import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const SESSION_COOKIE = 'lnr_session';
const PIN = '7291';

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function createSession(userId: number): Promise<string> {
  const token = Buffer.from(`${userId}:${Date.now()}:${Math.random()}`).toString('base64');
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return token;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const userId = parseInt(decoded.split(':')[0], 10);
    if (!userId || isNaN(userId)) return null;

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user || null;
  } catch {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getSessionUser();
  return !!user;
}

export { PIN };
