"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { forgotPasswordAction } from "@/actions/auth";
import { AuthCard, SubmitButton } from "@/components/auth/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPasswordAction, null);

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-400">
            Back to login
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        {state?.error ? (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.error}
          </div>
        ) : null}
        {state?.success ? (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {state.message}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-9"
              required
            />
          </div>
        </div>

        <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
      </form>
    </AuthCard>
  );
}
