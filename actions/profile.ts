"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { ActionState } from "@/types";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  title: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().max(30).optional().default(""),
  location: z.string().trim().max(120).optional().default(""),
  linkedin: z.string().trim().max(300).optional().default(""),
  github: z.string().trim().max(300).optional().default(""),
  portfolio: z.string().trim().max(300).optional().default(""),
  website: z.string().trim().max(300).optional().default(""),
  image: z.string().trim().max(2000).optional().default(""),
});

export async function updateProfileAction(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    phone: formData.get("phone"),
    location: formData.get("location"),
    linkedin: formData.get("linkedin"),
    github: formData.get("github"),
    portfolio: formData.get("portfolio"),
    website: formData.get("website"),
    image: formData.get("image"),
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  return { success: true, message: "Profile updated." };
}

const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notifyResumeTips: z.coerce.boolean(),
  notifyNewsletter: z.coerce.boolean(),
});

export async function updateSettingsAction(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };

  const parsed = settingsSchema.safeParse({
    theme: formData.get("theme"),
    notifyResumeTips: formData.get("notifyResumeTips"),
    notifyNewsletter: formData.get("notifyNewsletter"),
  });
  if (!parsed.success) return { error: "Invalid settings values." };

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { userId: user.id, ...parsed.data },
  });

  return { success: true, message: "Settings saved." };
}

export async function getSettings() {
  const user = await getCurrentUser();
  if (!user) return null;
  return prisma.userSettings.findUnique({ where: { userId: user.id } });
}
