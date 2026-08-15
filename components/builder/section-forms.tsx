"use client";

import { Loader2, Wand2 } from "lucide-react";
import { TextRow, BulletEditor, ItemCard, ListSectionEditor, uid } from "./list-editor";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type {
  Achievement, Certification, Education, Experience, Internship, Interest, Language, Project,
} from "@/types";

export function EducationEditor({
  items,
  onChange,
}: {
  items: Education[];
  onChange: (items: Education[]) => void;
}) {
  const add = () =>
    onChange([
      ...items,
      { id: uid(), school: "", degree: "", field: "", startDate: "", endDate: "", grade: "", description: "", order: items.length },
    ]);
  const patch = (i: number, p: Partial<Education>) => {
    const next = [...items];
    next[i] = { ...next[i], ...p };
    onChange(next);
  };
  return (
    <ListSectionEditor title="Education" subtitle="Schools, degrees and the grades that matter." addLabel="Add education" onAdd={add} count={items.length}>
      {items.map((it, i) => (
        <ItemCard
          key={it.id}
          index={i}
          count={items.length}
          summary={`${it.degree || "Degree"} — ${it.school || "School"}`}
          onUpdate={() => onChange(items)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
          onMove={(dir) => move(items, i, dir, onChange)}
          accentDot="bg-blue-500"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextRow full label="School" value={it.school} onChange={(v) => patch(i, { school: v })} placeholder="University of Toronto" />
            <TextRow label="Degree" value={it.degree} onChange={(v) => patch(i, { degree: v })} placeholder="B.Sc." />
            <TextRow label="Field of study" value={it.field} onChange={(v) => patch(i, { field: v })} placeholder="Computer Science" />
            <TextRow label="Grade / GPA" value={it.grade} onChange={(v) => patch(i, { grade: v })} placeholder="3.8 / 4.0" />
            <TextRow label="Start" value={it.startDate} onChange={(v) => patch(i, { startDate: v })} placeholder="Sep 2020" />
            <TextRow label="End" value={it.endDate} onChange={(v) => patch(i, { endDate: v })} placeholder="May 2024" />
          </div>
          <TextRow label="Highlights" full rows={2} value={it.description} onChange={(v) => patch(i, { description: v })} placeholder="Relevant coursework, honors, thesis…" />
        </ItemCard>
      ))}
    </ListSectionEditor>
  );
}

export function ExperienceEditor({
  items,
  onChange,
  onRewriteBullet,
  aiBulletLoading,
}: {
  items: Experience[];
  onChange: (items: Experience[]) => void;
  onRewriteBullet?: (itemIndex: number, bulletIndex: number, bullet: string) => void;
  aiBulletLoading?: string | null;
}) {
  const add = () =>
    onChange([
      ...items,
      { id: uid(), company: "", role: "", location: "", startDate: "", endDate: "", current: false, description: "", bullets: [""], order: items.length },
    ]);
  const patch = (i: number, p: Partial<Experience>) => {
    const next = [...items];
    next[i] = { ...next[i], ...p };
    onChange(next);
  };
  return (
    <ListSectionEditor title="Work Experience" subtitle="Roles that shaped your career — lead with outcomes." addLabel="Add experience" onAdd={add} count={items.length}>
      {items.map((it, i) => (
        <ItemCard
          key={it.id}
          index={i}
          count={items.length}
          summary={`${it.role || "Role"} at ${it.company || "Company"}`}
          onUpdate={() => onChange(items)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
          onMove={(dir) => move(items, i, dir, onChange)}
          accentDot="bg-cyan-500"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextRow label="Company" value={it.company} onChange={(v) => patch(i, { company: v })} placeholder="Acme Corp" />
            <TextRow label="Role" value={it.role} onChange={(v) => patch(i, { role: v })} placeholder="Senior Developer" />
            <TextRow label="Location" value={it.location} onChange={(v) => patch(i, { location: v })} placeholder="Remote / Toronto" />
            <TextRow label="Start" value={it.startDate} onChange={(v) => patch(i, { startDate: v })} placeholder="Jan 2022" />
            <div className="flex items-end gap-3">
              <TextRow label="End" value={it.current ? "" : it.endDate} onChange={(v) => patch(i, { endDate: v })} placeholder="Present" />
              <label className="mb-2.5 flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Switch checked={it.current} onCheckedChange={(c) => patch(i, { current: c })} />
                Current
              </label>
            </div>
          </div>
          <TextRow label="Overview (optional)" full rows={2} value={it.description} onChange={(v) => patch(i, { description: v })} placeholder="A one-line summary of the role…" />
          <BulletEditor
            bullets={it.bullets}
            onChange={(b) => patch(i, { bullets: b })}
            onRewrite={onRewriteBullet ? (bi, b) => onRewriteBullet(i, bi, b) : undefined}
            aiBulletId={aiBulletLoading ?? null}
          />
        </ItemCard>
      ))}
    </ListSectionEditor>
  );
}

export function InternshipEditor({
  items,
  onChange,
  onRewriteBullet,
  aiBulletLoading,
}: {
  items: Internship[];
  onChange: (items: Internship[]) => void;
  onRewriteBullet?: (itemIndex: number, bulletIndex: number, bullet: string) => void;
  aiBulletLoading?: string | null;
}) {
  const add = () =>
    onChange([
      ...items,
      { id: uid(), company: "", role: "", startDate: "", endDate: "", current: false, description: "", bullets: [""], order: items.length },
    ]);
  const patch = (i: number, p: Partial<Internship>) => {
    const next = [...items];
    next[i] = { ...next[i], ...p };
    onChange(next);
  };
  return (
    <ListSectionEditor title="Internships" subtitle="Early momentum that shows you're ready to hit the ground running." addLabel="Add internship" onAdd={add} count={items.length}>
      {items.map((it, i) => (
        <ItemCard
          key={it.id}
          index={i}
          count={items.length}
          summary={`${it.role || "Role"} at ${it.company || "Company"}`}
          onUpdate={() => onChange(items)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
          onMove={(dir) => move(items, i, dir, onChange)}
          accentDot="bg-violet-500"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextRow label="Company" value={it.company} onChange={(v) => patch(i, { company: v })} placeholder="Acme Corp" />
            <TextRow label="Role" value={it.role} onChange={(v) => patch(i, { role: v })} placeholder="Software Intern" />
            <TextRow label="Start" value={it.startDate} onChange={(v) => patch(i, { startDate: v })} placeholder="May 2023" />
            <div className="flex items-end gap-3">
              <TextRow label="End" value={it.current ? "" : it.endDate} onChange={(v) => patch(i, { endDate: v })} placeholder="Aug 2023" />
              <label className="mb-2.5 flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Switch checked={it.current} onCheckedChange={(c) => patch(i, { current: c })} />
                Current
              </label>
            </div>
          </div>
          <TextRow label="Overview (optional)" full rows={2} value={it.description} onChange={(v) => patch(i, { description: v })} placeholder="A one-line summary of the internship…" />
          <BulletEditor
            bullets={it.bullets}
            onChange={(b) => patch(i, { bullets: b })}
            onRewrite={onRewriteBullet ? (bi, b) => onRewriteBullet(i, bi, b) : undefined}
            aiBulletId={aiBulletLoading ?? null}
          />
        </ItemCard>
      ))}
    </ListSectionEditor>
  );
}

export function ProjectEditor({
  items,
  onChange,
  onGenerate,
  generating,
  onRewriteBullet,
  aiBulletLoading,
}: {
  items: Project[];
  onChange: (items: Project[]) => void;
  onGenerate?: () => void;
  generating?: boolean;
  onRewriteBullet?: (itemIndex: number, bulletIndex: number, bullet: string) => void;
  aiBulletLoading?: string | null;
}) {
  const add = () =>
    onChange([
      ...items,
      { id: uid(), name: "", link: "", tech: "", startDate: "", endDate: "", description: "", bullets: [""], order: items.length },
    ]);
  const patch = (i: number, p: Partial<Project>) => {
    const next = [...items];
    next[i] = { ...next[i], ...p };
    onChange(next);
  };
  return (
    <ListSectionEditor
      title="Projects"
      subtitle="Real work that makes your skills concrete."
      addLabel="Add project"
      onAdd={add}
      count={items.length}
    >
      {onGenerate ? (
        <Button variant="secondary" className="w-full border border-blue-500/25 bg-blue-500/5 text-blue-600 hover:bg-blue-500/10 dark:text-blue-300" onClick={onGenerate} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-blue-500" />}
          {generating ? "Generating project…" : "Generate a project with AI"}
        </Button>
      ) : null}
      {items.map((it, i) => (
        <ItemCard
          key={it.id}
          index={i}
          count={items.length}
          summary={it.name || "Project"}
          onUpdate={() => onChange(items)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
          onMove={(dir) => move(items, i, dir, onChange)}
          accentDot="bg-purple-500"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextRow label="Name" value={it.name} onChange={(v) => patch(i, { name: v })} placeholder="Taskly — AI task manager" />
            <TextRow label="Link" value={it.link} onChange={(v) => patch(i, { link: v })} placeholder="github.com/you/taskly" />
            <TextRow label="Tech stack" value={it.tech} onChange={(v) => patch(i, { tech: v })} placeholder="React, Next.js, Postgres" />
            <TextRow label="Role / scope" value={it.description} onChange={(v) => patch(i, { description: v })} placeholder="Built solo in 3 weeks…" />
            <TextRow label="Start" value={it.startDate} onChange={(v) => patch(i, { startDate: v })} placeholder="Jan 2024" />
            <TextRow label="End" value={it.endDate} onChange={(v) => patch(i, { endDate: v })} placeholder="Apr 2024" />
          </div>
          <BulletEditor
            bullets={it.bullets}
            onChange={(b) => patch(i, { bullets: b })}
            onRewrite={onRewriteBullet ? (bi, b) => onRewriteBullet(i, bi, b) : undefined}
            aiBulletId={aiBulletLoading ?? null}
          />
        </ItemCard>
      ))}
    </ListSectionEditor>
  );
}

export function CertificationEditor({
  items,
  onChange,
}: {
  items: Certification[];
  onChange: (items: Certification[]) => void;
}) {
  const add = () =>
    onChange([...items, { id: uid(), name: "", issuer: "", year: "", url: "", order: items.length }]);
  const patch = (i: number, p: Partial<Certification>) => {
    const next = [...items];
    next[i] = { ...next[i], ...p };
    onChange(next);
  };
  return (
    <ListSectionEditor title="Certifications" subtitle="Credentials that back up your claims." addLabel="Add certification" onAdd={add} count={items.length}>
      {items.map((it, i) => (
        <ItemCard
          key={it.id}
          index={i}
          count={items.length}
          summary={it.name || "Certification"}
          onUpdate={() => onChange(items)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
          onMove={(dir) => move(items, i, dir, onChange)}
          accentDot="bg-emerald-500"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextRow label="Name" value={it.name} onChange={(v) => patch(i, { name: v })} placeholder="AWS Certified Developer" />
            <TextRow label="Issuer" value={it.issuer} onChange={(v) => patch(i, { issuer: v })} placeholder="Amazon Web Services" />
            <TextRow label="Year" value={it.year} onChange={(v) => patch(i, { year: v })} placeholder="2024" />
            <TextRow label="Credential URL" value={it.url} onChange={(v) => patch(i, { url: v })} placeholder="https://…" />
          </div>
        </ItemCard>
      ))}
    </ListSectionEditor>
  );
}

export function AchievementEditor({
  items,
  onChange,
}: {
  items: Achievement[];
  onChange: (items: Achievement[]) => void;
}) {
  const add = () =>
    onChange([...items, { id: uid(), title: "", detail: "", year: "", order: items.length }]);
  const patch = (i: number, p: Partial<Achievement>) => {
    const next = [...items];
    next[i] = { ...next[i], ...p };
    onChange(next);
  };
  return (
    <ListSectionEditor title="Achievements" subtitle="Awards and wins that make you memorable." addLabel="Add achievement" onAdd={add} count={items.length}>
      {items.map((it, i) => (
        <ItemCard
          key={it.id}
          index={i}
          count={items.length}
          summary={it.title || "Achievement"}
          onUpdate={() => onChange(items)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
          onMove={(dir) => move(items, i, dir, onChange)}
          accentDot="bg-amber-500"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextRow label="Title" value={it.title} onChange={(v) => patch(i, { title: v })} placeholder="Hackathon — Best Product" />
            <TextRow label="Year" value={it.year} onChange={(v) => patch(i, { year: v })} placeholder="2024" />
          </div>
          <TextRow label="Detail" full rows={2} value={it.detail} onChange={(v) => patch(i, { detail: v })} placeholder="What the achievement was and why it matters…" />
        </ItemCard>
      ))}
    </ListSectionEditor>
  );
}

export function LanguageEditor({
  items,
  onChange,
}: {
  items: Language[];
  onChange: (items: Language[]) => void;
}) {
  const add = () =>
    onChange([...items, { id: uid(), name: "", level: "Conversational", order: items.length }]);
  const patch = (i: number, p: Partial<Language>) => {
    const next = [...items];
    next[i] = { ...next[i], ...p };
    onChange(next);
  };
  return (
    <ListSectionEditor title="Languages" subtitle="Languages and how well you speak them." addLabel="Add language" onAdd={add} count={items.length}>
      {items.map((it, i) => (
        <ItemCard
          key={it.id}
          index={i}
          count={items.length}
          summary={it.name || "Language"}
          onUpdate={() => onChange(items)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
          onMove={(dir) => move(items, i, dir, onChange)}
          accentDot="bg-teal-500"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextRow label="Language" value={it.name} onChange={(v) => patch(i, { name: v })} placeholder="Spanish" />
            <TextRow label="Proficiency" value={it.level} onChange={(v) => patch(i, { level: v })} placeholder="Native / Fluent / Conversational" />
          </div>
        </ItemCard>
      ))}
    </ListSectionEditor>
  );
}

export function InterestEditor({
  items,
  onChange,
}: {
  items: Interest[];
  onChange: (items: Interest[]) => void;
}) {
  const add = () =>
    onChange([...items, { id: uid(), name: "", order: items.length }]);
  const patch = (i: number, p: Partial<Interest>) => {
    const next = [...items];
    next[i] = { ...next[i], ...p };
    onChange(next);
  };
  return (
    <ListSectionEditor title="Interests" subtitle="A few interests make you more than a list of skills." addLabel="Add interest" onAdd={add} count={items.length}>
      {items.map((it, i) => (
        <ItemCard
          key={it.id}
          index={i}
          count={items.length}
          summary={it.name || "Interest"}
          onUpdate={() => onChange(items)}
          onDelete={() => onChange(items.filter((_, idx) => idx !== i))}
          onMove={(dir) => move(items, i, dir, onChange)}
          accentDot="bg-pink-500"
        >
          <TextRow label="Interest" full value={it.name} onChange={(v) => patch(i, { name: v })} placeholder="Trail running, chess, indie games" />
        </ItemCard>
      ))}
    </ListSectionEditor>
  );
}

function move<T extends { order: number }>(items: T[], i: number, dir: -1 | 1, onChange: (items: T[]) => void) {
  const j = i + dir;
  if (j < 0 || j >= items.length) return;
  const next = [...items];
  const [item] = next.splice(i, 1);
  next.splice(j, 0, item);
  onChange(next);
}
