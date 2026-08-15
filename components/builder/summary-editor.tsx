"use client";

import { motion } from "motion/react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SummaryTone = "professional" | "ats" | "concise";

const TONES: { id: SummaryTone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "ats", label: "ATS-friendly" },
  { id: "concise", label: "Concise" },
];

export function SummaryEditor({
  value,
  onChange,
  onGenerate,
  generating,
  generatedPreview,
  onApply,
  onDiscard,
}: {
  value: string;
  onChange: (v: string) => void;
  onGenerate: (tone: SummaryTone) => void;
  generating: SummaryTone | null;
  generatedPreview: string | null;
  onApply: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-muted-foreground">Write with AI:</span>
        {TONES.map((t) => (
          <Button
            key={t.id}
            variant={generating === t.id ? "gradient" : "secondary"}
            size="sm"
            onClick={() => onGenerate(t.id)}
            disabled={generating !== null}
          >
            {generating === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-blue-500" />}
            {t.label}
          </Button>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder="Tell your story. Who you are, what you build, and the impact you make…"
          className="min-h-[150px] w-full resize-y rounded-xl border border-input bg-background/70 p-4 pr-12 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <motion.span
          className="absolute bottom-4 right-4 text-[11px] font-medium text-muted-foreground/70"
          key={value.length}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {value.trim() ? `${value.trim().split(/\s+/).length} words` : ""}
        </motion.span>
      </div>

      {generatedPreview ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4"
        >
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-500">
            <RefreshCw className="h-3 w-3" />
            <span>
              {generatedPreview.length > 260
                ? "AI draft — longer than 260 chars. Paste-proof? Consider trimming."
                : "AI draft ready"}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{generatedPreview}</p>
          <div className="mt-3 flex gap-2">
            <Button variant="gradient" size="sm" onClick={onApply}>
              Use this summary
            </Button>
            <Button variant="ghost" size="sm" onClick={onDiscard}>
              Discard
            </Button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

export function validateSummary(v: string): string | null {
  if (!v.trim()) return null;
  if (v.length > 600) return "Keep it under 600 characters for best results.";
  return null;
}
