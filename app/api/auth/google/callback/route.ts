import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";
import { getClientIp, isAdminEmail } from "@/lib/auth";
import { safeInternalPath } from "@/lib/utils";
import {
  GOOGLE_OAUTH_COOKIE,
  exchangeCodeForTokens,
  fetchGoogleUser,
  getAppUrl,
} from "@/lib/auth/google";

export async function GET(req: NextRequest) {
  const host = req.headers.get("host");
  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, getAppUrl(host)));

  try {
    return await handleCallback(req, redirectTo, host);
  } catch (err) {
    console.error("[google-oauth] callback threw", err);
    return redirectTo(
      `/login?error=google_token_failed&detail=${encodeURIComponent(
        err instanceof Error ? err.message : String(err)
      )}`
    );
  }
}

async function handleCallback(
  req: NextRequest,
  redirectTo: (path: string) => NextResponse,
  host: string | null
) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  const cookieStore = await cookies();
  let storedState: string | null = null;
  let oauthNext: string | null = null;
  const rawCookie = cookieStore.get(GOOGLE_OAUTH_COOKIE)?.value;
  cookieStore.delete(GOOGLE_OAUTH_COOKIE);

  if (rawCookie) {
    try {
      const parsed = JSON.parse(rawCookie);
      storedState = typeof parsed.state === "string" ? parsed.state : null;
      oauthNext = typeof parsed.next === "string" ? parsed.next : null;
    } catch {
      storedState = rawCookie;
    }
  }

  if (error === "access_denied") return redirectTo("/login?error=google_denied");
  if (!code || !state || state !== storedState) {
    return redirectTo("/login?error=google_invalid_state");
  }

  const tokenResult = await exchangeCodeForTokens({ code, host });
  if (!tokenResult.ok || !tokenResult.data.access_token) {
    // Google returns `redirect_uri_mismatch` here when the redirect URI used
    // for the code exchange differs from the one used in the auth request.
    if (tokenResult.data.error === "redirect_uri_mismatch") {
      return redirectTo("/login?error=google_redirect_mismatch");
    }
    if (tokenResult.data.error === "deleted_client") {
      return redirectTo("/login?error=google_deleted_client");
    }
    if (tokenResult.data.error === "invalid_client") {
      return redirectTo("/login?error=google_invalid_client");
    }
    return redirectTo(
      `/login?error=google_token_failed&detail=${encodeURIComponent(
        tokenResult.data.error_description ?? tokenResult.data.error ?? ""
      )}`
    );
  }

  const info = await fetchGoogleUser(tokenResult.data.access_token);
  if (!info || !info.email) return redirectTo("/login?error=google_no_email");

  const existingUser = await prisma.user.findUnique({ where: { email: info.email } });
  let userId: string;

  if (existingUser) {
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: info.id,
        },
      },
      update: { accessToken: tokenResult.data.access_token },
      create: {
        userId: existingUser.id,
        provider: "google",
        providerAccountId: info.id,
        accessToken: tokenResult.data.access_token,
      },
    });
    userId = existingUser.id;
  } else {
    const user = await prisma.user.create({
      data: {
        name: info.name || info.email.split("@")[0] || "User",
        email: info.email,
        emailVerified: info.email_verified ? new Date() : null,
        image: info.picture,
        provider: "GOOGLE",
        role: isAdminEmail(info.email) ? "ADMIN" : "USER",
      },
    });
    await prisma.account.create({
      data: {
        userId: user.id,
        provider: "google",
        providerAccountId: info.id,
        accessToken: tokenResult.data.access_token,
      },
    });
    userId = user.id;
  }

  await createSession({
    userId,
    remember: true,
    ip: await getClientIp(),
  });

  const next = safeInternalPath(oauthNext);
  return redirectTo(next ?? "/dashboard?welcome=1");
}
