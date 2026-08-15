import "server-only";
import { prisma } from "@/lib/prisma";
import { TEMPLATES } from "@/lib/templates";
import type {
  ResumeData, ResumeMeta, Education, Experience, Project, Skill,
  Certification, Achievement, Internship, Language, Interest, CustomSection,
} from "@/types";

export async function ensureTemplates() {
  for (const t of TEMPLATES) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: { name: t.name, category: t.category, description: t.description, atsScore: t.atsScore, isActive: true },
      create: { slug: t.slug, name: t.name, category: t.category, description: t.description, atsScore: t.atsScore, isActive: true },
    });
  }
}

function toArray<T extends { order: number }>(rows: T[] | undefined): T[] {
  return [...(rows ?? [])].sort((a, b) => a.order - b.order);
}

export async function getResume(userId: string, resumeId: string) {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
    include: {
      template: true,
      educations: { orderBy: { order: "asc" } },
      experiences: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
      achievements: { orderBy: { order: "asc" } },
      internships: { orderBy: { order: "asc" } },
      languages: { orderBy: { order: "asc" } },
      interests: { orderBy: { order: "asc" } },
      customSections: { orderBy: { order: "asc" } },
    },
  });

  if (!resume) return null;

  const data: ResumeData = {
    personal: {
      fullName: resume.fullName ?? "",
      title: resume.professionalTitle ?? "",
      email: resume.email ?? "",
      phone: resume.phone ?? "",
      location: resume.location ?? "",
      linkedin: resume.linkedin ?? "",
      github: resume.github ?? "",
      portfolio: resume.portfolio ?? "",
      website: resume.website ?? "",
      photo: resume.photo ?? "",
    },
    summary: resume.summary ?? "",
    education: toArray(resume.educations) as unknown as Education[],
    experience: toArray(resume.experiences) as unknown as Experience[],
    projects: toArray(resume.projects) as unknown as Project[],
    skills: toArray(resume.skills) as unknown as Skill[],
    certifications: toArray(resume.certifications) as unknown as Certification[],
    achievements: toArray(resume.achievements) as unknown as Achievement[],
    internships: toArray(resume.internships) as unknown as Internship[],
    languages: toArray(resume.languages) as unknown as Language[],
    interests: toArray(resume.interests) as unknown as Interest[],
    customSections: toArray(resume.customSections) as unknown as CustomSection[],
  };

  const meta: ResumeMeta = {
    id: resume.id,
    title: resume.title,
    templateSlug: resume.template?.slug ?? TEMPLATES[0].slug,
    atsScore: resume.atsScore,
    updatedAt: resume.updatedAt.toISOString(),
    createdAt: resume.createdAt.toISOString(),
  };

  return { data, meta, lastEditedStep: resume.lastEditedStep ?? 0 };
}

export async function listResumes(userId: string) {
  const resumes = await prisma.resume.findMany({
    where: { userId },
    include: { template: true },
    orderBy: { updatedAt: "desc" },
  });
  return resumes.map((r) => ({
    id: r.id,
    title: r.title,
    templateSlug: r.template?.slug ?? "vector",
    templateName: r.template?.name ?? "Vector",
    atsScore: r.atsScore,
    fullName: r.fullName,
    updatedAt: r.updatedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createResume(userId: string, title: string, templateSlug: string) {
  await ensureTemplates();
  const template = await prisma.template.findUnique({ where: { slug: templateSlug } });
  if (!template) throw new Error("Template not found");
  return prisma.resume.create({
    data: {
      userId,
      title,
      templateId: template.id,
      fullName: "",
    },
  });
}

export async function duplicateResume(userId: string, resumeId: string) {
  const source = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
  if (!source) throw new Error("Resume not found");

  const existing = await getResume(userId, resumeId);
  if (!existing) throw new Error("Resume not found");

  const copy = await prisma.resume.create({
    data: {
      userId,
      title: `${source.title} (Copy)`,
      templateId: source.templateId,
      fullName: source.fullName,
      professionalTitle: source.professionalTitle,
      email: source.email,
      phone: source.phone,
      location: source.location,
      linkedin: source.linkedin,
      github: source.github,
      portfolio: source.portfolio,
      website: source.website,
      photo: source.photo,
      summary: source.summary,
    },
  });

  const rels = {
    educations: existing.data.education,
    experiences: existing.data.experience,
    projects: existing.data.projects,
    skills: existing.data.skills,
    certifications: existing.data.certifications,
    achievements: existing.data.achievements,
    internships: existing.data.internships,
    languages: existing.data.languages,
    interests: existing.data.interests,
    customSections: existing.data.customSections,
  } as const;

  await prisma.$transaction(async (tx) => {
    for (const key of Object.keys(rels) as (keyof typeof rels)[]) {
      const items = rels[key] as Array<Record<string, unknown>>;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const { id: _id, order: _o, ...rest } = item;
        const modelName = (key.charAt(0).toUpperCase() + key.slice(1, -1)) as
          | "Education"
          | "Experience"
          | "Project"
          | "Skill"
          | "Certification"
          | "Achievement"
          | "Internship"
          | "Language"
          | "Interest"
          | "CustomSection";
        const client = tx as unknown as Record<string, { create: (args: unknown) => Promise<unknown> }>;
        await client[modelName].create({
          data: { ...rest, order: i, resumeId: copy.id },
        });
      }
    }
  });

  return copy;
}

export async function renameResume(userId: string, resumeId: string, title: string) {
  return prisma.resume.updateMany({
    where: { id: resumeId, userId },
    data: { title },
  });
}

export async function deleteResume(userId: string, resumeId: string) {
  return prisma.resume.deleteMany({ where: { id: resumeId, userId } });
}

export async function updateResumeMeta(userId: string, resumeId: string, data: { title?: string; atsScore?: number | null; lastEditedStep?: number }) {
  return prisma.resume.updateMany({ where: { id: resumeId, userId }, data });
}

type PrismaDelegate = {
  deleteMany: (args: { where: Record<string, unknown> }) => Promise<unknown>;
  upsert: (args: { where: Record<string, unknown>; create: Record<string, unknown>; update: Record<string, unknown> }) => Promise<unknown>;
};

const SECTION_DELEGATE_NAMES: Record<string, string> = {
  education: "education",
  experience: "experience",
  projects: "project",
  skills: "skill",
  certifications: "certification",
  achievements: "achievement",
  internships: "internship",
  languages: "language",
  interests: "interest",
  customSections: "customSection",
};

function getDelegate(tx: unknown, section: string): PrismaDelegate {
  const name = SECTION_DELEGATE_NAMES[section];
  const client = tx as unknown as Record<string, PrismaDelegate>;
  const delegate = client[name];
  if (!delegate) throw new Error(`Unknown section: ${section}`);
  return delegate;
}

export async function saveResumeSection(
  userId: string,
  resumeId: string,
  section: string,
  value: unknown
) {
  const owns = await prisma.resume.findFirst({ where: { id: resumeId, userId }, select: { id: true } });
  if (!owns) throw new Error("Resume not found");

  if (section === "personal" || section === "summary") {
    const v = (value ?? {}) as Record<string, string>;
    await prisma.resume.updateMany({
      where: { id: resumeId, userId },
      data: {
        fullName: String(v.fullName ?? "").slice(0, 200),
        professionalTitle: String(v.title ?? "").slice(0, 200),
        email: String(v.email ?? "").slice(0, 200),
        phone: String(v.phone ?? "").slice(0, 60),
        location: String(v.location ?? "").slice(0, 200),
        linkedin: String(v.linkedin ?? "").slice(0, 300),
        github: String(v.github ?? "").slice(0, 300),
        portfolio: String(v.portfolio ?? "").slice(0, 300),
        website: String(v.website ?? "").slice(0, 300),
        photo: String(v.photo ?? "").slice(0, 2000),
        ...(section === "summary" ? { summary: String(value ?? "").slice(0, 6000) } : {}),
      },
    });
    return { ok: true };
  }

  const items = (Array.isArray(value) ? value : []) as Array<Record<string, unknown>>;
  const ids = items.map((i) => String(i.id)).filter(Boolean);

  await prisma.$transaction(async (tx) => {
    const d = getDelegate(tx, section);
    await d.deleteMany({
      where: { resumeId, ...(ids.length ? { id: { notIn: ids } } : {}) },
    });
    for (let i = 0; i < items.length; i++) {
      const { id, ...rest } = items[i];
      await d.upsert({
        where: { id: String(id) },
        create: { id: String(id), resumeId, order: i, ...rest },
        update: { order: i, ...rest },
      });
    }
  });

  return { ok: true };
}

export async function saveFullResume(userId: string, resumeId: string, data: ResumeData) {
  await saveResumeSection(userId, resumeId, "personal", data.personal);
  await saveResumeSection(userId, resumeId, "summary", data.summary);
  const sections: (keyof ResumeData)[] = [
    "education", "experience", "projects", "skills", "certifications",
    "achievements", "internships", "languages", "interests", "customSections",
  ];
  for (const s of sections) {
    await saveResumeSection(userId, resumeId, s, data[s]);
  }
  await prisma.resume.updateMany({
    where: { id: resumeId, userId },
    data: { updatedAt: new Date() },
  });
  return { ok: true };
}
