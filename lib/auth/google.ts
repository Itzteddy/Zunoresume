import "server-only";

export const GOOGLE_OAUTH_COOKIE = "google_oauth_state";

export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

export type GoogleCredentials = {
  clientId: string;
  clientSecret: string;
};

export function getGoogleCredentials(): GoogleCredentials | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function isGoogleConfigured(): boolean {
  return getGoogleCredentials() !== null;
}

/**
 * Resolves the canonical base URL of the application.
 *
 * Priority: APP_URL > NEXT_PUBLIC_APP_URL > request Host header > localhost.
 * The trailing slash is always stripped so redirect URIs never mismatch on
 * `http://localhost:3000/` vs `http://localhost:3000`.
 */
export function getAppUrl(host?: string | null): string {
  const fromEnv =
    process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  if (host) {
    const cleanHost = host.replace(/\/+$/, "");
    return /^https?:\/\//i.test(cleanHost)
      ? cleanHost
      : `http://${cleanHost}`;
  }

  return "http://localhost:3000";
}

/**
 * The exact redirect URI sent to Google. Must match an "Authorized redirect
 * URI" in the Google Cloud Console character-for-character.
 */
export function getGoogleRedirectUri(host?: string | null): string {
  return `${getAppUrl(host)}${GOOGLE_CALLBACK_PATH}`;
}

/**
 * Builds the Google OAuth 2.0 authorization URL used for the "Sign in with
 * Google" flow (authorization code grant, server-side secret exchange).
 */
export function getGoogleAuthUrl({
  state,
  host,
}: {
  state: string;
  host?: string | null;
}): string {
  const credentials = getGoogleCredentials();
  if (!credentials) throw new Error("Google OAuth is not configured.");

  const params = new URLSearchParams({
    client_id: credentials.clientId,
    redirect_uri: getGoogleRedirectUri(host),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    access_type: "online",
    include_granted_scopes: "true",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchanges the authorization `code` for tokens. The `redirect_uri` here MUST
 * be identical to the one used when building the authorization URL.
 */
export async function exchangeCodeForTokens({
  code,
  host,
}: {
  code: string;
  host?: string | null;
}): Promise<{ ok: boolean; status: number; data: { access_token?: string; error?: string; error_description?: string } }> {
  const credentials = getGoogleCredentials();
  if (!credentials) {
    return { ok: false, status: 0, data: { error: "not_configured" } };
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      redirect_uri: getGoogleRedirectUri(host),
      grant_type: "authorization_code",
    }),
  });

  let data: {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  try {
    data = (await res.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };
  } catch {
    data = { error: `invalid_token_response`, error_description: `HTTP ${res.status}` };
  }
  if (!res.ok) {
    console.error(
      "[google-oauth] token exchange failed",
      JSON.stringify({ status: res.status, data }, null, 2)
    );
  }
  return { ok: res.ok, status: res.status, data };
}

export type GoogleUserInfo = {
  id: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export async function fetchGoogleUser(
  accessToken: string
): Promise<GoogleUserInfo | null> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  try {
    return (await res.json()) as GoogleUserInfo;
  } catch {
    return null;
  }
}
