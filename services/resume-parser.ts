import type { ResumeData } from "@/types";

const SECTION_HEADINGS = [
  /^\s*(summary|professional summary|profile|objective|about me|about)\s*$/i,
  /^\s*(education|academic background|academics)\s*$/i,
  /^\s*(experience|work experience|professional experience|employment|work history)\s*$/i,
  /^\s*(projects?|personal projects?|academic projects?)\s*$/i,
  /^\s*(skills|technical skills|core competencies|competencies|technologies)\s*$/i,
  /^\s*(certifications?|certificates?|licenses?)\s*$/i,
  /^\s*(achievements?|awards?|honors?|recognitions?)\s*$/i,
  /^\s*(internships?|internship experience)\s*$/i,
  /^\s*(languages?)\s*$/i,
  /^\s*(interests?|hobbies?)\s*$/i,
];

type ParsedSection = {
  name: string;
  lines: string[];
};

export function splitIntoSections(text: string): ParsedSection[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const sections: ParsedSection[] = [{ name: "header", lines: [] }];

  let current = sections[0];
  for (const line of lines) {
    if (!line) {
      current.lines.push("");
      continue;
    }
    const match = SECTION_HEADINGS.find((re) => re.test(line));
    if (match && sections.length < 20) {
      current = { name: line.toLowerCase(), lines: [] };
      sections.push(current);
    } else {
      current.lines.push(line);
    }
  }

  return sections.filter((s) => s.lines.join("").trim().length > 0);
}

export function buildResumeDataFromText(text: string): ResumeData {
  const sections = splitIntoSections(text);
  const byName = new Map<string, string[]>();

  for (const s of sections) {
    let key = s.name;
    if (/summary|profile|objective|about/.test(key)) key = "summary";
    else if (/education|academic/.test(key)) key = "education";
    else if (/experience|employment|work/.test(key) && !/intern/.test(key)) key = "experience";
    else if (/project/.test(key)) key = "projects";
    else if (/skill|competenc|technolog/.test(key)) key = "skills";
    else if (/certif|licen/.test(key)) key = "certifications";
    else if (/achiev|award|honor|recogni/.test(key)) key = "achievements";
    else if (/intern/.test(key)) key = "internships";
    else if (/language/.test(key)) key = "languages";
    else if (/interest|hobb/.test(key)) key = "interests";
    else key = "header";

    const existing = byName.get(key) ?? [];
    byName.set(key, [...existing, ...s.lines]);
  }

  const header = (byName.get("header") ?? []).join(" ").trim();
  const emailMatch = header.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = header.match(/(\+?\d[\d\s().-]{7,})/);
  const linkedinMatch = header.match(/linkedin\.com\/[^\s|,]+/i);

  const data: ResumeData = {
    personal: {
      fullName: header.split("|")[0]?.trim().split(/\s{2,}/)[0] ?? "",
      title: "",
      email: emailMatch?.[0] ?? "",
      phone: phoneMatch?.[1] ?? "",
      location: "",
      linkedin: linkedinMatch?.[0] ?? "",
      github: "",
      portfolio: "",
      website: "",
      photo: "",
    },
    summary: (byName.get("summary") ?? []).join(" ").slice(0, 2000),
    education: parseEducation(byName.get("education") ?? []),
    experience: parseEntries(byName.get("experience") ?? []).map((e, i) => ({
      id: crypto.randomUUID(),
      company: e.title,
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      bullets: e.bullets,
      order: i,
    })),
    projects: parseEntries(byName.get("projects") ?? []).map((p, i) => ({
      id: crypto.randomUUID(),
      name: p.title,
      link: "",
      tech: "",
      startDate: "",
      endDate: "",
      description: "",
      bullets: p.bullets,
      order: i,
    })),
    skills: (byName.get("skills") ?? [])
      .join(", ")
      .split(/[,•|·\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 60)
      .slice(0, 40)
      .map((s, i) => ({ id: crypto.randomUUID(), name: s, level: "", order: i })),
    certifications: (byName.get("certifications") ?? [])
      .slice(0, 15)
      .map((c, i) => ({ id: crypto.randomUUID(), name: c, issuer: "", year: "", url: "", order: i })),
    achievements: (byName.get("achievements") ?? [])
      .slice(0, 15)
      .map((a, i) => ({ id: crypto.randomUUID(), title: a, detail: "", year: "", order: i })),
    internships: (byName.get("internships") ?? []).map((_, i) => ({
      id: crypto.randomUUID(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      bullets: [],
      order: i,
    })),
    languages: (byName.get("languages") ?? [])
      .slice(0, 8)
      .map((l, i) => ({ id: crypto.randomUUID(), name: l, level: "", order: i })),
    interests: (byName.get("interests") ?? [])
      .join(", ")
      .split(/[,•|·\n]+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 10)
      .map((x, i) => ({ id: crypto.randomUUID(), name: x, order: i })),
    customSections: [],
  };

  return data;
}

function parseEducation(lines: string[]): ResumeData["education"] {
  const result: ResumeData["education"] = [];
  let school = "";
  let degree = "";
  for (const line of lines) {
    if (!line) continue;
    const degreeMatch = line.match(/(b\.?tech|m\.?tech|b\.?s\.?c|m\.?s\.?c|bachelor|master|ph\.?d|diploma|mba|b\.?e|b\.?a)/i);
    if (degreeMatch && !school) {
      degree = line;
      if (result.length && result[result.length - 1].school === "" ) {
        result[result.length - 1].degree = degree;
        continue;
      }
    }
    if (!degreeMatch) {
      school = line;
      result.push({ id: crypto.randomUUID(), school, degree: "", field: "", startDate: "", endDate: "", grade: "", description: "", order: result.length });
      continue;
    }
    if (result.length) result[result.length - 1].degree = degree;
  }
  return result;
}

function parseEntries(lines: string[]): { title: string; bullets: string[] }[] {
  const entries: { title: string; bullets: string[] }[] = [];
  let current: { title: string; bullets: string[] } | null = null;

  for (const line of lines) {
    if (!line) {
      if (current) entries.push(current);
      current = null;
      continue;
    }
    if (/^[-•·▪]/.test(line) || /^\d{1,2}[.)]/.test(line)) {
      if (current) current.bullets.push(line.replace(/^[-•·▪\s]*/, ""));
      continue;
    }
    if (!current) {
      current = { title: line, bullets: [] };
    } else {
      current.bullets.push(line);
    }
  }
  if (current) entries.push(current);
  return entries;
}
