"use client";

import { motion } from "motion/react";
import { Check, Gauge } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";

export function TemplateChips({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TEMPLATES.map((t) => {
        const active = selected === t.slug;
        return (
          <button
            key={t.slug}
            type="button"
            onClick={() => onSelect(t.slug)}
            className={cn(
              "group relative rounded-xl border p-2.5 text-left transition-all duration-200",
              active
                ? "border-blue-500/60 bg-blue-500/10 shadow-[0_8px_24px_-12px_rgba(59,130,246,0.5)]"
                : "border-border bg-card/60 hover:border-foreground/20"
            )}
          >
            {active ? (
              <motion.span
                layoutId="template-check"
                className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white"
              >
                <Check className="h-3 w-3" />
              </motion.span>
            ) : null}
            <span
              className="mb-2 block h-1.5 w-10 rounded-full"
              style={{ background: t.accent }}
              aria-hidden
            />
            <span className="block text-sm font-semibold leading-tight">{t.name}</span>
            <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Gauge className="h-3 w-3" /> ATS {t.atsScore}
            </span>
          </button>
        );
      })}
    </div>
  );
}
