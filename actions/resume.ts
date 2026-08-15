"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/lib/templates";
import {
  createResume,
  duplicateResume,
  renameResume,
  deleteResume,
  saveResumeSection,
  saveFullResume,
  updateResumeMeta,
} from "@/services/resume";
import type { ActionState, ResumeData, BuilderStep } from "@/types";

export async function createResumeAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "Untitled Resume").slice(0, 100);
  const templateSlug = String(formData.get("template") ?? "vector");

  const resume = await createResume(user.id, title, templateSlug);
  redirect(`/builder/${resume.id}?step=personal`);
}

export type CreateResumeResult = { ok: true; url: string } | { ok: false; loginUrl: string };

export async function createResumeWithTemplate(templateSlug: string): Promise<CreateResumeResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      loginUrl: `/login?next=${encodeURIComponent(`/templates/${templateSlug}`)}`,
    };
  }

  const resume = await createResume(user.id, `${getTemplate(templateSlug).name} Resume`, templateSlug);
  return { ok: true, url: `/builder/${resume.id}?step=personal` };
}

export async function duplicateResumeAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const resumeId = String(formData.get("resumeId") ?? "");
  if (!resumeId) return;
  await duplicateResume(user.id, resumeId);
  revalidatePath("/dashboard");
  revalidatePath("/resumes");
}

export async function renameResumeAction(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  const resumeId = String(formData.get("resumeId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!resumeId || !title) return { error: "Missing resume or title." };
  await renameResume(user.id, resumeId, title.slice(0, 100));
  revalidatePath("/dashboard");
  revalidatePath("/resumes");
  return { success: true, message: "Renamed." };
}

export async function deleteResumeAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const resumeId = String(formData.get("resumeId") ?? "");
  if (!resumeId) return;
  await deleteResume(user.id, resumeId);
  revalidatePath("/dashboard");
  revalidatePath("/resumes");
}

export async function saveSectionAction(input: {
  resumeId: string;
  section: string;
  value: unknown;
  step?: BuilderStep;
}): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  try {
    await saveResumeSection(user.id, input.resumeId, input.section, input.value);
    if (input.step) {
      const stepIndex = STEP_INDEX[input.step];
      if (typeof stepIndex === "number") {
        await updateResumeMeta(user.id, input.resumeId, { lastEditedStep: stepIndex });
      }
    }
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save." };
  }
}

export async function saveFullResumeAction(input: {
  resumeId: string;
  data: ResumeData;
}): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  try {
    await saveFullResume(user.id, input.resumeId, input.data);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save." };
  }
}

export async function saveAndContinueAction(input: {
  resumeId: string;
  section: string;
  value: unknown;
  step: BuilderStep;
}): Promise<ActionState> {
  const result = await saveSectionAction(input);
  if (!result.success) return result;
  const next = NEXT_STEP[input.step];
  if (next) {
    redirect(`/builder/${input.resumeId}?step=${next}`);
  }
  redirect(`/builder/${input.resumeId}?step=review`);
}

export async function updateTemplateAction(input: {
  resumeId: string;
  templateSlug: string;
}): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  const tpl = await prisma.template.findUnique({ where: { slug: input.templateSlug } });
  if (!tpl) return { error: "Template not found." };
  await prisma.resume.updateMany({
    where: { id: input.resumeId, userId: user.id },
    data: { templateId: tpl.id },
  });
  revalidatePath(`/builder/${input.resumeId}`);
  return { success: true, message: "Template updated." };
}

export async function updateAtsScoreAction(input: {
  resumeId: string;
  score: number | null;
}): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await updateResumeMeta(user.id, input.resumeId, { atsScore: input.score });
}

export async function trackEventAction(input: {
  event: string;
  resumeId?: string;
  templateId?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.analytics.create({
    data: {
      event: input.event,
      resumeId: input.resumeId ?? null,
      templateId: input.templateId ?? null,
      userId: user.id,
      meta: (input.meta ?? {}) as object,
    },
  });
}

const STEP_INDEX: Record<BuilderStep, number> = {
  personal: 0,
  summary: 1,
  education: 2,
  experience: 3,
  projects: 4,
  skills: 5,
  certifications: 6,
  achievements: 7,
  internships: 8,
  languages: 9,
  interests: 10,
  custom: 11,
  review: 12,
};

const NEXT_STEP: Record<BuilderStep, BuilderStep | null> = {
  personal: "summary",
  summary: "education",
  education: "experience",
  experience: "projects",
  projects: "skills",
  skills: "certifications",
  certifications: "achievements",
  achievements: "internships",
  internships: "languages",
  languages: "interests",
  interests: "custom",
  custom: "review",
  review: null,
};

const resumeNameSchema = z.object({ resumeId: z.string(), title: z.string() });

export async function renameInlineAction(input: { resumeId: string; title: string }): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  const parsed = resumeNameSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input." };
  await renameResume(user.id, parsed.data.resumeId, parsed.data.title.trim().slice(0, 100));
  revalidatePath("/dashboard");
  return { success: true };
}
