"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, MoreHorizontal, Pencil, Copy, Trash2, Gauge, ExternalLink, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  duplicateResumeAction, renameInlineAction, deleteResumeAction,
} from "@/actions/resume";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ResumeListItem = {
  id: string;
  title: string;
  templateSlug: string;
  templateName: string;
  atsScore: number | null;
  fullName: string | null;
  updatedAt: string;
  createdAt: string;
};

export function ResumeCard({ resume }: { resume: ResumeListItem }) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(resume.title);

  async function runAction(fn: (form: FormData) => Promise<void>, label: string) {
    const form = new FormData();
    form.set("resumeId", resume.id);
    try {
      await fn(form);
      toast.success(label);
      router.refresh();
    } catch {
      toast.error(`Could not ${label.toLowerCase()}.`);
    }
  }

  async function submitRename() {
    const value = title.trim();
    if (!value || value === resume.title) {
      setRenaming(false);
      return;
    }
    try {
      await renameInlineAction({ resumeId: resume.id, title: value });
      toast.success("Renamed.");
      router.refresh();
    } catch {
      toast.error("Could not rename.");
    }
    setRenaming(false);
  }

  return (
    <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/15 to-cyan-500/15 text-blue-600 dark:text-blue-400">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            {renaming ? (
              <div className="flex items-center gap-1.5">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitRename();
                    if (e.key === "Escape") {
                      setTitle(resume.title);
                      setRenaming(false);
                    }
                  }}
                  className="h-8 w-48"
                  autoFocus
                />
                <Button size="iconSm" variant="ghost" onClick={submitRename} aria-label="Save">
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="iconSm"
                  variant="ghost"
                  onClick={() => {
                    setTitle(resume.title);
                    setRenaming(false);
                  }}
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link
                href={`/builder/${resume.id}?step=personal`}
                className="block max-w-[220px] truncate text-base font-semibold hover:text-blue-500"
              >
                {resume.title}
              </Link>
            )}
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{resume.templateName}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="iconSm" aria-label="Resume actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/builder/${resume.id}?step=personal`}>
                <ExternalLink className="h-4 w-4" /> Open
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setRenaming(true)}>
              <Pencil className="h-4 w-4" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => runAction(duplicateResumeAction, "Duplicated")}>
              <Copy className="h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => runAction(deleteResumeAction, "Deleted")}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {resume.fullName ? (
        <p className="mt-3 truncate text-sm text-muted-foreground">{resume.fullName}</p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Unnamed resume</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <span className="text-xs text-muted-foreground">
          Updated {new Date(resume.updatedAt).toLocaleDateString()}
        </span>
        {resume.atsScore != null ? (
          <Badge
            variant="outline"
            className={cn(
              "gap-1",
              resume.atsScore >= 80
                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                : resume.atsScore >= 60
                  ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
                  : "border-destructive/40 text-destructive"
            )}
          >
            <Gauge className="h-3 w-3" />
            ATS {resume.atsScore}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">No ATS score yet</span>
        )}
      </div>
    </Card>
  );
}
