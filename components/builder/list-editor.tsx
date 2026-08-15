"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GripVertical, ChevronDown, Trash2, Plus, ArrowUp, ArrowDown,
  Sparkles, Loader2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const uid = () => Math.random().toString(36).slice(2, 10);

function TextRow({
  label,
  value,
  onChange,
  placeholder,
  full,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  full?: boolean;
  rows?: number;
}) {
  return (
    <div className={cn("space-y-1.5", full ? "sm:col-span-2" : undefined)}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="min-h-[84px] w-full resize-y rounded-lg border border-input bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 w-full rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      )}
    </div>
  );
}

function BulletEditor({
  bullets,
  onChange,
  onRewrite,
  aiBulletId,
}: {
  bullets: string[];
  onChange: (b: string[]) => void;
  onRewrite?: (index: number, bullet: string) => void;
  aiBulletId?: string | null;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">Bullet points</label>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-blue-500 hover:text-blue-600"
          onClick={() => onChange([...bullets, ""])}
        >
          <Plus className="h-3.5 w-3.5" /> Add bullet
        </Button>
      </div>
      {bullets.map((b, i) => (
        <motion.div
          key={`${i}-${b.slice(0, 8)}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="group flex items-start gap-1.5"
        >
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/70" />
          <input
            value={b}
            onChange={(e) => {
              const next = [...bullets];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder="Describe an outcome, not just a task…"
            className="h-9 flex-1 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="button"
            onClick={() => onChange(bullets.filter((_, idx) => idx !== i))}
            className="mt-2 hidden text-muted-foreground/60 hover:text-red-500 group-hover:block"
            aria-label="Remove bullet"
          >
            <X className="h-4 w-4" />
          </button>
          {onRewrite ? (
            <button
              type="button"
              onClick={() => onRewrite(i, b)}
              disabled={aiBulletId !== null}
              className="mt-2 text-muted-foreground/60 hover:text-blue-500 disabled:opacity-50"
              aria-label="Rewrite with AI"
              title="Rewrite with AI"
            >
              {aiBulletId === `${i}` ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
            </button>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
}

function ItemCard({
  summary,
  defaultOpen,
  onUpdate,
  onDelete,
  onMove,
  index,
  count,
  children,
  accentDot,
}: {
  summary: string;
  defaultOpen?: boolean;
  onUpdate: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  index: number;
  count: number;
  children: ReactNode;
  accentDot?: string;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        "group overflow-hidden rounded-xl border bg-card/60 transition-colors",
        open ? "border-blue-500/40 shadow-[0_8px_30px_-12px_rgba(59,130,246,0.35)]" : "border-border"
      )}
    >
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          onUpdate();
        }}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <span className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground" title="Drag to reorder (coming soon)">
          <GripVertical className="h-4 w-4" />
        </span>
        {accentDot ? <span className={cn("h-2 w-2 shrink-0 rounded-full", accentDot)} /> : null}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {summary || <span className="text-muted-foreground/60">Untitled item</span>}
        </span>
        <span className="hidden items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onMove(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onMove(-1);
              }
            }}
            className={cn(
              "rounded p-1 text-muted-foreground/70 hover:bg-accent hover:text-foreground",
              index === 0 && "pointer-events-none opacity-30"
            )}
            aria-label="Move up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onMove(1);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onMove(1);
              }
            }}
            className={cn(
              "rounded p-1 text-muted-foreground/70 hover:bg-accent hover:text-foreground",
              index === count - 1 && "pointer-events-none opacity-30"
            )}
            aria-label="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </span>
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }
          }}
          className="rounded p-1 text-muted-foreground/60 hover:bg-red-500/10 hover:text-red-500"
          aria-label="Delete item"
        >
          <Trash2 className="h-4 w-4" />
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-border/60 px-4 pb-4 pt-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function ListSectionEditor({
  title,
  subtitle,
  addLabel,
  onAdd,
  count,
  children,
  accentDot = "bg-blue-500",
}: {
  title: string;
  subtitle?: string;
  addLabel: string;
  onAdd: () => void;
  count: number;
  children: ReactNode;
  accentDot?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", accentDot)} />
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-500">
          {count}
        </span>
      </div>
      <div className="space-y-2.5">{children}</div>
      <Button variant="outline" className="w-full border-dashed text-muted-foreground" onClick={onAdd}>
        <Plus className="h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}

export { TextRow, BulletEditor, ItemCard };
