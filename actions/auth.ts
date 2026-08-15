"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  destroyAllUserSessions,
} from "@/lib/auth/session";
import { getCurrentUser, getClientIp, isAdminEmail } from "@/lib/auth";
import { emailVerifyToken, passwordResetToken, verifyToken } from "@/lib/auth/tokens";
import { rateLimitAuth } from "@/lib/rate-limit";
import { safeInternalPath } from "@/lib/utils";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/services/email";
import type { ActionState } from "@/types";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[a-zA-Z]/, "Include at least one letter.")
    .regex(/[0-9]/, "Include at least one number.")
    .max(200),
});

const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Password is required."),
  remember: z.coerce.boolean().optional().default(false),
});

export async function registerAction(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const rl = rateLimitAuth(formData.get("email") as string);
  if (!rl.ok) return { error: "Too many attempts. Try again in a minute." };

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists. Try logging in instead." };
  }

  const passwordHash = await hash(password, 12);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        provider: "CREDENTIALS",
        role: isAdminEmail(email) ? "ADMIN" : "USER",
        emailVerified: null,
      },
    });
  } catch (err) {
    return { error: "Could not create your account. Please try again." };
  }

  const verifyTokenValue = await emailVerifyToken(user.id);
  await sendVerificationEmail(email, verifyTokenValue);

  await createSession({ userId: user.id, remember: true, ip: await getClientIp() });

  const next = safeInternalPath(formData.get("next") as string);
  redirect(next ?? "/dashboard?welcome=1");
}

export async function loginAction(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const email = (formData.get("email") as string) ?? "";
  const rl = rateLimitAuth(email);
  if (!rl.ok) return { error: "Too many attempts. Try again in a minute." };

  const parsed = loginSchema.safeParse({
    email,
    password: formData.get("password"),
    remember: formData.get("remember"),
  });
  if (!parsed.success) {
    return { error: "Please enter a valid email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { accounts: true },
  });

  const invalid = () => ({ error: "Invalid email or password." });

  if (!user || !user.passwordHash) return invalid();
  if (user.isDisabled) return { error: "This account has been disabled." };

  const match = await compare(parsed.data.password, user.passwordHash);
  if (!match) return invalid();

  await createSession({
    userId: user.id,
    remember: parsed.data.remember,
    ip: await getClientIp(),
  });

  const next = safeInternalPath(formData.get("next") as string);
  redirect(next ?? "/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function logoutAllDevicesAction() {
  const user = await getCurrentUser();
  if (!user) return;
  await destroyAllUserSessions(user.id);
  redirect("/login");
}

export async function forgotPasswordAction(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.email().safeParse(email).success) {
    return { error: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    if (user.provider === "GOOGLE") {
      return { error: "This account uses Google sign-in and has no password." };
    }
    const token = await passwordResetToken(user.id);
    await sendPasswordResetEmail(email, token);
  }

  return { success: true, message: "If an account exists, a reset link has been sent to that email." };
}

export async function resetPasswordAction(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { error: "Password must be at least 8 characters with letters and numbers." };
  }
  if (password !== confirm) return { error: "Passwords do not match." };

  const payload = await verifyToken<{ sub?: string; purpose?: string }>(token);
  if (!payload?.sub || payload.purpose !== "password-reset") {
    return { error: "This reset link is invalid or has expired." };
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return { error: "This reset link is invalid." };

  const passwordHash = await hash(password, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await prisma.session.deleteMany({ where: { userId: user.id } });

  return { success: true, message: "Your password has been reset. You can now log in." };
}

export async function verifyEmailAction(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  const payload = await verifyToken<{ sub?: string; purpose?: string }>(token);
  if (!payload?.sub || payload.purpose !== "email-verify") {
    return { error: "This verification link is invalid or has expired." };
  }

  await prisma.user.updateMany({
    where: { id: payload.sub },
    data: { emailVerified: new Date() },
  });

  return { success: true, message: "Your email has been verified. You're all set!" };
}

export async function resendVerificationAction(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };
  const token = await emailVerifyToken(user.id);
  await sendVerificationEmail(user.email, token);
  return { success: true, message: "Verification email sent. Check your inbox." };
}

export async function changePasswordAction(prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true, provider: true },
  });
  if (!dbUser) return { error: "Account not found." };
  if (dbUser.provider === "GOOGLE" && !dbUser.passwordHash) {
    return { error: "Your Google account has no password set." };
  }

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("new") ?? "");

  if (dbUser.passwordHash) {
    const match = await compare(current, dbUser.passwordHash);
    if (!match) return { error: "Your current password is incorrect." };
  }
  if (next.length < 8 || !/[a-zA-Z]/.test(next) || !/[0-9]/.test(next)) {
    return { error: "New password must be at least 8 characters with letters and numbers." };
  }

  const passwordHash = await hash(next, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true, message: "Password updated successfully." };
}

export async function deleteAccountAction(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };

  await prisma.user.delete({ where: { id: user.id } });
  await destroySession();
  redirect("/");
}
