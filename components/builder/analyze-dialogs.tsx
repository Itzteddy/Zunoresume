"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  Gauge, Target, Loader2, CheckCircle2, XCircle, ArrowRight, FileSearch, Sparkles,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ATSAnalysisResult, JobMatchResult } from "@/types";
import { cn } from "@/lib/utils";

function scoreColor(score: number) {
  if (score >= 80) return { text: "text-emerald-500", ring: "stroke-emerald-500", label: "Strong" };
  if (score >= 60) return { text: "text-amber-500", ring: "stroke-amber-500", label: "Getting there" };
  return { text: "text-red-500", ring: "stroke-red-500", label: "Needs work" };
}

function ScoreRing({ score }: { score: number }) {
  const c = scoreColor(score);
  const r = 44;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className={cn("stroke-current", c.ring)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold", c.text)}>{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="capitalize text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
        />
      </div>
    </div>
  );
}

export function AtsDialog({
  open,
  onOpenChange,
  result,
  running,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  result: ATSAnalysisResult | null;
  running: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[82vh] max-w-2xl overflow-y-auto border-border/60 bg-background/95 backdrop-blur-xl sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15">
              <Gauge className="h-4 w-4 text-emerald-500" />
            </span>
            ATS Analysis
          </DialogTitle>
          <DialogDescription>
            How automated recruiters will read your resume.
          </DialogDescription>
        </DialogHeader>

        {running && !result ? (
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Scanning your resume against ATS rules…</p>
          </div>
        ) : result ? (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/50 p-5 sm:flex-row sm:items-center sm:justify-around">
              <ScoreRing score={result.score} />
              <div className="text-center sm:text-left">
                <p className={cn("text-sm font-semibold", scoreColor(result.score).text)}>
                  {scoreColor(result.score).label}
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  {result.score >= 80
                    ? "Great job — your resume is built to pass ATS screeners."
                    : result.score >= 60
                      ? "Decent, but tightening a few sections will help a lot."
                      : "A few targeted fixes will meaningfully improve your odds."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(result.breakdown).map(([key, value]) => (
                <BreakdownBar key={key} label={key} value={value} />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {result.strengths.length ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                  <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> Strengths
                  </h4>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {result.weaknesses.length ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-3.5">
                  <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-500">
                    <XCircle className="h-4 w-4" /> Weaknesses
                  </h4>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {result.weaknesses.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {result.recommendations.length ? (
              <div className="rounded-2xl border border-border bg-card/50 p-3.5">
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-blue-500" /> Recommendations
                </h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function JobDialog({
  open,
  onOpenChange,
  jobDesc,
  onJobDescChange,
  onRun,
  running,
  result,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  jobDesc: string;
  onJobDescChange: (v: string) => void;
  onRun: () => void;
  running: boolean;
  result: JobMatchResult | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[82vh] max-w-2xl overflow-y-auto border-border/60 bg-background/95 backdrop-blur-xl sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15">
              <Target className="h-4 w-4 text-blue-500" />
            </span>
            Match to a job
          </DialogTitle>
          <DialogDescription>
            Paste a job description to see how well your resume fits — and what to tweak.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <textarea
            value={jobDesc}
            onChange={(e) => onJobDescChange(e.target.value)}
            rows={6}
            placeholder="Paste the full job description here…"
            className="w-full resize-y rounded-xl border border-input bg-background/60 p-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <Button variant="gradient" className="w-full" onClick={onRun} disabled={running || !jobDesc.trim()}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
            {running ? "Analyzing match…" : "Analyze match"}
          </Button>
        </div>

        <AnimatePresence>
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 border-t border-border/70 pt-4"
            >
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-card/50 p-4">
                <ScoreRing score={result.matchPercent} />
                <div>
                  <p className="text-sm font-semibold">Match percentage</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.matchPercent >= 80
                      ? "Strong fit. Lead with the matched skills in your summary."
                      : result.matchPercent >= 55
                        ? "Reasonable fit — close the gap on the missing skills."
                        : "Weak fit. Add the missing skills or tailor your bullets to this role."}
                  </p>
                </div>
              </div>

              {result.matchedSkills.length ? (
                <div>
                  <h4 className="mb-1.5 text-sm font-semibold text-emerald-600">On your resume</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedSkills.map((s) => (
                      <span key={s} className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {result.missingSkills.length ? (
                <div>
                  <h4 className="mb-1.5 text-sm font-semibold text-amber-600">Missing from your resume</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills.map((s) => (
                      <span key={s} className="rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {result.recommendations.length ? (
                <div className="rounded-2xl border border-border bg-card/50 p-3.5">
                  <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-blue-500" /> Recommendations
                  </h4>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
