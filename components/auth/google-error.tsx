"use client";

import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

const GOOGLE_OAUTH_ERRORS: Record<string, string> = {
  google_not_configured:
    "Google sign-in isn't configured yet. Please use email and password.",
  google_invalid_state:
    "Google sign-in failed a security check. Please try again.",
  google_token_failed:
    "Google couldn't complete the sign-in. Please try again.",
  google_deleted_client:
    "Your Google OAuth client was deleted. Recreate it in the Google Cloud Console and update GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET, then restart the dev server.",
  google_invalid_client:
    "The Google OAuth client credentials are invalid or out of date. Update GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in your environment.",
  google_userinfo_failed:
    "Couldn't fetch your Google profile. Please try again.",
  google_no_email:
    "Your Google account has no email address we can use. Try another account.",
  google_denied: "Google sign-in was cancelled.",
  google_redirect_mismatch:
    "Google rejected the sign-in link. The redirect URI is not registered in the Google Cloud Console.",
};

export function GoogleOAuthError() {
  const params = useSearchParams();
  const error = params.get("error");
  const detail = params.get("detail");
  if (!error) return null;

  const message = GOOGLE_OAUTH_ERRORS[error] ?? "Google sign-in failed. Please try again.";
  const isMismatch = error === "google_redirect_mismatch";

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${
        isMismatch
          ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        {message}
        {isMismatch ? (
          <span className="mt-1 block font-mono text-xs opacity-80">
            Expected: {`${window.location.origin}/api/auth/google/callback`}
          </span>
        ) : null}
        {error === "google_token_failed" && detail ? (
          <span className="mt-1 block font-mono text-xs opacity-80">{detail}</span>
        ) : null}
      </span>
    </div>
  );
}
