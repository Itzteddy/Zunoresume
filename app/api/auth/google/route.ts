import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { safeInternalPath } from "@/lib/utils";
import {
  GOOGLE_OAUTH_COOKIE,
  getGoogleAuthUrl,
  isGoogleConfigured,
} from "@/lib/auth/google";

export async function GET(req: NextRequest) {
  if (!isGoogleConfigured()) {
    redirect("/login?error=google_not_configured");
  }

  const next = safeInternalPath(req.nextUrl.searchParams.get("next"));
  const state = randomBytes(24).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_OAUTH_COOKIE, JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const host = (await headers()).get("host");

  const url = getGoogleAuthUrl({ state, host });
  redirect(url);
}
