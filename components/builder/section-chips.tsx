"use client";

import { Check } from "lucide-react";
import { STEPS, getStepDef } from "./step-defs";
import { cn } from "@/lib/utils";
import type { BuilderStep } from "@/types";

export function SectionChips({
  step,
  completed,
  onNavigate,
}: {
  step: BuilderStep;
  completed: Partial<Record<BuilderStep, boolean>>;
  onNavigate: (step: BuilderStep) => void;
}) {
  return (
    <div className="no-scrollbar flex items-center gap-1 overflow-x-auto py-1">
      {STEPS.map((s) => {
        const active = step === s.id;
        const done = completed[s.id];
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onNavigate(s.id)}
            className={cn(
              "group relative flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
              active
                ? "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-300"
                : done
                  ? "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground hover:border-emerald-500/50 hover:text-foreground"
                  : "border-border bg-background/50 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {done ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Icon className={cn("h-3.5 w-3.5", active && "text-blue-500")} />
            )}
            {s.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

export function getStepIcon(step: BuilderStep) {
  return getStepDef(step).icon;
}
