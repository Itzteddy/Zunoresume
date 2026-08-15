"use client";

import { motion } from "motion/react";
import { Sparkles, Plus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  hint,
  onAdd,
  addLabel,
  onAi,
  aiLabel,
  accentDot = "bg-blue-500",
  className,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  onAdd?: () => void;
  addLabel?: string;
  onAi?: () => void;
  aiLabel?: string;
  accentDot?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 blur-2xl",
          accentDot
        )}
        aria-hidden
      />
      <span className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10", accentDot.replace("bg-", "text-"))}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{hint}</p>
      {(onAdd || onAi) ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {onAi ? (
            <Button variant="gradient" size="sm" onClick={onAi}>
              <Sparkles className="h-4 w-4" /> {aiLabel ?? "Generate with AI"}
            </Button>
          ) : null}
          {onAdd ? (
            <Button variant="outline" size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4" /> {addLabel ?? "Add"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}
