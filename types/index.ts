export type PersonalInfo = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
  photo: string;
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  grade: string;
  description: string;
  order: number;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bullets: string[];
  order: number;
};

export type Internship = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bullets: string[];
  order: number;
};

export type Project = {
  id: string;
  name: string;
  link: string;
  tech: string;
  startDate: string;
  endDate: string;
  description: string;
  bullets: string[];
  order: number;
};

export type Skill = {
  id: string;
  name: string;
  level: string;
  order: number;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url: string;
  order: number;
};

export type Achievement = {
  id: string;
  title: string;
  detail: string;
  year: string;
  order: number;
};

export type Language = {
  id: string;
  name: string;
  level: string;
  order: number;
};

export type Interest = {
  id: string;
  name: string;
  order: number;
};

export type CustomSectionItem = {
  title: string;
  detail: string;
};

export type CustomSection = {
  id: string;
  title: string;
  items: CustomSectionItem[];
  order: number;
};

export type ResumeData = {
  personal: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  achievements: Achievement[];
  internships: Internship[];
  languages: Language[];
  interests: Interest[];
  customSections: CustomSection[];
};

export type ResumeMeta = {
  id: string;
  title: string;
  templateSlug: string;
  atsScore: number | null;
  updatedAt: string;
  createdAt: string;
};

export type TemplateLayout = "classic" | "sidebar" | "split" | "modern";
export type TemplateHeaderStyle = "centered" | "left" | "banner" | "sidebar";

export type TemplateConfig = {
  slug: string;
  name: string;
  category: string;
  description: string;
  atsScore: number;
  accent: string;
  accentDark?: string;
  secondary?: string;
  background?: string;
  textColor?: string;
  font: string;
  layout: TemplateLayout;
  headerStyle: TemplateHeaderStyle;
  sectionStyle: "underline" | "line" | "badge" | "bar" | "none";
  showPhoto: boolean;
  monochrome: boolean;
  signature?: "gradient" | "solid" | "outline";
};

export type ATSScoreBreakdown = {
  keywords: number;
  sections: number;
  structure: number;
  content: number;
  formatting: number;
};

export type ATSAnalysisResult = {
  score: number;
  breakdown: ATSScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  missingKeywords: string[];
  sectionsFound: string[];
  sectionsMissing: string[];
};

export type JobMatchResult = {
  matchPercent: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordMatches: { keyword: string; present: boolean }[];
  matchedCount: number;
  totalCount: number;
  recommendations: string[];
};

export type ActionState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export type BuilderStep =
  | "personal"
  | "summary"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "certifications"
  | "achievements"
  | "internships"
  | "languages"
  | "interests"
  | "custom"
  | "review";
