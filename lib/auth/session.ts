import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "zuno_session";

export const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SESSION_REMEMBER_DURATION = 90 * 24 * 60 * 60 * 1000; // 90 days

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken() {
  return randomBytes(32).toString("base64url");
}

export async function getSessionTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function createSession(opts: {
  userId: string;
  remember?: boolean;
  ip?: string;
  userAgent?: string;
}) {
  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + (opts.remember ? SESSION_REMEMBER_DURATION : SESSION_DURATION)
  );

  await prisma.session.create({
    data: {
      sessionToken: hashToken(token),
      userId: opts.userId,
      expiresAt,
      ip: opts.ip?.slice(0, 64),
      userAgent: opts.userAgent?.slice(0, 255),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession() {
  const token = await getSessionTokenFromCookie();
  if (token) {
    await prisma.session.deleteMany({
      where: { sessionToken: hashToken(token) },
    });
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function destroyAllUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionFromToken(token: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session;
}
