import "server-only";
import { SignJWT, jwtVerify } from "jose";

const secret = () => {
  const value = process.env.AUTH_SECRET?.trim();
  if (!value) {
    throw new Error("Missing AUTH_SECRET environment variable.");
  }
  return new TextEncoder().encode(value);
};

const BASE = 60 * 60 * 1000;

export async function signToken(payload: Record<string, unknown>, expiresInMs: number) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + Math.floor(expiresInMs / 1000))
    .sign(secret());
}

export async function verifyToken<T = Record<string, unknown>>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload as T;
  } catch {
    return null;
  }
}

export function emailVerifyToken(userId: string) {
  return signToken({ sub: userId, purpose: "email-verify" }, 24 * BASE);
}

export function passwordResetToken(userId: string) {
  return signToken({ sub: userId, purpose: "password-reset" }, 1 * BASE);
}

export type TokenPayload = {
  sub?: string;
  purpose?: string;
};
