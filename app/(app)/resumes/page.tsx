import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listResumes } from "@/services/resume";
import { Button } from "@/components/ui/button";
import { ResumeCard, type ResumeListItem } from "@/components/resumes/resume-card";

export const metadata: Metadata = { title: "My Resumes" };

export default async function ResumesPage() {
  const user = await requireUser();
  const resumes = await listResumes(user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Resumes</h1>
          <p className="mt-1 text-muted-foreground">
            {resumes.length === 0
              ? "Create your first resume to get started."
              : `${resumes.length} resume${resumes.length === 1 ? "" : "s"} in your library.`}
          </p>
        </div>
        <Button asChild>
          <Link href="/templates">
            <FilePlus2 className="h-4 w-4" /> New Resume
          </Link>
        </Button>
      </div>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/15 to-cyan-500/15 text-blue-500">
            <FileText className="h-7 w-7" />
          </span>
          <h3 className="mt-4 text-lg font-semibold">No resumes yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Choose from 10 professional templates and let AI help you write it.
          </p>
          <Button asChild className="mt-5">
            <Link href="/templates">
              <FilePlus2 className="h-4 w-4" /> Create your first resume
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <ResumeCard key={r.id} resume={r as ResumeListItem} />
          ))}
        </div>
      )}
    </div>
  );
}
