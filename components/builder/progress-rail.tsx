"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { BuilderStep } from "@/types";
import { cn } from "@/lib/utils";

export type Milestone = { id: string; label: string; steps: BuilderStep[] };

export const MILESTONES: Milestone[] = [
  { id: "profile", label: "Profile", steps: ["personal"] },
  { id: "summary", label: "Summary", steps: ["summary"] },
  { id: "education", label: "Education", steps: ["education"] },
  { id: "experience", label: "Experience", steps: ["experience", "internships"] },
  { id: "projects", label: "Projects", steps: ["projects"] },
  {
    id: "skills",
    label: "Skills",
    steps: ["skills", "certifications", "achievements", "languages", "interests", "custom"],
  },
  { id: "final", label: "Final", steps: ["review"] },
];

export function getMilestoneForStep(step: BuilderStep): Milestone {
  return MILESTONES.find((m) => m.steps.includes(step)) ?? MILESTONES[0];
}

export function ProgressRail({
  step,
  completed,
  onNavigate,
}: {
  step: BuilderStep;
  completed: Partial<Record<BuilderStep, boolean>>;
  onNavigate: (step: BuilderStep) => void;
}) {
  const activeId = getMilestoneForStep(step).id;
  const activeIndex = MILESTONES.findIndex((m) => m.id === activeId);

  return (
    <div className="no-scrollbar flex items-center overflow-x-auto" aria-label="Resume progress">
      {MILESTONES.map((m, i) => {
        const done = m.steps.every((s) => completed[s]) && !(m.id === "final" && i !== activeIndex);
        const active = m.id === activeId;
        const reached = i <= activeIndex;
        const isLast = i === MILESTONES.length - 1;
        const target = m.steps[0];

        return (
          <div key={m.id} className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => onNavigate(target)}
              aria-current={active ? "step" : undefined}
              className="group flex items-center gap-2 rounded-full px-1 py-1"
            >
              <span
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300",
                  done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : active
                      ? "animate-milestone-glow border-blue-500 bg-blue-500 text-white"
                      : reached
                        ? "border-blue-500/40 text-blue-500"
                        : "border-border text-muted-foreground"
                )}
              >
                {done ? (
                  <motion.span
                    initial={{ scale: 0.3 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.span>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium transition-colors xl:inline",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {m.label}
              </span>
            </button>
            {!isLast ? (
              <span
                className={cn(
                  "mx-1 h-px w-5 transition-colors duration-500 sm:w-9",
                  i < activeIndex ? "bg-emerald-500/60" : "bg-border"
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
