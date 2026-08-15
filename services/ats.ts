import "server-only";
import type { ResumeData, ATSAnalysisResult } from "@/types";

const ACTION_VERBS = [
  "built", "developed", "designed", "created", "led", "managed", "implemented",
  "engineered", "architected", "optimized", "improved", "reduced", "increased",
  "delivered", "launched", "shipped", "automated", "deployed", "refactored",
  "integrated", "collaborated", "analyzed", "researched", "mentored", "spearheaded",
  "orchestrated", "streamlined", "accelerated", "achieved", "drove", "scaled",
  "built", "configured", "debugged", "documented", "migrated", "monitored",
  "recommended", "resolved", "secured", "trained", "tested", "wrote", "contributed",
  "crafted", "founded", "coordinated", "established", "generated", "negotiated",
];

const QUANT_PATTERN = /\d+%|\$\s?\d+|\d+\s*(users|requests|queries|clients|students|items|rows|files|tasks|repos|issues|ms|sec|min|hours|days|screens|pages|APIs?|endpoints|deploys?|downloads?)/i;

const CORE_SECTIONS = [
  { key: "personal", label: "Contact information", weight: 15 },
  { key: "summary", label: "Professional summary", weight: 12 },
  { key: "education", label: "Education", weight: 12 },
  { key: "experience", label: "Work experience", weight: 20 },
  { key: "projects", label: "Projects", weight: 14 },
  { key: "skills", label: "Skills", weight: 15 },
  { key: "certifications", label: "Certifications", weight: 6 },
  { key: "languages", label: "Languages", weight: 6 },
] as const;

const ALL_SECTIONS = [...CORE_SECTIONS.map((s) => s.key), "achievements", "internships", "interests", "customSections"];

function hasData(data: ResumeData, key: string): boolean {
  switch (key) {
    case "personal": {
      const p = data.personal;
      return Boolean(
        p.fullName || p.email || p.phone || p.location || p.linkedin || p.github
      );
    }
    case "summary":
      return data.summary.trim().length >= 30;
    case "education":
      return data.education.length > 0;
    case "experience":
      return data.experience.length > 0;
    case "projects":
      return data.projects.length > 0;
    case "skills":
      return data.skills.length > 0;
    case "certifications":
      return data.certifications.length > 0;
    case "achievements":
      return data.achievements.length > 0;
    case "internships":
      return data.internships.length > 0;
    case "languages":
      return data.languages.length > 0;
    case "interests":
      return data.interests.length > 0;
    case "customSections":
      return data.customSections.length > 0;
    default:
      return false;
  }
}

function getContentText(data: ResumeData): string {
  const parts: string[] = [];
  parts.push(data.personal.title ?? "");
  parts.push(data.summary);
  for (const e of data.experience) parts.push(`${e.role} ${e.company} ${e.description} ${e.bullets.join(" ")}`);
  for (const i of data.internships) parts.push(`${i.role} ${i.company} ${i.description} ${i.bullets.join(" ")}`);
  for (const p of data.projects) parts.push(`${p.name} ${p.tech} ${p.description} ${p.bullets.join(" ")}`);
  for (const c of data.certifications) parts.push(c.name);
  for (const a of data.achievements) parts.push(`${a.title} ${a.detail}`);
  parts.push(data.skills.map((s) => s.name).join(" "));
  return parts.join(" ").toLowerCase();
}

export function analyzeATS(data: ResumeData): ATSAnalysisResult {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  const missingKeywords: string[] = [];
  const sectionsFound: string[] = [];
  const sectionsMissing: string[] = [];

  const breakdown = {
    keywords: 0,
    sections: 0,
    structure: 0,
    content: 0,
    formatting: 0,
  };

  // ---- Sections completeness (max 30) ----
  let sectionScore = 0;
  for (const s of CORE_SECTIONS) {
    if (hasData(data, s.key)) {
      sectionScore += s.weight;
      sectionsFound.push(s.label);
    } else {
      sectionsMissing.push(s.label);
      weaknesses.push(`${s.label} is missing.`);
    }
  }
  breakdown.sections = Math.min(30, sectionScore);

  // ---- Structure (max 20) ----
  let structureScore = 0;
  const personalFields = Object.values(data.personal).filter((v) => v && String(v).trim()).length;
  if (personalFields >= 4) structureScore += 6;
  else if (personalFields >= 2) structureScore += 3;
  if (data.skills.length > 0 && data.experience.length > 0) structureScore += 5;
  if (data.education.length > 0) structureScore += 4;
  if (data.projects.length > 0) structureScore += 5;
  breakdown.structure = structureScore;

  // ---- Content quality (max 30) ----
  let contentScore = 0;
  const allText = getContentText(data);
  const bullets = [
    ...data.experience.flatMap((e) => e.bullets),
    ...data.internships.flatMap((i) => i.bullets),
    ...data.projects.flatMap((p) => p.bullets),
  ];

  const verbCount = ACTION_VERBS.filter((v) => allText.includes(v)).length;
  if (data.summary.length >= 80) contentScore += 6;
  else if (data.summary.length >= 30) contentScore += 3;
  else if (data.summary.trim()) contentScore += 1;

  if (bullets.length >= 5) contentScore += 6;
  else if (bullets.length >= 2) contentScore += 3;

  if (verbCount >= 5) contentScore += 6;
  else if (verbCount >= 2) contentScore += 3;

  const quantified = bullets.filter((b) => QUANT_PATTERN.test(b)).length;
  if (quantified >= 3) contentScore += 7;
  else if (quantified >= 1) contentScore += 4;

  const hasBadBullets = bullets.some((b) => b.length < 12);
  if (hasBadBullets) {
    contentScore -= 2;
    weaknesses.push("Some bullet points are too short — expand them with more detail and impact.");
  }

  if (data.summary && data.summary.length < 80) {
    weaknesses.push("Your professional summary is short. Expand it to 2–3 compelling sentences.");
  }
  if (bullets.length < 5) {
    weaknesses.push("Add more achievement-oriented bullet points (aim for 3–5 per role).");
  }
  if (verbCount < 5) {
    recommendations.push("Start bullet points with strong action verbs (e.g., built, led, optimized).");
  }
  if (quantified < 3) {
    recommendations.push("Quantify achievements with numbers, percentages, or scale (e.g., \"reduced load time by 40%\").");
  }

  breakdown.content = Math.max(0, Math.min(30, contentScore));

  // ---- Formatting (max 10) ----
  let formatScore = 0;
  const email = data.personal.email.trim();
  const phone = data.personal.phone.trim();
  const linkedin = data.personal.linkedin.trim();
  const github = data.personal.github.trim();
  const portfolio = data.personal.portfolio.trim();

  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) formatScore += 3;
  else if (email) formatScore += 1;

  if (phone && /[\d]{7,}/.test(phone.replace(/\D/g, ""))) formatScore += 2;
  if (linkedin || github || portfolio) formatScore += 3;
  if (!email) {
    weaknesses.push("Add a professional email address.");
    recommendations.push("Add an email address to your contact section.");
  }
  if (!phone) {
    weaknesses.push("Phone number is missing.");
    recommendations.push("Add a phone number — most recruiters expect one.");
  }
  if (!linkedin && !github) {
    weaknesses.push("No LinkedIn or GitHub profile provided.");
    recommendations.push("Add at least a LinkedIn URL — recruiters verify candidates there.");
  }
  breakdown.formatting = formatScore;

  // ---- Keywords (max 10) ----
  const skillNames = data.skills.map((s) => s.name.toLowerCase().trim()).filter(Boolean);
  const roleKeywords = extractRoleKeywords(data);
  let keywordScore = 0;
  for (const kw of skillNames) {
    if (kw && kw.length > 2 && !allText.includes(kw)) missingKeywords.push(kw);
  }
  if (skillNames.length >= 6) keywordScore += 5;
  else if (skillNames.length >= 3) keywordScore += 3;
  else if (skillNames.length > 0) keywordScore += 1;
  if (roleKeywords.length >= 3) keywordScore += 5;
  else if (roleKeywords.length >= 1) keywordScore += 2;
  breakdown.keywords = keywordScore;

  if (skillNames.length === 0) {
    weaknesses.push("No skills listed.");
    recommendations.push("Add 6–10 relevant skills to match job descriptions.");
  }
  if (missingKeywords.length > 0) {
    recommendations.push(`Add these missing skill keywords: ${missingKeywords.slice(0, 6).join(", ")}.`);
  }

  const score = Math.round(
    breakdown.sections +
    breakdown.structure +
    breakdown.content +
    breakdown.formatting +
    breakdown.keywords
  );

  if (score >= 85) strengths.push("Excellent overall structure — your resume is well organized.");
  if (sectionScore >= 25) strengths.push("Strong section coverage across your resume.");
  if (contentScore >= 20) strengths.push("Great use of achievement-focused, quantified content.");
  if (formatScore >= 7) strengths.push("Your contact information is complete and recruiter-ready.");
  if (strengths.length === 0) strengths.push("You have a solid foundation — follow the recommendations to strengthen it.");

  return {
    score,
    breakdown,
    strengths,
    weaknesses: weaknesses.slice(0, 6),
    recommendations: recommendations.slice(0, 6),
    missingKeywords: missingKeywords.slice(0, 12),
    sectionsFound,
    sectionsMissing,
  };
}

function extractRoleKeywords(data: ResumeData): string[] {
  const text = [
    data.personal.title ?? "",
    data.summary,
    data.experience.map((e) => e.role).join(" "),
  ]
    .join(" ")
    .toLowerCase();
  const known = [
    "engineer", "developer", "designer", "scientist", "analyst", "manager",
    "architect", "frontend", "backend", "full-stack", "fullstack", "software",
    "data", "machine learning", "ml", "ai", "cloud", "devops", "security",
    "product", "intern", "internship", "researcher", "consultant",
  ];
  return known.filter((k) => text.includes(k));
}
