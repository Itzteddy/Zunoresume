"use client";

import {
  LayoutGrid, Palette, Download, Check, Gauge, Target, Loader2, Share2, X,
} from "lucide-react";
import { motion } from "motion/react";
import { STEPS } from "./step-defs";
import { TemplateChips } from "./template-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BuilderStep } from "@/types";

export type PanelTab = "sections" | "templates" | "export";

const TABS: { id: PanelTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "sections", label: "Sections", icon: LayoutGrid },
  { id: "templates", label: "Templates", icon: Palette },
  { id: "export", label: "Export", icon: Download },
];

export function PanelBody({
  tab,
  onTabChange,
  step,
  completed,
  onNavigate,
  templateSlug,
  onTemplateChange,
  templateChanging,
  atsScore,
  atsRunning,
  onAts,
  onJobMatch,
  onDownload,
  downloading,
  onShare,
  onCloseMobile,
  mobile,
}: {
  tab: PanelTab;
  onTabChange: (t: PanelTab) => void;
  step: BuilderStep;
  completed: Partial<Record<BuilderStep, boolean>>;
  onNavigate: (step: BuilderStep) => void;
  templateSlug: string;
  onTemplateChange: (slug: string) => void;
  templateChanging: boolean;
  atsScore: number | null;
  atsRunning: boolean;
  onAts: () => void;
  onJobMatch: () => void;
  onDownload: () => void;
  downloading: boolean;
  onShare: () => void;
  onCloseMobile: () => void;
  mobile: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-border/70 p-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors",
              tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === t.id ? (
              <motion.span
                layoutId={mobile ? "panel-pill-m" : "panel-pill"}
                className="absolute inset-0 rounded-lg bg-accent"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            ) : null}
            <t.icon className="relative h-3.5 w-3.5" />
            <span className="relative">{t.label}</span>
          </button>
        ))}
        {mobile ? (
          <Button variant="ghost" size="iconSm" onClick={onCloseMobile} aria-label="Close panel">
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === "sections" ? (
          <nav className="flex flex-col gap-0.5">
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
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-gradient-to-r from-blue-600/15 to-cyan-500/10 font-medium text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                          ? "bg-blue-600 text-white"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                  </span>
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </nav>
        ) : tab === "templates" ? (
          <div className="space-y-3">
            <p className="px-1 text-xs text-muted-foreground">
              Switching templates instantly restyles your resume. Pick the one that fits the role.
            </p>
            <TemplateChips selected={templateSlug} onSelect={onTemplateChange} />
            {templateChanging ? (
              <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Applying template…
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="px-1 text-xs text-muted-foreground">
              Run checks and export your finished resume.
            </p>
            <Button variant="gradient" className="w-full" onClick={onDownload} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {downloading ? "Exporting…" : "Download PDF"}
            </Button>
            <Button variant="outline" className="w-full" onClick={onShare}>
              <Share2 className="h-4 w-4" /> Share link
            </Button>

            <div className="my-2 h-px bg-border" />

            <div className="rounded-xl border border-border bg-card/60 p-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                  <Gauge className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">ATS Score</p>
                  <p className="text-xs text-muted-foreground">
                    {atsScore != null ? `Last analysis: ${atsScore}/100` : "Not analyzed yet"}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={onAts} disabled={atsRunning}>
                {atsRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gauge className="h-3.5 w-3.5" />}
                {atsScore != null ? "Re-run analysis" : "Analyze ATS"}
              </Button>
              <Button variant="outline" size="sm" className="mt-1.5 w-full" onClick={onJobMatch}>
                <Target className="h-3.5 w-3.5" /> Match to a job
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
