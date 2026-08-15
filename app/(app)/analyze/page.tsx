import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listResumes } from "@/services/resume";
import { AnalyzeClient } from "@/components/analyze/analyze-client";

export const metadata: Metadata = { title: "Resume Analyzer" };

export default async function AnalyzePage() {
  const user = await requireUser();
  const resumes = await listResumes(user.id);

  return (
    <AnalyzeClient
      resumes={resumes.map((r) => ({ id: r.id, title: r.title, atsScore: r.atsScore }))}
    />
  );
}
