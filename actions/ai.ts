"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  aiCompleteWithTracking,
  buildSummaryPrompt,
  isAIConfigured,
  summarizeResume,
} from "@/services/ai";
import { analyzeATS } from "@/services/ats";
import { matchResumeToJob } from "@/services/job-match";
import { getResume, updateResumeMeta } from "@/services/resume";
import { getTemplate } from "@/lib/templates";
import type { ActionState, ResumeData } from "@/types";

type AIResult = ActionState & { data?: unknown };

function requireAi() {
  if (!isAIConfigured()) {
    throw new Error(
      "AI is not configured on this deployment. Add AI_API_KEY to your environment variables."
    );
  }
}

export async function generateSummaryAction(input: {
  resumeId: string;
  tone?: "concise" | "professional" | "ats" | "recruiter";
  data: ResumeData;
}): Promise<AIResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  try {
    requireAi();
    // Verify ownership server-side. The prompt itself is built from the LIVE
    // Builder state (`input.data`) so Gemini always sees the user's latest
    // information, even if the debounced autosave has not flushed to the DB yet.
    const resume = await getResume(user.id, input.resumeId);
    if (!resume) return { error: "Resume not found." };

    const tone = input.tone ?? "professional";
    const toneGuide: Record<string, string> = {
      concise: "Keep it tight — exactly 2 concise sentences.",
      professional: "Write in a polished, professional tone.",
      ats: "Optimize for ATS parsing: weave in the candidate's own relevant keywords and standard job titles.",
      recruiter: "Write for a recruiter: lead with the candidate's strongest selling point drawn from their real experience.",
    };

    const system = `You are an expert resume writer and ATS optimization consultant. Write a professional summary for the candidate's resume based ONLY on the candidate's real information provided below.

Rules:
- Write 2 to 4 professional sentences. Always at least 2 meaningful sentences, never more than 4. Never return a single one-line summary.
- Ground every sentence in the candidate's actual job titles, responsibilities, skills, projects, achievements, education, and target role that were provided.
- Tailor the wording to the candidate's target/current job title and emphasize the skills and experience most relevant to that role.
- Highlight relevant skills, responsibilities, and any measurable achievements that were actually provided, using ATS-friendly wording and the candidate's own keywords.
- NEVER invent facts: do not add companies, employers, years of experience, metrics, technologies, degrees, certifications, or accomplishments that were not provided. Omit anything that is missing.
- If very little information was provided, still write at least 2 meaningful, honest sentences using only what is given.
- Write natural, flowing sentences — do not insert artificial line breaks.
- Output ONLY the summary text: no labels, no bullet points, no quotation marks, no preamble. ${toneGuide[tone] ?? ""}`;

    const result = await aiCompleteWithTracking(user.id, "summary", {
      system,
      user: buildSummaryPrompt(input.data),
      // Gemini's OpenAI-compatible endpoint counts internal thinking tokens
      // against max_tokens; a budget of ~1024 leaves room for a full 2-4
      // sentence summary without being truncated to a one-liner.
      maxTokens: 1024,
      temperature: 0.7,
    });
    return { success: true, data: result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "AI generation failed." };
  }
}

export async function rewriteContentAction(input: {
  resumeId: string;
  kind: "experience" | "internship" | "project";
  item: Record<string, unknown>;
  mode?: "improve" | "ats" | "concise" | "bullets";
}): Promise<AIResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  try {
    requireAi();
    const resume = await getResume(user.id, input.resumeId);
    if (!resume) return { error: "Resume not found." };

    const mode = input.mode ?? "improve";
    const instructions: Record<string, string> = {
      improve: "Rewrite into professional, achievement-oriented language using strong action verbs. Encourage measurable impact where the information allows. Do NOT invent facts.",
      ats: "Rewrite to be ATS-friendly with standard role vocabulary and relevant keywords. Do NOT invent facts.",
      concise: "Rewrite to be concise and punchy while keeping all facts.",
      bullets: "Output 2-4 bullet points, each on its own line, starting with action verbs. Do NOT invent facts.",
    };

    const itemText = Object.entries(input.item)
      .filter(([k]) => !["id", "order"].includes(k))
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join("; ") : v}`)
      .join("\n");

    const system = `You are an expert resume coach for ${input.kind === "project" ? "project descriptions" : input.kind === "internship" ? "internships" : "work experience"}. ${instructions[mode] ?? instructions.improve}. Output only the rewritten content.`;
    const result = await aiCompleteWithTracking(user.id, "experience", {
      system,
      user: `Candidate's current entry:\n${itemText}\n\nTheir resume skills: ${resume.data.skills.map((s) => s.name).join(", ")}`,
      maxTokens: 400,
      temperature: 0.7,
    });
    return { success: true, data: result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "AI generation failed." };
  }
}

export async function generateProjectAction(input: {
  resumeId: string;
  name: string;
  tech: string;
  description: string;
}): Promise<AIResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  try {
    requireAi();
    const resume = await getResume(user.id, input.resumeId);
    if (!resume) return { error: "Resume not found." };

    const system = `You are an expert resume project-description writer. Based ONLY on the project name, technology, and short description provided by the candidate, produce a professional project description with 2-4 bullet points and technical impact. Use action verbs. Do not invent achievements or metrics that the candidate did not mention. Format the response as JSON with this exact shape: {"description": "...", "bullets": ["...", "..."]}.`;
    const result = await aiCompleteWithTracking(user.id, "project", {
      system,
      user: `Project name: ${input.name}\nTechnology: ${input.tech}\nCandidate's short description: ${input.description}`,
      json: true,
      maxTokens: 500,
      temperature: 0.6,
    });
    let parsed: { description?: string; bullets?: string[] };
    try {
      parsed = JSON.parse(result);
    } catch {
      return { error: "AI returned invalid output. Try again." };
    }
    return { success: true, data: parsed };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "AI generation failed." };
  }
}

export async function suggestSkillsAction(input: {
  resumeId: string;
  role?: string;
}): Promise<AIResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  try {
    requireAi();
    const resume = await getResume(user.id, input.resumeId);
    if (!resume) return { error: "Resume not found." };

    const existing = resume.data.skills.map((s) => s.name).join(", ");
    const role = input.role ?? resume.data.personal.title ?? "the candidate's target role";

    const system = `You are a resume skills specialist. Suggest a JSON array of skill names (strings) relevant to the role "${role}", including technical skills, tools, frameworks, and a few soft skills. Exclude skills already on the resume. Do not invent — only list well-known skills. Output ONLY JSON: ["skill1", "skill2"].`;
    const result = await aiCompleteWithTracking(user.id, "skills", {
      system,
      user: `Role: ${role}\nExisting skills: ${existing}\nEducation: ${resume.data.education.map((e) => e.degree + " " + e.field).join("; ")}`,
      json: true,
      maxTokens: 300,
      temperature: 0.5,
    });
    let parsed: string[];
    try {
      parsed = JSON.parse(result);
      if (!Array.isArray(parsed)) throw new Error();
    } catch {
      return { error: "AI returned invalid output. Try again." };
    }
    return { success: true, data: parsed.slice(0, 25) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "AI generation failed." };
  }
}

export async function analyzeAtsAction(input: {
  resumeId: string;
}): Promise<AIResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  try {
    const resume = await getResume(user.id, input.resumeId);
    if (!resume) return { error: "Resume not found." };

    const analysis = analyzeATS(resume.data);

    await prisma.aTSAnalysis.create({
      data: {
        resumeId: input.resumeId,
        score: analysis.score,
        breakdown: analysis.breakdown as object,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        missingKeywords: analysis.missingKeywords,
      },
    });
    await updateResumeMeta(user.id, input.resumeId, { atsScore: analysis.score });

    return { success: true, data: analysis };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "ATS analysis failed." };
  }
}

export async function jobMatchAction(input: {
  resumeId: string;
  jobDescription: string;
}): Promise<AIResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  try {
    const resume = await getResume(user.id, input.resumeId);
    if (!resume) return { error: "Resume not found." };

    const result = matchResumeToJob(resume.data, input.jobDescription);

    await prisma.jobMatch.create({
      data: {
        resumeId: input.resumeId,
        jobDescription: input.jobDescription.slice(0, 8000),
        matchPercent: result.matchPercent,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        keywordMatches: result.keywordMatches,
        recommendations: result.recommendations,
      },
    });

    return { success: true, data: result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Job matching failed." };
  }
}

export async function optimizeResumeForJobAction(input: {
  resumeId: string;
  jobDescription: string;
}): Promise<AIResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  try {
    requireAi();
    const resume = await getResume(user.id, input.resumeId);
    if (!resume) return { error: "Resume not found." };

    const system = `You are an ATS optimization expert. Analyze the candidate's resume against the job description. Provide suggestions that use ONLY the candidate's real experience — never invent jobs, skills, or achievements. Return JSON with this shape: {"summarySuggestion": "rewritten summary (or '' if none)", "skillSuggestions": ["skills to highlight"], "bulletSuggestions": [{"section": "experience|projects", "index": 0, "text": "rewritten bullet using only existing facts"}]}.`;
    const result = await aiCompleteWithTracking(user.id, "assistant", {
      system,
      user: `RESUME:\n${summarizeResume(resume.data)}\n\nJOB DESCRIPTION:\n${input.jobDescription.slice(0, 8000)}`,
      json: true,
      maxTokens: 900,
      temperature: 0.5,
    });
    let parsed: unknown;
    try {
      parsed = JSON.parse(result);
    } catch {
      return { error: "AI returned invalid output. Try again." };
    }
    return { success: true, data: parsed };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Optimization failed." };
  }
}

export async function assistantAction(input: {
  resumeId: string;
  question: string;
}): Promise<AIResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  try {
    requireAi();
    const resume = await getResume(user.id, input.resumeId);
    if (!resume) return { error: "Resume not found." };

    const system = `You are Zuno's AI resume assistant, embedded in the resume builder. You have access to the candidate's current resume data. Answer their question with concrete, honest advice. Never invent facts about the candidate; if data is missing, suggest what to add. Keep answers concise and actionable (under ~250 words).`;
    const result = await aiCompleteWithTracking(user.id, "assistant", {
      system,
      user: `RESUME CONTEXT:\n${summarizeResume(resume.data)}\n\nQUESTION: ${input.question.slice(0, 1000)}`,
      maxTokens: 500,
      temperature: 0.5,
    });
    return { success: true, data: result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "AI request failed." };
  }
}

export async function analyzeTextAction(input: {
  text: string;
}): Promise<AIResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated." };
  try {
    requireAi();
    const system = `You are an ATS expert. Analyze the provided resume text. Return JSON: {"score": 0-100, "strengths": ["..."], "weaknesses": ["..."], "recommendations": ["..."], "missingKeywords": ["..."]}. Be specific and honest.`;
    const result = await aiCompleteWithTracking(user.id, "ats", {
      system,
      user: input.text.slice(0, 12000),
      json: true,
      maxTokens: 600,
      temperature: 0.4,
    });
    let parsed: unknown;
    try {
      parsed = JSON.parse(result);
    } catch {
      return { error: "AI returned invalid output. Try again." };
    }
    return { success: true, data: parsed };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "AI analysis failed." };
  }
}

export async function getTemplateInfoAction(slug: string) {
  return getTemplate(slug);
}
