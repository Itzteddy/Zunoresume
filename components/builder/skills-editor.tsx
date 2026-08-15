"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Sparkles, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Skill } from "@/types";
import { uid } from "./list-editor";

const LEVELS = ["", "Beginner", "Intermediate", "Advanced", "Expert"];

export function SkillsEditor({
  skills,
  onChange,
  onSuggest,
  suggesting,
  suggested,
  onApplySuggested,
  onClearSuggested,
}: {
  skills: Skill[];
  onChange: (s: Skill[]) => void;
  onSuggest: () => void;
  suggesting: boolean;
  suggested: string[];
  onApplySuggested: () => void;
  onClearSuggested: () => void;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addDraft = () => {
    const name = draft.trim();
    if (!name) return;
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...skills, { id: uid(), name, level: "", order: skills.length }]);
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        <Button variant="secondary" size="sm" onClick={onSuggest} disabled={suggesting}>
          {suggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-blue-500" />}
          Suggest skills with AI
        </Button>
      </div>

      {suggested.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-500">
              <Sparkles className="h-3 w-3" /> AI suggested skills
            </span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onClearSuggested}>
              Discard
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggested.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-300"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="gradient" size="sm" onClick={onApplySuggested}>
              Add to skills
            </Button>
          </div>
        </motion.div>
      ) : null}

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {skills.map((s, i) => (
              <motion.span
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 py-1 pl-3 pr-1.5 text-sm shadow-sm transition-colors hover:border-blue-500/40"
              >
                {s.name}
                <select
                  value={s.level}
                  onChange={(e) => {
                    const next = [...skills];
                    next[i] = { ...s, level: e.target.value };
                    onChange(next);
                  }}
                  className="rounded-full border-0 bg-transparent text-[11px] font-medium text-muted-foreground outline-none [&>option]:text-foreground"
                  aria-label={`${s.name} level`}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l || "Level"}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onChange(skills.filter((_, idx) => idx !== i))}
                  className="rounded-full p-1 text-muted-foreground/60 hover:bg-red-500/10 hover:text-red-500"
                  aria-label={`Remove ${s.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No skills yet. Add some or let AI suggest a strong set.</p>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          placeholder="Type a skill and press Enter…"
          className="h-10 flex-1 rounded-xl border border-input bg-background/60 px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <Button variant="outline" onClick={addDraft}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}
