import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  getSessionTokenFromCookie,
  getSessionFromToken,
} from "@/lib/auth/session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: "USER" | "ADMIN";
  provider: string;
  isDisabled: boolean;
  title: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  website: string | null;
  createdAt: Date;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await getSessionTokenFromCookie();
  if (!token) return null;
  const session = await getSessionFromToken(token);
  if (!session) return null;
  if (session.user.isDisabled) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    image: session.user.image,
    role: session.user.role,
    provider: session.user.provider,
    isDisabled: session.user.isDisabled,
    title: session.user.title,
    phone: session.user.phone,
    location: session.user.location,
    linkedin: session.user.linkedin,
    github: session.user.github,
    portfolio: session.user.portfolio,
    website: session.user.website,
    createdAt: session.user.createdAt,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export async function getClientIp() {
  try {
    const h = await headers();
    const fwd = h.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0]?.trim();
    return h.get("x-real-ip") ?? undefined;
  } catch {
    return undefined;
  }
}

export function isAdminEmail(email: string) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export async function getSessionList(userId: string) {
  return prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
