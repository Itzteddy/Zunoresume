"use client";

import { Loader2, Sparkles, type LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AIButtonProps = Omit<ButtonProps, "loading"> & {
  loading?: boolean;
  label?: string;
  icon?: LucideIcon;
};

/**
 * Premium AI action button. Shows an orbital ring + spinning sparkle while
 * busy (instead of a bare spinner) and a soft ping ring on idle hover.
 */
export function AIButton({ loading, label, icon: Icon, children, className, ...props }: AIButtonProps) {
  const busy = Boolean(loading);
  return (
    <Button
      variant="gradient"
      disabled={busy || props.disabled}
      className={cn("ai-button relative overflow-hidden", className)}
      {...props}
    >
      <span className="ai-sparkle relative">
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : Icon ? (
          <Icon className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        <span className={cn(busy ? "ai-orbital" : "ai-sparkle-ring")} aria-hidden />
      </span>
      {label ?? children}
    </Button>
  );
}
