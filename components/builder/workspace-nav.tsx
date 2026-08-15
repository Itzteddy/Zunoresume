"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Undo2, Redo2, Sparkles, Eye, EyeOff, Share2, Download, Loader2, Check,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export type SaveState = "idle" | "saving" | "saved" | "error";

export function WorkspaceNav({
  title,
  saveState,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  previewOpen,
  onTogglePreview,
  copilotOpen,
  onToggleCopilot,
  onDownload,
  downloading,
  onShare,
  children,
}: {
  title: string;
  saveState: SaveState;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  previewOpen: boolean;
  onTogglePreview: () => void;
  copilotOpen: boolean;
  onToggleCopilot: () => void;
  onDownload: () => void;
  downloading: boolean;
  onShare: () => void;
  children?: ReactNode;
}) {
  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="fixed inset-x-0 top-3 z-40 px-3 md:top-4 md:px-6"
    >
      <div className="glass-nav mx-auto flex h-14 max-w-[1440px] items-center gap-2 rounded-2xl px-3 shadow-lg shadow-black/5 md:gap-3 md:px-4">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2" aria-label="Back to dashboard">
          <Logo withText={false} markClassName="h-7 w-7" />
        </Link>

        <div className="hidden min-w-0 max-w-[220px] border-l border-border pl-3 lg:block">
          <p className="truncate text-sm font-semibold leading-tight">{title}</p>
          <SaveStatus state={saveState} />
        </div>

        <div className="mx-auto hidden max-w-[520px] flex-1 justify-center lg:flex">{children}</div>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-1.5">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo (Ctrl+Z)"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo (Ctrl+Shift+Z)"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            variant={copilotOpen ? "secondary" : "ghost"}
            size="sm"
            className="hidden sm:inline-flex"
            onClick={onToggleCopilot}
          >
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="hidden md:inline">Copilot</span>
          </Button>
          <Button
            variant={previewOpen ? "secondary" : "ghost"}
            size="sm"
            className="hidden md:inline-flex"
            onClick={onTogglePreview}
          >
            {previewOpen ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span className="hidden lg:inline">Preview</span>
          </Button>
          <Button variant="ghost" size="iconSm" onClick={onShare} aria-label="Share resume link" title="Share">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="gradient" size="sm" onClick={onDownload} disabled={downloading}>
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span className="hidden sm:inline">{downloading ? "Exporting" : "Download"}</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

function SaveStatus({ state }: { state: SaveState }) {
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="flex items-center gap-1 text-[11px] text-emerald-500">
        <Check className="h-3 w-3" /> Saved
      </span>
    );
  }
  if (state === "error") {
    return <span className="text-[11px] text-red-500">Save failed</span>;
  }
  return null;
}

export function MobileTitle({ title, saveState }: { title: string; saveState: SaveState }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold leading-tight">{title}</p>
      <SaveStatus state={saveState} />
    </div>
  );
}
