"use client";

import { motion } from "motion/react";
import {
  CheckCircle2, Circle, Gauge, Target, Download, Loader2, Sparkles, CircleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STEPS } from "./step-defs";
import type { BuilderStep } from "@/types";

export function ReviewScene({
  completed,
  atsScore,
  atsRunning,
  onAts,
  onJob,
  onDownload,
  downloading,
  onCopilot,
}: {
  completed: Partial<Record<BuilderStep, boolean>>;
  atsScore: number | null;
  atsRunning: boolean;
  onAts: () => void;
  onJob: () => void;
  onDownload: () => void;
  downloading: boolean;
  onCopilot: () => void;
}) {
  const doneCount = STEPS.filter((s) => completed[s.id]).length;
  const total = STEPS.length - 1;
  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card/60 p-5"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" strokeWidth="7" className="stroke-muted" />
              <motion.circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 34}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - pct / 100) }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="progress-sweep stroke-current"
              />
            </svg>
            <div className="absolute text-xl font-bold">{pct}%</div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">Resume completion</h3>
            <p className="text-sm text-muted-foreground">
              {doneCount} of {total} sections complete
              {pct < 100 ? " — finish the rest for a stronger resume." : " — ready to export."}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {STEPS.filter((s) => s.id !== "review").map((s) => (
                <span
                  key={s.id}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    completed[s.id]
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {completed[s.id] ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                  {s.shortLabel}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl border border-border bg-card/60 p-5"
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
            <Gauge className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold">ATS Score</h3>
            <p className="text-sm text-muted-foreground">
              {atsScore != null
                ? `Your last analysis scored ${atsScore}/100.`
                : "See how recruiter software reads your resume before you send it."}
            </p>
          </div>
          {atsScore != null ? (
            <span className="text-3xl font-bold text-emerald-500">{atsScore}</span>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onAts} disabled={atsRunning}>
            {atsRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
            {atsScore != null ? "Re-run analysis" : "Analyze ATS"}
          </Button>
          <Button variant="outline" onClick={onJob}>
            <Target className="h-4 w-4" /> Match to a job
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="rounded-2xl border-gradient border border-border bg-card/60 p-5"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500">
            <Download className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold">Ready to export</h3>
            <p className="text-sm text-muted-foreground">
              Download a pixel-perfect PDF of your resume in the {""}
              <span className="font-medium text-foreground">current template</span>.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="gradient" onClick={onDownload} disabled={downloading}>
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Exporting…" : "Download PDF"}
          </Button>
          <Button variant="outline" onClick={onCopilot}>
            <Sparkles className="h-4 w-4 text-blue-500" /> Ask the copilot
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="rounded-2xl border border-border bg-card/60 p-5"
      >
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <CircleAlert className="h-4 w-4 text-amber-500" /> Before you hit send
        </h3>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>• Keep it to one page for most roles.</li>
          <li>• Start bullets with strong action verbs.</li>
          <li>• Mirror the keywords from the job post.</li>
          <li>• Double-check your contact info.</li>
        </ul>
      </motion.div>
    </div>
  );
}
