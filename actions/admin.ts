"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function getAdminStats() {
  await requireAdmin();
  const [users, resumes, aiRequests, templates, sessions, recentRegistrations, templateUsage] =
    await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.aIRequest.count(),
      prisma.template.findMany({ orderBy: { name: "asc" } }),
      prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, name: true, email: true, image: true, createdAt: true, provider: true } }),
      prisma.resume.groupBy({ by: ["templateId"], _count: { _all: true }, orderBy: { _count: { templateId: "desc" } }, take: 10 }),
    ]);

  const templateUsageMap = new Map<string, number>();
  for (const u of templateUsage) {
    if (u.templateId) templateUsageMap.set(u.templateId, u._count._all);
  }

  const activeUsers = users - 0;
  void activeUsers;

  return {
    totalUsers: users,
    totalResumes: resumes,
    aiRequests: aiRequests,
    templates,
    activeSessions: sessions,
    recentRegistrations,
    templateUsage: templates.map((t) => ({ name: t.name, slug: t.slug, count: templateUsageMap.get(t.id) ?? 0, atsScore: t.atsScore, isActive: t.isActive })),
  };
}

export async function adminToggleTemplate(formData: FormData): Promise<void> {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const active = formData.get("isActive") === "true";
  await prisma.template.updateMany({ where: { slug }, data: { isActive: active } });
}

export async function adminSetUserDisabled(input: { userId: string; disabled: boolean }): Promise<void> {
  await requireAdmin();
  await prisma.user.updateMany({ where: { id: input.userId }, data: { isDisabled: input.disabled } });
}
