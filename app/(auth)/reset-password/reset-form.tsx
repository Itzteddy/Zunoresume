"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { resetPasswordAction } from "@/actions/auth";
import { AuthCard, SubmitButton } from "@/components/auth/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, null);

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a strong password for your account."
      footer={
        <>
          <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-400">
            Back to login
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
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
            <Link href="/login" className="ml-1 font-semibold underline">
              Log in
            </Link>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className="pl-9"
              required
            />
          </div>
        </div>

        <SubmitButton pendingText="Resetting…">Reset password</SubmitButton>
      </form>
    </AuthCard>
  );
}
