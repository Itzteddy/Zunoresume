"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, CheckCircle2, Download, Pencil, LayoutDashboard, Loader2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "preparing", label: "Preparing your resume" },
  { id: "rendering", label: "Rendering pages" },
  { id: "optimizing", label: "Optimizing layout" },
  { id: "finalizing", label: "Finalizing file" },
] as const;

export type DownloadState =
  | { phase: "idle" }
  | { phase: "running"; stage: number }
  | { phase: "done"; size: number; pages: number };

export function DownloadDialog({
  open,
  onOpenChange,
  state,
  stage,
  pages,
  template,
  onRerun,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  state: DownloadState;
  stage: number;
  pages: number;
  template: unknown;
  onRerun: () => void;
  onEdit: () => void;
}) {
  const done = state.phase === "done";

  const tmpl = template as { name?: string } | null;
  const templateName = tmpl?.name ?? "Resume";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/60 bg-background/95 backdrop-blur-xl sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Download resume</DialogTitle>
          <DialogDescription className="sr-only">Exporting your resume as a PDF.</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex flex-col items-center py-2 text-center"
            >
              <motion.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500"
              >
                <CheckCircle2 className="h-8 w-8" />
              </motion.span>
              <h2 className="mt-4 text-xl font-bold">Your resume is ready</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {templateName} · {state.phase === "done" ? state.pages : pages} page{state.phase === "done" && state.pages > 1 ? "s" : ""} ·{" "}
                {(state.phase === "done" ? state.size : 0) / 1024 > 0
                  ? `${((state.phase === "done" ? state.size : 0) / 1024).toFixed(0)} KB`
                  : "PDF"}
              </p>

              <div className="mt-5 grid w-full grid-cols-2 gap-2">
                <Button variant="gradient" onClick={onRerun}>
                  <Download className="h-4 w-4" /> Download again
                </Button>
                <Button variant="outline" onClick={onEdit}>
                  <Pencil className="h-4 w-4" /> Edit resume
                </Button>
                <Button variant="ghost" asChild className="col-span-2">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" /> Back to dashboard
                  </Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="run"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex flex-col items-center py-2 text-center"
            >
              <div className="relative">
                <motion.span
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_16px_40px_-12px_rgba(37,99,235,0.7)]"
                >
                  <FileText className="h-7 w-7" />
                </motion.span>
                <span className="ai-orbital absolute -inset-2 rounded-3xl" aria-hidden />
              </div>
              <h2 className="mt-4 text-lg font-semibold">{STAGES[stage]?.label ?? "Preparing…"}</h2>
              <p className="mt-1 text-xs text-muted-foreground">Generating a pixel-perfect A4 PDF</p>

              <div className="mt-5 w-full space-y-2">
                {STAGES.map((s, i) => {
                  const active = i === stage;
                  const doneStage = i < stage;
                  return (
                    <div key={s.id} className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors",
                          doneStage
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : active
                              ? "border-blue-500 bg-blue-500/10 text-blue-500"
                              : "border-border text-muted-foreground/60"
                        )}
                      >
                        {doneStage ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium transition-colors",
                          active || doneStage ? "text-foreground" : "text-muted-foreground/60"
                        )}
                      >
                        {s.label}
                      </span>
                      {active ? <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-blue-500" /> : null}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
