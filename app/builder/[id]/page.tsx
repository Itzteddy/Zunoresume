import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getResume } from "@/services/resume";
import { TEMPLATES } from "@/lib/templates";
import { BuilderWorkspace } from "@/components/builder/workspace";
import type { BuilderStep } from "@/types";

export const metadata: Metadata = { title: "Resume Builder" };

const VALID_STEPS: BuilderStep[] = [
  "personal", "summary", "education", "experience", "projects", "skills",
  "certifications", "achievements", "internships", "languages", "interests",
  "custom", "review",
];

export default async function BuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { id } = await params;
  const { step: stepParam } = await searchParams;
  const user = await requireUser();

  const resume = await getResume(user.id, id);
  if (!resume) notFound();

  const template = TEMPLATES.find((t) => t.slug === resume.meta.templateSlug) ?? TEMPLATES[0];
  const initialStep: BuilderStep = VALID_STEPS.includes(stepParam as BuilderStep)
    ? (stepParam as BuilderStep)
    : "personal";

  return (
    <BuilderWorkspace
      resumeId={resume.meta.id}
      title={resume.meta.title}
      data={resume.data}
      template={template}
      initialStep={initialStep}
      atsScore={resume.meta.atsScore}
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      }}
    />
  );
}
