"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Check, Info } from "lucide-react";

type DebugInfo = {
  configured: boolean;
  appUrl: string;
  redirectUri: string;
};

export function OAuthRedirectHint() {
  const params = useSearchParams();
  const [info, setInfo] = useState<DebugInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const visible =
    params.get("debug") === "1" || params.get("error") === "google_redirect_mismatch";

  useEffect(() => {
    if (!visible) return;
    fetch("/api/auth/google/debug")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setInfo(d))
      .catch(() => {});
  }, [visible]);

  if (!visible || !info) return null;
  const redirectUri = info.redirectUri;

  async function copyUri() {
    try {
      await navigator.clipboard.writeText(redirectUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3 text-xs text-muted-foreground">
      <p className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
        <Info className="h-3.5 w-3.5" /> Google OAuth debug
      </p>
      <p className="mt-1.5">
        Copy this EXACT string into Google Cloud Console → Credentials → your OAuth
        client → <span className="font-medium">Authorized redirect URIs</span>:
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg bg-accent px-2 py-1.5 font-mono text-[11px]">
          {redirectUri}
        </code>
        <button
          type="button"
          onClick={copyUri}
          className="shrink-0 rounded-lg border border-border px-2 py-1.5 font-medium hover:bg-accent"
          aria-label="Copy redirect URI"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <p className="mt-1.5">
        Make sure there is <span className="font-medium">no trailing slash</span> and it uses{" "}
        <span className="font-medium">http://</span> for local development. Restart the dev
        server after changing env vars.
      </p>
    </div>
  );
}
