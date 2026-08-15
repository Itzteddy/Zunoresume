import {
  User, FileText, GraduationCap, Briefcase, FolderGit2, Wrench,
  Award, Trophy, Layers, Languages, HeartHandshake, Puzzle, CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { BuilderStep } from "@/types";

export type StepDef = {
  id: BuilderStep;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  description: string;
};

export const STEPS: StepDef[] = [
  { id: "personal", label: "Personal Details", shortLabel: "Personal", icon: User, description: "Name, title and contact info." },
  { id: "summary", label: "Professional Summary", shortLabel: "Summary", icon: FileText, description: "A short pitch about who you are." },
  { id: "education", label: "Education", shortLabel: "Education", icon: GraduationCap, description: "Schools, degrees and grades." },
  { id: "experience", label: "Work Experience", shortLabel: "Experience", icon: Briefcase, description: "Your professional history." },
  { id: "projects", label: "Projects", shortLabel: "Projects", icon: FolderGit2, description: "Projects that show your skills." },
  { id: "skills", label: "Skills", shortLabel: "Skills", icon: Wrench, description: "Technical and soft skills." },
  { id: "certifications", label: "Certifications", shortLabel: "Certs", icon: Award, description: "Certificates and licenses." },
  { id: "achievements", label: "Achievements", shortLabel: "Achievements", icon: Trophy, description: "Awards and accomplishments." },
  { id: "internships", label: "Internships", shortLabel: "Internships", icon: Layers, description: "Internship experience." },
  { id: "languages", label: "Languages", shortLabel: "Languages", icon: Languages, description: "Languages you speak." },
  { id: "interests", label: "Interests", shortLabel: "Interests", icon: HeartHandshake, description: "Hobbies and interests." },
  { id: "custom", label: "Custom Sections", shortLabel: "Custom", icon: Puzzle, description: "Add your own sections." },
  { id: "review", label: "Review & Download", shortLabel: "Review", icon: CheckCircle2, description: "Check, analyze and export." },
];

export const STEP_LABELS: Record<BuilderStep, string> = Object.fromEntries(
  STEPS.map((s) => [s.id, s.label])
) as Record<BuilderStep, string>;

export function getStepDef(step: BuilderStep | string | undefined): StepDef {
  return STEPS.find((s) => s.id === step) ?? STEPS[0];
}

export function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isSectionFilled(section: string, value: unknown): boolean {
  return emptyCheck[section as keyof typeof emptyCheck]?.(value) ?? false;
}

const emptyCheck = {
  personal: (v: unknown) => Boolean((v as { fullName?: string })?.fullName),
  summary: (v: unknown) => Boolean(v),
  education: (v: unknown) => Array.isArray(v) && v.length > 0,
  experience: (v: unknown) => Array.isArray(v) && v.length > 0,
  projects: (v: unknown) => Array.isArray(v) && v.length > 0,
  skills: (v: unknown) => Array.isArray(v) && v.length > 0,
  certifications: (v: unknown) => Array.isArray(v) && v.length > 0,
  achievements: (v: unknown) => Array.isArray(v) && v.length > 0,
  internships: (v: unknown) => Array.isArray(v) && v.length > 0,
  languages: (v: unknown) => Array.isArray(v) && v.length > 0,
  interests: (v: unknown) => Array.isArray(v) && v.length > 0,
  custom: (v: unknown) => Array.isArray(v) && v.length > 0,
  review: () => true,
} as const;
