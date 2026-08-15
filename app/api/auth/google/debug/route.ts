import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  getAppUrl,
  getGoogleRedirectUri,
  isGoogleConfigured,
} from "@/lib/auth/google";

/**
 * Debug helper: shows the EXACT redirect URI the app sends to Google,
 * so it can be copied into the Google Cloud Console. Never returns secrets.
 */
export async function GET() {
  const host = (await headers()).get("host");
  return NextResponse.json({
    configured: isGoogleConfigured(),
    clientIdConfigured: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
    clientSecretConfigured: Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim()),
    appUrl: getAppUrl(host),
    redirectUri: getGoogleRedirectUri(host),
    callbackPath: "/api/auth/google/callback",
  });
}
