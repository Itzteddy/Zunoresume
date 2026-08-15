import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listResumes } from "@/services/resume";
import { AssistantClient } from "@/components/assistant/assistant-client";

export const metadata: Metadata = { title: "AI Assistant" };

export default async function AssistantPage() {
  const user = await requireUser();
  const resumes = await listResumes(user.id);

  return (
    <AssistantClient resumes={resumes.map((r) => ({ id: r.id, title: r.title }))} />
  );
}
