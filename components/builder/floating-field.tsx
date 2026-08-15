"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, CheckCircle2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PersonalInfo } from "@/types";

export type FieldStatus = "idle" | "valid" | "invalid";

export function FloatingField({
  label,
  icon: Icon,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  autoComplete,
  status = "idle",
  error,
  className,
}: {
  label: string;
  icon?: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  status?: FieldStatus;
  error?: string;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "group relative flex items-center rounded-xl border bg-background/70 transition-all duration-200",
          focused
            ? "border-blue-500 shadow-[0_4px_20px_-8px_rgba(59,130,246,0.45)] ring-2 ring-blue-500/20"
            : status === "invalid"
              ? "border-red-500/70"
              : status === "valid"
                ? "border-emerald-500/60"
                : "border-input"
        )}
      >
        {Icon ? (
          <Icon
            className={cn(
              "pointer-events-none absolute left-3.5 h-4 w-4 transition-colors",
              focused ? "text-blue-500" : "text-muted-foreground/70"
            )}
          />
        ) : null}
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={focused ? placeholder : ""}
          className="h-12 w-full bg-transparent pb-1.5 pt-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          style={{ paddingLeft: Icon ? 40 : 14, paddingRight: status === "idle" ? 14 : 38 }}
        />
        <label
          className={cn(
            "pointer-events-none absolute font-medium transition-all duration-200",
            active
              ? "top-[6px] translate-y-0 text-[10px] uppercase tracking-wider text-blue-500"
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          )}
          style={{ left: Icon ? 40 : 14 }}
        >
          {label}
        </label>
        <AnimatePresence>
          {status === "invalid" ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="pointer-events-none absolute right-3.5 text-red-500"
            >
              <AlertCircle className="h-4 w-4" />
            </motion.span>
          ) : status === "valid" && value ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="pointer-events-none absolute right-3.5 text-emerald-500"
            >
              <CheckCircle2 className="h-4 w-4" />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {status === "invalid" && error ? (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-1.5 pt-1 text-xs text-red-500"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function validatePersonalField(field: keyof PersonalInfo, value: string): string | null {
  switch (field) {
    case "email":
      if (!value) return null;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : "That email doesn't look right.";
    case "phone":
      if (!value) return null;
      return /^[+()\d\s-]{7,20}$/.test(value.trim()) ? null : "Check the phone number.";
    case "linkedin":
      if (!value) return null;
      return /linkedin\.com\//i.test(value) ? null : "Should include linkedin.com/…";
    case "github":
      if (!value) return null;
      return /github\.com\//i.test(value) ? null : "Should include github.com/…";
    case "portfolio":
    case "website":
      if (!value) return null;
      return /^\S+\.\S{2,}$/.test(value.trim()) ? null : "Looks like an incomplete URL.";
    case "fullName":
      return value.trim() ? null : "Your name helps recruiters find you.";
    default:
      return null;
  }
}
