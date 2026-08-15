"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, ChevronDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uid } from "./list-editor";
import type { CustomSection } from "@/types";

function ItemRow({
  value,
  onChange,
  onDelete,
}: {
  value: { title: string; detail: string };
  onChange: (v: { title: string; detail: string }) => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-start gap-2">
      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/70" />
      <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr]">
        <input
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Item title"
          className="h-9 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <input
          value={value.detail}
          onChange={(e) => onChange({ ...value, detail: e.target.value })}
          placeholder="Detail"
          className="h-9 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="mt-2.5 text-muted-foreground/60 hover:text-red-500"
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function CustomSectionCard({
  section,
  onChange,
  onDelete,
  onMove,
  index,
  count,
}: {
  section: CustomSection;
  onChange: (s: CustomSection) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  index: number;
  count: number;
}) {
  const [open, setOpen] = useState(index === count - 1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        "overflow-hidden rounded-xl border bg-card/60 transition-colors",
        open ? "border-blue-500/40 shadow-[0_8px_30px_-12px_rgba(59,130,246,0.35)]" : "border-border"
      )}
    >
      <div className="flex w-full items-center gap-2 px-3 py-2.5">
        <span className="cursor-grab text-muted-foreground/40">
          <GripVertical className="h-4 w-4" />
        </span>
        <input
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="Section title (e.g. Volunteer Work)"
          className="min-w-0 flex-1 rounded-md border-0 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/50"
        />
        <div className="hidden items-center gap-0.5 sm:flex">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="rounded p-1 text-muted-foreground/70 hover:bg-accent hover:text-foreground disabled:opacity-30"
            aria-label="Move section up"
          >
            <ChevronDown className="h-3.5 w-3.5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            className="rounded p-1 text-muted-foreground/70 hover:bg-accent hover:text-foreground disabled:opacity-30"
            aria-label="Move section down"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-1 text-muted-foreground/60 hover:bg-red-500/10 hover:text-red-500"
          aria-label="Delete section"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Collapse section" : "Expand section"}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
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
            <div className="space-y-2 border-t border-border/60 px-4 pb-4 pt-3">
              {section.items.map((item, i) => (
                <ItemRow
                  key={i}
                  value={item}
                  onChange={(v) => {
                    const items = [...section.items];
                    items[i] = v;
                    onChange({ ...section, items });
                  }}
                  onDelete={() => onChange({ ...section, items: section.items.filter((_, idx) => idx !== i) })}
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                className="border-dashed text-muted-foreground"
                onClick={() => onChange({ ...section, items: [...section.items, { title: "", detail: "" }] })}
              >
                <Plus className="h-3.5 w-3.5" /> Add item
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function CustomSectionsEditor({
  sections,
  onChange,
}: {
  sections: CustomSection[];
  onChange: (s: CustomSection[]) => void;
}) {
  const addSection = () => {
    onChange([...sections, { id: uid(), title: "", items: [{ title: "", detail: "" }], order: sections.length }]);
  };

  return (
    <div className="space-y-3">
      {sections.length > 0 ? (
        <div className="space-y-2.5">
          {sections.map((s, i) => (
            <CustomSectionCard
              key={s.id}
              section={s}
              index={i}
              count={sections.length}
              onChange={(next) => {
                const all = [...sections];
                all[i] = next;
                onChange(all);
              }}
              onDelete={() => onChange(sections.filter((_, idx) => idx !== i))}
              onMove={(dir) => {
                const j = i + dir;
                if (j < 0 || j >= sections.length) return;
                const all = [...sections];
                const [item] = all.splice(i, 1);
                all.splice(j, 0, item);
                onChange(all);
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Add custom sections for things like publications, volunteer work, or leadership.
        </p>
      )}
      <Button variant="outline" className="w-full border-dashed text-muted-foreground" onClick={addSection}>
        <Plus className="h-4 w-4" /> Add custom section
      </Button>
    </div>
  );
}
