import "server-only";
import { prisma } from "@/lib/prisma";

type SlidingWindow = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, SlidingWindow>();

export function rateLimitInMemory(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0 };
  }
  entry.count += 1;
  return { ok: true, remaining: limit - entry.count };
}

export async function rateLimitAI(userId: string) {
  const windowMs = Number(process.env.AI_RATE_LIMIT_WINDOW_MS ?? 60000);
  const limit = Number(process.env.AI_RATE_LIMIT_PER_WINDOW ?? 30);

  const check = rateLimitInMemory(`ai:${userId}`, limit, windowMs);
  if (!check.ok) {
    return { ok: false, message: "You've reached the AI rate limit. Please wait a minute and try again." };
  }

  const since = new Date(Date.now() - windowMs);
  const dbCount = await prisma.aIRequest.count({
    where: { userId, createdAt: { gte: since } },
  });
  if (dbCount >= limit) {
    return { ok: false, message: "You've reached the AI rate limit. Please wait a minute and try again." };
  }
  return { ok: true, message: "" };
}

export function rateLimitAuth(key: string) {
  return rateLimitInMemory(`auth:${key}`, 10, 60 * 1000);
}
