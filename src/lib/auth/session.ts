import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  signSession,
  verifySession,
  SESSION_COOKIE,
  type SessionPayload,
} from "./jwt";

export { SESSION_COOKIE };
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Create the session JWT and set it as an httpOnly, secure, sameSite cookie. */
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Resolve the full signed-in user, or null. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.sub } });
}
