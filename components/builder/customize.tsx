"use client";

import { type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import type { TemplateConfig } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CustomOverrides = Partial<
  Pick<
    TemplateConfig,
    "font" | "accent" | "accentDark" | "textColor" | "sectionStyle" | "showPhoto" | "monochrome"
  >
>;

const FONTS: { id: "sans" | "serif" | "mono"; label: string; sample: string }[] = [
  { id: "sans", label: "Sans", sample: "Aa" },
  { id: "serif", label: "Serif", sample: "Aa" },
  { id: "mono", label: "Mono", sample: "Aa" },
];

const SECTION_STYLES: { id: TemplateConfig["sectionStyle"]; label: string }[] = [
  { id: "underline", label: "Underline" },
  { id: "line", label: "Line" },
  { id: "badge", label: "Badge" },
  { id: "bar", label: "Bar" },
  { id: "none", label: "Minimal" },
];

const ACCENTS = [
  "#2563eb", "#0ea5e9", "#7c3aed", "#06b6d4", "#1d4ed8",
  "#0284c7", "#059669", "#f59e0b", "#e11d48", "#111827",
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-blue-500/60 bg-blue-500/10 text-blue-600 dark:text-blue-300"
          : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
      )}
    >
      {active ? (
        <motion.span
          layoutId="chip-active"
          className="pointer-events-none absolute inset-0 rounded-lg bg-blue-500/10"
        />
      ) : null}
      <span className="relative">{children}</span>
    </button>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function CustomizePanel({
  value,
  onChange,
  onReset,
}: {
  value: CustomOverrides;
  onChange: (v: CustomOverrides) => void;
  onReset: () => void;
}) {
  const patch = (p: CustomOverrides) => onChange({ ...value, ...p });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">Tune typography, colors and layout. Updates the preview live.</p>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      <Group label="Typography">
        <div className="flex gap-1.5">
          {FONTS.map((f) => (
            <Chip key={f.id} active={value.font === f.id} onClick={() => patch({ font: f.id })}>
              <span
                className={cn(
                  "mr-1.5 inline-block",
                  f.id === "serif" && "font-serif",
                  f.id === "mono" && "font-mono"
                )}
              >
                {f.sample}
              </span>
              {f.label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group label="Section style">
        <div className="flex flex-wrap gap-1.5">
          {SECTION_STYLES.map((s) => (
            <Chip key={s.id} active={value.sectionStyle === s.id} onClick={() => patch({ sectionStyle: s.id })}>
              {s.label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group label="Accent color">
        <div className="flex flex-wrap items-center gap-1.5">
          {ACCENTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => patch({ accent: c, accentDark: c })}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                value.accent === c ? "border-foreground" : "border-transparent"
              )}
              style={{ background: c }}
              aria-label={`Accent ${c}`}
            />
          ))}
          <label
            className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-muted-foreground/40 text-[10px] font-semibold text-muted-foreground"
            title="Custom color"
          >
            +
            <input
              type="color"
              value={value.accent ?? "#2563eb"}
              onChange={(e) => patch({ accent: e.target.value, accentDark: e.target.value })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        </div>
      </Group>

      <Group label="Text color">
        <div className="flex gap-1.5">
          <Chip active={!value.textColor || value.textColor === "#1c2333"} onClick={() => patch({ textColor: "#1c2333" })}>
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-slate-900" /> Dark
          </Chip>
          <Chip active={value.textColor === "#3b4254"} onClick={() => patch({ textColor: "#3b4254" })}>
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-slate-600" /> Muted
          </Chip>
          <Chip active={value.textColor === "#101828"} onClick={() => patch({ textColor: "#101828" })}>
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-slate-950" /> Ink
          </Chip>
        </div>
      </Group>

      <Group label="Layout">
        <div className="space-y-2.5">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card/50 px-3 py-2.5">
            <span className="text-sm">Show photo</span>
            <Switch checked={value.showPhoto ?? true} onCheckedChange={(c) => patch({ showPhoto: c })} />
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card/50 px-3 py-2.5">
            <span className="text-sm">Monochrome (ATS-safe)</span>
            <Switch checked={value.monochrome ?? false} onCheckedChange={(c) => patch({ monochrome: c })} />
          </label>
        </div>
      </Group>
    </div>
  );
}

export function applyCustom(template: TemplateConfig, custom: CustomOverrides): TemplateConfig {
  return {
    ...template,
    font: custom.font ?? template.font,
    accent: custom.accent ?? template.accent,
    accentDark: custom.accentDark ?? template.accentDark ?? template.accent,
    textColor: custom.textColor ?? template.textColor ?? "#1c2333",
    sectionStyle: custom.sectionStyle ?? template.sectionStyle,
    showPhoto: custom.showPhoto ?? template.showPhoto,
    monochrome: custom.monochrome ?? template.monochrome,
  };
}
