import "server-only";
import { prisma } from "@/lib/prisma";
import { rateLimitAI } from "@/lib/rate-limit";
import type { ResumeData } from "@/types";

export type AIFeature =
  | "summary"
  | "experience"
  | "internship"
  | "project"
  | "skills"
  | "ats"
  | "job-match"
  | "assistant";

function getConfig() {
  return {
    apiKey: process.env.AI_API_KEY,
    baseUrl: (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, ""),
    model: process.env.AI_MODEL ?? "gpt-4o-mini",
  };
}

export function isAIConfigured() {
  return Boolean(getConfig().apiKey);
}

export async function aiComplete(opts: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}) {
  const { apiKey, baseUrl, model } = getConfig();
  if (!apiKey) {
    throw new Error(
      "AI is not configured. Add AI_API_KEY to your environment variables."
    );
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 900,
      response_format: opts.json ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[ai] provider error", res.status, body.slice(0, 500));
    throw new Error(
      res.status === 401
        ? "AI provider authentication failed. Check AI_API_KEY."
        : res.status === 429
          ? "The AI provider is rate-limiting requests. Try again shortly."
          : "The AI provider returned an error. Try again."
    );
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("The AI provider returned an empty response.");
  return content.trim();
}

export async function aiCompleteWithTracking(
  userId: string,
  type: AIFeature,
  opts: Omit<Parameters<typeof aiComplete>[0], "json"> & { json?: boolean }
) {
  const rl = await rateLimitAI(userId);
  if (!rl.ok) throw new Error(rl.message);

  try {
    const result = await aiComplete(opts);
    await prisma.aIRequest.create({
      data: {
        userId,
        type,
        model: process.env.AI_MODEL ?? null,
        promptLength: opts.user.length,
        status: "SUCCESS",
      },
    });
    return result;
  } catch (err) {
    await prisma.aIRequest.create({
      data: {
        userId,
        type,
        model: process.env.AI_MODEL ?? null,
        promptLength: opts.user.length,
        status: "ERROR",
        error: err instanceof Error ? err.message.slice(0, 300) : "unknown",
      },
    });
    throw err;
  }
}

export function summarizeResume(data: ResumeData): string {
  const sections: string[] = [];
  if (data.personal.title) sections.push(`Title/Role: ${data.personal.title}`);
  if (data.summary) sections.push(`Current summary: ${data.summary}`);
  if (data.education.length) {
    sections.push(
      `Education: ${data.education
        .map((e) => [e.degree, e.field, e.school].filter(Boolean).join(" in "))
        .join("; ")}`
    );
  }
  if (data.experience.length) {
    sections.push(
      `Experience: ${data.experience
        .map((e) => `${e.role} at ${e.company}`)
        .join("; ")}`
    );
  }
  if (data.projects.length) {
    sections.push(
      `Projects: ${data.projects
        .map((p) => `${p.name} (${p.tech ?? "no tech listed"})`)
        .join("; ")}`
    );
  }
  if (data.skills.length) {
    sections.push(`Skills: ${data.skills.map((s) => s.name).join(", ")}`);
  }
  if (data.certifications.length) {
    sections.push(
      `Certifications: ${data.certifications.map((c) => c.name).join(", ")}`
    );
  }
  return sections.join("\n");
}

function bulletLines(bullets: string[] | undefined): string[] {
  return (bullets ?? [])
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => `• ${b}`);
}

function entryBlock(
  head: string,
  detail: string | undefined,
  bullets: string[] | undefined
): string {
  const parts = [head, detail?.trim(), ...bulletLines(bullets)].filter(Boolean);
  return parts.join("\n");
}

/**
 * Builds the user prompt for AI summary generation from the LIVE resume data
 * coming out of the Builder. Unlike `summarizeResume`, this includes the full
 * detail of each section — responsibilities, bullet points, achievements,
 * project descriptions, internships and custom sections — so the model can
 * produce a summary that is actually about the candidate's real experience.
 */
export function buildSummaryPrompt(data: ResumeData): string {
  const lines: string[] = [];

  const add = (label: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed) lines.push(`${label}:\n${trimmed}`);
  };

  add("Target / current job title", data.personal.title);

  if (data.summary.trim()) {
    add(
      "Existing summary (context only — improve it using the real details below, do not simply copy it)",
      data.summary
    );
  }

  if (data.experience.length) {
    const block = data.experience
      .filter((e) => e.role || e.company || e.description || e.bullets?.length)
      .map((e) => {
        const head = [
          e.role,
          e.company,
          e.location,
          [e.startDate, e.endDate].filter(Boolean).join(" – ") || (e.current ? "Present" : ""),
        ].filter(Boolean).join(", ");
        return entryBlock(head, e.description, e.bullets);
      })
      .filter(Boolean)
      .join("\n\n");
    add("Work experience (responsibilities and achievements)", block);
  }

  if (data.internships.length) {
    const block = data.internships
      .filter((i) => i.role || i.company || i.description || i.bullets?.length)
      .map((i) => {
        const head = [
          i.role,
          i.company,
          [i.startDate, i.endDate].filter(Boolean).join(" – ") || (i.current ? "Present" : ""),
        ].filter(Boolean).join(", ");
        return entryBlock(head, i.description, i.bullets);
      })
      .filter(Boolean)
      .join("\n\n");
    add("Internships", block);
  }

  if (data.projects.length) {
    const block = data.projects
      .filter((p) => p.name || p.description || p.bullets?.length)
      .map((p) => {
        const head = [p.name, p.link, p.tech].filter(Boolean).join(" · ");
        return entryBlock(head, p.description, p.bullets);
      })
      .filter(Boolean)
      .join("\n\n");
    add("Projects (what was built and with which technologies)", block);
  }

  if (data.skills.length) {
    add(
      "Skills",
      data.skills
        .map((s) => {
          const name = s.name.trim();
          if (!name) return "";
          return s.level ? `${name} (${s.level})` : name;
        })
        .filter(Boolean)
        .join(", ")
    );
  }

  if (data.education.length) {
    add(
      "Education",
      data.education
        .map((e) => [e.degree, e.field, e.school, e.grade].filter(Boolean).join(", "))
        .filter(Boolean)
        .join("\n")
    );
  }

  if (data.achievements.length) {
    add(
      "Achievements",
      data.achievements
        .map((a) => [a.title, a.detail, a.year].filter(Boolean).join(" — "))
        .join("\n")
    );
  }

  if (data.certifications.length) {
    add(
      "Certifications",
      data.certifications
        .map((c) => [c.name, c.issuer, c.year].filter(Boolean).join(" — "))
        .join("\n")
    );
  }

  if (data.languages.length) {
    add(
      "Languages",
      data.languages
        .map((l) => l.name + (l.level ? ` (${l.level})` : ""))
        .join(", ")
    );
  }

  if (data.customSections.length) {
    const block = data.customSections
      .filter((s) => s.title || s.items.length)
      .map(
        (s) =>
          `${s.title || "Additional section"}:\n${s.items
            .map((i) => `• ${i.title}${i.detail ? ` — ${i.detail}` : ""}`)
            .join("\n")}`
      )
      .join("\n\n");
    add("Additional sections", block);
  }

  return lines.join("\n\n");
}
