"use client";

import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Check, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AIEditOverlay({
  open,
  title,
  original,
  draft,
  onApply,
  onRetry,
  onClose,
}: {
  open: boolean;
  title: string;
  original: string;
  draft: string | null;
  onApply: () => void;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                </span>
                {title}
              </span>
              <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto p-4 md:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Original</p>
                <p className="rounded-xl bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground line-through decoration-muted-foreground/40">
                  {original || "Nothing here yet."}
                </p>
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-500">AI rewrite</p>
                {draft === null ? (
                  <div className="space-y-2 rounded-xl bg-blue-500/5 p-3">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.35, 0.8, 0.35] }}
                        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }}
                        className="h-3 rounded bg-blue-500/20"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap rounded-xl bg-blue-500/5 p-3 text-sm leading-relaxed text-foreground/90">
                    {draft}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border/70 px-4 py-3">
              <Button variant="ghost" size="sm" onClick={onRetry} disabled={draft === null}>
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
              <Button variant="gradient" size="sm" onClick={onApply} disabled={draft === null}>
                <Check className="h-4 w-4" /> Apply
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function AIResultDialog({
  open,
  title,
  body,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                </span>
                {title}
              </span>
              <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-4">
              {body === null ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{body}</p>
              )}
            </div>
            <div className="flex justify-end border-t border-border/70 px-4 py-3">
              <Button variant="gradient" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
