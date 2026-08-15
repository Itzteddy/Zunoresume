import type { Metadata } from "next";
import { VerifyEmailForm } from "./verify-form";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        This verification link is missing its token.
      </div>
    );
  }

  return <VerifyEmailForm token={token} />;
}
