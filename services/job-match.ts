import "server-only";
import type { ResumeData, JobMatchResult } from "@/types";

const TECH_TERMS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang",
  "rust", "ruby", "php", "swift", "kotlin", "sql", "postgresql", "mysql",
  "mongodb", "redis", "graphql", "rest", "api", "react", "next.js", "nextjs",
  "vue", "angular", "svelte", "node.js", "nodejs", "express", "django", "flask",
  "spring", "laravel", "rails", "html", "css", "tailwind", "bootstrap",
  "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ci/cd",
  "jenkins", "git", "github", "linux", "bash", "shell", "nginx", "serverless",
  "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
  "numpy", "pandas", "scikit-learn", "opencv", "nlp", "llm", "genai",
  "data science", "data analysis", "data analytics", "data engineering",
  "tableau", "power bi", "excel", "spark", "hadoop", "kafka", "airflow",
  "cybersecurity", "penetration testing", "network security", "firewall",
  "linux security", "information security", "encryption", "oauth",
  "frontend", "backend", "full-stack", "fullstack", "devops", "sre",
  "agile", "scrum", "kanban", "jira", "product management", "leadership",
  "communication", "teamwork", "collaboration", "problem-solving",
  "time management", "critical thinking", "project management",
  "matlab", "r", "tableau", "saas", "microservices", "system design",
  "object-oriented", "oop", "unit testing", "jest", "cypress", "selenium",
  "figma", "ui/ux", "wireframing", "prototyping", "analytics",
];

export function matchResumeToJob(data: ResumeData, jobDescription: string): JobMatchResult {
  const jd = jobDescription.toLowerCase();
  const resumeText = buildResumeText(data).toLowerCase();
  const resumeSkills = new Set(data.skills.map((s) => s.name.toLowerCase().trim()).filter(Boolean));

  const keywordMatches = TECH_TERMS.map((keyword) => ({
    keyword,
    present: jd.includes(keyword),
  }));

  const jdKeywords = keywordMatches.filter((k) => k.present).map((k) => k.keyword);
  if (jdKeywords.length === 0) {
    const words = jd.split(/\s+/).filter((w) => w.length > 3);
    const counts = new Map<string, number>();
    for (const w of words) {
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([w]) => w);
    jdKeywords.push(...top);
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const kw of jdKeywords) {
    const presentInResume =
      resumeText.includes(kw) || (resumeSkills.has(kw) && resumeSkills.has(kw));
    if (presentInResume) matchedSkills.push(kw);
    else missingSkills.push(kw);
  }

  const all = [...new Set([...jdKeywords, ...resumeSkills])];
  const matched = matchedSkills.length;
  const total = all.length;
  const matchPercent = total === 0 ? 0 : Math.round((matched / total) * 100);

  const recommendations: string[] = [];
  if (missingSkills.length > 0) {
    recommendations.push(
      `Highlight these skills from the job description: ${missingSkills.slice(0, 8).join(", ")}.`
    );
  }
  if (data.experience.length === 0) {
    recommendations.push("Add relevant work experience or internships to strengthen the match.");
  }
  if (!data.summary || data.summary.length < 60) {
    recommendations.push("Write a summary that mirrors keywords from the target job description.");
  }
  if (matchPercent >= 70) {
    recommendations.push("Strong overall match — tailor the summary and a few bullets to this specific job.");
  } else if (matchPercent >= 40) {
    recommendations.push("Moderate match — weave missing keywords naturally into your summary and bullet points.");
  } else {
    recommendations.push("Weak match — consider targeting a role that better fits your current skill set, or add relevant projects/skills.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Add the skills and technologies mentioned in the job description to your resume.");
  }

  return {
    matchPercent,
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)],
    keywordMatches,
    matchedCount: matchedSkills.length,
    totalCount: all.length,
    recommendations,
  };
}

function buildResumeText(data: ResumeData): string {
  const parts: string[] = [];
  parts.push(data.personal.title ?? "", data.summary);
  for (const e of data.experience) parts.push(`${e.role} ${e.company} ${e.description} ${e.bullets.join(" ")}`);
  for (const i of data.internships) parts.push(`${i.role} ${i.company} ${i.description} ${i.bullets.join(" ")}`);
  for (const p of data.projects) parts.push(`${p.name} ${p.tech} ${p.description} ${p.bullets.join(" ")}`);
  for (const c of data.certifications) parts.push(c.name);
  parts.push(data.skills.map((s) => s.name).join(" "));
  return parts.join(" ");
}
