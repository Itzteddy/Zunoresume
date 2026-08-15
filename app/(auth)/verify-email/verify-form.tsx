"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheck, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { verifyEmailAction } from "@/actions/auth";
import { AuthCard, SubmitButton } from "@/components/auth/auth-card";

export function VerifyEmailForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(verifyEmailAction, null);

  return (
    <AuthCard
      title="Verify your email"
      description="Confirm your email address to finish setting up your account."
      footer={
        state?.success ? (
          <Link href="/dashboard" className="inline-flex items-center gap-1 font-semibold text-blue-500 hover:text-blue-400">
            Go to dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <>
            Need another link?{" "}
            <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-400">
              Log in to resend it
            </Link>
          </>
        )
      }
    >
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div className="flex items-center gap-3 rounded-xl border border-border bg-accent/40 px-4 py-3 text-sm text-muted-foreground">
          <MailCheck className="h-5 w-5 shrink-0 text-blue-500" />
          Click the button below to confirm your email address.
        </div>

        {state?.error ? (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.error}
          </div>
        ) : null}
        {state?.success ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {state.message}
          </div>
        ) : null}

        <SubmitButton pendingText="Verifying…">Verify email</SubmitButton>
      </form>
    </AuthCard>
  );
}
