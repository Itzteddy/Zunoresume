import type { ResumeData, TemplateConfig, Experience, Project, Education } from "@/types";
import { FONT_STACKS } from "@/lib/templates";
import {
  Mail, Phone, MapPin, Globe, FileText, Award, CheckCircle2,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { getSampleResume } from "@/components/resume/sample-data";

type Props = {
  data: ResumeData;
  template: TemplateConfig;
};

export function ResumePreview({ data, template }: Props) {
  const font = FONT_STACKS[template.font] ?? FONT_STACKS.sans;
  const accent = template.accent;
  const text = template.textColor ?? "#1c2333";

  const hasContact = Boolean(
    data.personal.email || data.personal.phone || data.personal.location ||
    data.personal.linkedin || data.personal.github || data.personal.portfolio
  );

  return (
    <div
      className="resume-sheet flex flex-col overflow-hidden"
      style={{ fontFamily: font, color: text, maxWidth: "210mm" }}
    >
      <Header data={data} template={template} />
      <div className="flex flex-1" style={{ padding: "0 12mm 10mm" }}>
        {template.layout === "sidebar" ? (
          <SidebarLayout data={data} template={template} font={font} accent={accent} hasContact={hasContact} />
        ) : template.layout === "split" ? (
          <SplitLayout data={data} template={template} font={font} accent={accent} hasContact={hasContact} />
        ) : (
          <ClassicLayout data={data} template={template} font={font} accent={accent} hasContact={hasContact} />
        )}
      </div>
    </div>
  );
}

function Header({ data, template }: Props) {
  const accent = template.accent;
  const text = template.textColor ?? "#1c2333";
  const isDarkHeader = template.headerStyle === "banner";

  const name = data.personal.fullName || "Your Name";
  const title = data.personal.title;

  const contactItems = [
    data.personal.email && { icon: Mail, value: data.personal.email, href: `mailto:${data.personal.email}` },
    data.personal.phone && { icon: Phone, value: data.personal.phone, href: `tel:${data.personal.phone}` },
    data.personal.location && { icon: MapPin, value: data.personal.location, href: "" },
    data.personal.linkedin && { icon: LinkedinIcon, value: strip(data.personal.linkedin), href: withProto(data.personal.linkedin) },
    data.personal.github && { icon: GithubIcon, value: strip(data.personal.github), href: withProto(data.personal.github) },
    data.personal.portfolio && { icon: Globe, value: strip(data.personal.portfolio), href: withProto(data.personal.portfolio) },
    data.personal.website && { icon: Globe, value: strip(data.personal.website), href: withProto(data.personal.website) },
  ].filter((c): c is { icon: typeof Mail; value: string; href: string } => Boolean(c));

  if (template.headerStyle === "banner") {
    return (
      <div
        className="relative flex flex-col items-center px-10 py-8 text-center"
        style={{
          background: `linear-gradient(120deg, ${accent} 0%, ${template.accentDark ?? accent} 100%)`,
          color: "#ffffff",
        }}
      >
        {template.showPhoto && data.personal.photo && (
          <img
            src={data.personal.photo}
            alt="profile"
            className="mb-3 h-20 w-20 rounded-full object-cover"
            style={{ border: "3px solid rgba(255,255,255,0.6)" }}
          />
        )}
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>{name}</h1>
        {title && <p style={{ fontSize: 13, opacity: 0.92, fontWeight: 500, marginTop: 3 }}>{title}</p>}
        {contactItems.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1" style={{ fontSize: 9.5 }}>
            {contactItems.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                <c.icon style={{ width: 10, height: 10 }} />
                {c.value}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // centered / left / sidebar headers are non-banner
  const align = template.headerStyle === "centered" ? "center" : "left";
  return (
    <div className="px-10 pb-4 pt-8" style={{ textAlign: align }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: text }}>{name}</h1>
      {title && (
        <p style={{ fontSize: 13, fontWeight: 600, color: accent, marginTop: 2 }}>{title}</p>
      )}
      {contactItems.length > 0 && (
        <div
          className="mt-2 flex flex-wrap gap-x-4 gap-y-1"
          style={{ fontSize: 9.5, justifyContent: align === "center" ? "center" : undefined }}
        >
          {contactItems.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              <c.icon style={{ width: 10, height: 10 }} />
              {c.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarLayout({ data, template, font, accent, hasContact }: Props & { font: string; accent: string; hasContact: boolean }) {
  const sidebarBg = template.monochrome ? "#f4f5f7" : "#f0f5ff";
  return (
    <>
      <div className="w-[34%] shrink-0 p-4" style={{ background: sidebarBg, color: template.textColor ?? "#1c2333" }}>
        {hasContact && (
          <SidebarBlock title="Contact" accent={accent} font={font}>
            {[
              data.personal.email && { icon: Mail, v: data.personal.email },
              data.personal.phone && { icon: Phone, v: data.personal.phone },
              data.personal.location && { icon: MapPin, v: data.personal.location },
              data.personal.linkedin && { icon: LinkedinIcon, v: strip(data.personal.linkedin) },
              data.personal.github && { icon: GithubIcon, v: strip(data.personal.github) },
              data.personal.portfolio && { icon: Globe, v: strip(data.personal.portfolio) },
            ].filter(Boolean).map((row: any, i) => (
              <div key={i} className="mb-1 flex items-start gap-1.5" style={{ fontSize: 8.5 }}>
                <row.icon style={{ width: 9, height: 9, marginTop: 1, color: accent }} />
                <span>{row.v}</span>
              </div>
            ))}
          </SidebarBlock>
        )}
        {data.skills.length > 0 && (
          <SidebarBlock title="Skills" accent={accent} font={font}>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((s) => (
                <span key={s.id} className="rounded px-1.5 py-0.5" style={{ fontSize: 8, background: "#ffffff", border: "1px solid #e5e9f0" }}>
                  {s.name}
                </span>
              ))}
            </div>
          </SidebarBlock>
        )}
        {data.languages.length > 0 && (
          <SidebarBlock title="Languages" accent={accent} font={font}>
            {data.languages.map((l) => (
              <div key={l.id} className="flex justify-between" style={{ fontSize: 8.5 }}>
                <span>{l.name}</span>
                {l.level && <span style={{ color: "#64748b" }}>{l.level}</span>}
              </div>
            ))}
          </SidebarBlock>
        )}
        {data.certifications.length > 0 && (
          <SidebarBlock title="Certifications" accent={accent} font={font}>
            {data.certifications.map((c) => (
              <div key={c.id} style={{ fontSize: 8.5, lineHeight: 1.35 }}>{c.name}</div>
            ))}
          </SidebarBlock>
        )}
        {data.interests.length > 0 && (
          <SidebarBlock title="Interests" accent={accent} font={font}>
            <div className="flex flex-wrap gap-1">
              {data.interests.map((i) => (
                <span key={i.id} style={{ fontSize: 8.5 }}>{i.name}</span>
              ))}
            </div>
          </SidebarBlock>
        )}
      </div>
      <MainColumn data={data} template={template} accent={accent} font={font} />
    </>
  );
}

function SplitLayout({ data, template, font, accent, hasContact }: Props & { font: string; accent: string; hasContact: boolean }) {
  return (
    <>
      <div className="w-[35%] shrink-0 pr-4" style={{ borderRight: `1px solid #e5e9f0` }}>
        {hasContact && (
          <SidebarBlock title="Contact" accent={accent} font={font} compact>
            {[
              data.personal.email && { icon: Mail, v: data.personal.email },
              data.personal.phone && { icon: Phone, v: data.personal.phone },
              data.personal.location && { icon: MapPin, v: data.personal.location },
              data.personal.linkedin && { icon: LinkedinIcon, v: strip(data.personal.linkedin) },
              data.personal.github && { icon: GithubIcon, v: strip(data.personal.github) },
              data.personal.portfolio && { icon: Globe, v: strip(data.personal.portfolio) },
            ].filter(Boolean).map((row: any, i) => (
              <div key={i} className="mb-1 flex items-start gap-1.5" style={{ fontSize: 8.5 }}>
                <row.icon style={{ width: 9, height: 9, marginTop: 1, color: accent }} />
                <span style={{ wordBreak: "break-all" }}>{row.v}</span>
              </div>
            ))}
          </SidebarBlock>
        )}
        {data.skills.length > 0 && (
          <SidebarBlock title="Skills" accent={accent} font={font} compact>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((s) => (
                <span key={s.id} className="rounded px-1.5 py-0.5" style={{ fontSize: 8, background: template.secondary ?? "#f1f5f9", color: template.textColor }}>
                  {s.name}
                </span>
              ))}
            </div>
          </SidebarBlock>
        )}
        {data.languages.length > 0 && (
          <SidebarBlock title="Languages" accent={accent} font={font} compact>
            {data.languages.map((l) => (
              <div key={l.id} className="flex justify-between" style={{ fontSize: 8.5 }}>
                <span>{l.name}</span>
                {l.level && <span style={{ color: "#64748b" }}>{l.level}</span>}
              </div>
            ))}
          </SidebarBlock>
        )}
        {data.certifications.length > 0 && (
          <SidebarBlock title="Certifications" accent={accent} font={font} compact>
            {data.certifications.map((c) => (
              <div key={c.id} style={{ fontSize: 8.5, lineHeight: 1.35 }}>{c.name}</div>
            ))}
          </SidebarBlock>
        )}
        {data.interests.length > 0 && (
          <SidebarBlock title="Interests" accent={accent} font={font} compact>
            <div className="flex flex-wrap gap-1">
              {data.interests.map((i) => (
                <span key={i.id} style={{ fontSize: 8.5 }}>{i.name}</span>
              ))}
            </div>
          </SidebarBlock>
        )}
      </div>
      <div className="min-w-0 flex-1 pl-4">
        <MainColumn data={data} template={template} accent={accent} font={font} />
      </div>
    </>
  );
}

function ClassicLayout({ data, template, font, accent, hasContact }: Props & { font: string; accent: string; hasContact: boolean }) {
  return <MainColumn data={data} template={template} accent={accent} font={font} />;
}

function MainColumn({ data, template, accent, font }: { data: ResumeData; template: TemplateConfig; accent: string; font: string }) {
  const style = template.sectionStyle;
  return (
    <div className="min-w-0 flex-1 space-y-3 p-4 pl-4">
      {data.summary && (
        <SectionBlock title="Summary" style={style} accent={accent} font={font}>
          <p style={{ fontSize: 9, lineHeight: 1.5 }}>{data.summary}</p>
        </SectionBlock>
      )}
      {data.experience.length > 0 && (
        <SectionBlock title="Experience" style={style} accent={accent} font={font}>
          {data.experience.map((e) => (
            <ExperienceRow key={e.id} item={e} accent={accent} />
          ))}
        </SectionBlock>
      )}
      {data.internships.length > 0 && (
        <SectionBlock title="Internships" style={style} accent={accent} font={font}>
          {data.internships.map((i) => (
            <ExperienceRow key={i.id} item={{ ...i, location: "", company: i.company, role: i.role, bullets: i.bullets }} accent={accent} />
          ))}
        </SectionBlock>
      )}
      {data.projects.length > 0 && (
        <SectionBlock title="Projects" style={style} accent={accent} font={font}>
          {data.projects.map((p) => (
            <ProjectRow key={p.id} item={p} accent={accent} />
          ))}
        </SectionBlock>
      )}
      {data.education.length > 0 && (
        <SectionBlock title="Education" style={style} accent={accent} font={font}>
          {data.education.map((e) => (
            <EducationRow key={e.id} item={e} accent={accent} />
          ))}
        </SectionBlock>
      )}
      {data.skills.length > 0 && template.layout === "classic" && (
        <SectionBlock title="Skills" style={style} accent={accent} font={font}>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {data.skills.map((s) => (
              <span key={s.id} style={{ fontSize: 9 }}>
                {s.name}
                {s.level ? ` — ${s.level}` : ""}
              </span>
            ))}
          </div>
        </SectionBlock>
      )}
      {data.certifications.length > 0 && template.layout === "classic" && (
        <SectionBlock title="Certifications" style={style} accent={accent} font={font}>
          {data.certifications.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5" style={{ fontSize: 9 }}>
              <CheckCircle2 style={{ width: 10, height: 10, color: accent }} />
              <span>{c.name}</span>
              {c.issuer && <span style={{ color: "#64748b" }}>— {c.issuer}</span>}
              {c.year && <span style={{ color: "#64748b" }}>({c.year})</span>}
            </div>
          ))}
        </SectionBlock>
      )}
      {data.achievements.length > 0 && (
        <SectionBlock title="Achievements" style={style} accent={accent} font={font}>
          {data.achievements.map((a) => (
            <div key={a.id} className="flex items-start gap-1.5" style={{ fontSize: 9 }}>
              <Award style={{ width: 10, height: 10, color: accent, marginTop: 2 }} />
              <div>
                <span style={{ fontWeight: 600 }}>{a.title}</span>
                {a.detail && <span> — {a.detail}</span>}
                {a.year && <span style={{ color: "#64748b" }}> ({a.year})</span>}
              </div>
            </div>
          ))}
        </SectionBlock>
      )}
      {data.languages.length > 0 && template.layout === "classic" && (
        <SectionBlock title="Languages" style={style} accent={accent} font={font}>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {data.languages.map((l) => (
              <span key={l.id} style={{ fontSize: 9 }}>
                {l.name}
                {l.level ? ` — ${l.level}` : ""}
              </span>
            ))}
          </div>
        </SectionBlock>
      )}
      {data.interests.length > 0 && template.layout === "classic" && (
        <SectionBlock title="Interests" style={style} accent={accent} font={font}>
          <div className="flex flex-wrap gap-1">
            {data.interests.map((i) => (
              <span key={i.id} className="rounded px-1.5 py-0.5" style={{ fontSize: 8.5, background: template.secondary ?? "#f1f5f9" }}>
                {i.name}
              </span>
            ))}
          </div>
        </SectionBlock>
      )}
      {data.customSections.map((cs) => (
        <SectionBlock key={cs.id} title={cs.title} style={style} accent={accent} font={font}>
          {cs.items.map((item, i) => (
            <div key={i} style={{ fontSize: 9, lineHeight: 1.5, marginBottom: 4 }}>
              {item.title && <span style={{ fontWeight: 600 }}>{item.title}.</span>} {item.detail}
            </div>
          ))}
        </SectionBlock>
      ))}
    </div>
  );
}

function SidebarBlock({ title, accent, font, compact, children }: { title: string; accent: string; font: string; compact?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4" style={{ fontFamily: font }}>
      <h3 style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, borderBottom: `1.5px solid ${accent}`, paddingBottom: 2 }}>
        {title}
      </h3>
      <div className={compact ? "" : "space-y-0.5"}>{children}</div>
    </div>
  );
}

function SectionBlock({ title, style, accent, font, children }: { title: string; style: string; accent: string; font: string; children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: font }}>
      {style === "badge" ? (
        <div className="mb-1.5">
          <span className="inline-block rounded px-2 py-0.5" style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", background: accent, color: "#ffffff" }}>
            {title}
          </span>
        </div>
      ) : style === "bar" ? (
        <div className="mb-1.5 flex items-center gap-2">
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: accent }}>{title}</span>
          <span className="flex-1" style={{ height: 3, background: accent, opacity: 0.25 }} />
        </div>
      ) : style === "underline" ? (
        <h3 className="mb-1.5" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: accent, borderBottom: "2px solid #e5e9f0", paddingBottom: 3 }}>
          {title}
        </h3>
      ) : (
        <h3 className="mb-1.5" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 3 }}>
          {title}
        </h3>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ExperienceRow({ item, accent }: { item: Experience; accent: string }) {
  const period = [item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" – ");
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span style={{ fontSize: 10, fontWeight: 700 }}>{item.role || item.company}</span>
        {period && <span style={{ fontSize: 8.5, color: "#64748b", whiteSpace: "nowrap" }}>{period}</span>}
      </div>
      {item.company && item.role && (
        <p style={{ fontSize: 9, color: accent, fontWeight: 600 }}>{item.company}</p>
      )}
      {item.description && <p style={{ fontSize: 9, lineHeight: 1.45, marginTop: 1 }}>{item.description}</p>}
      {item.bullets?.length > 0 && (
        <ul className="mt-0.5 space-y-0.5">
          {item.bullets.map((b, i) => (
            <li key={i} className="flex gap-1.5" style={{ fontSize: 9, lineHeight: 1.4 }}>
              <span style={{ color: accent }}>•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectRow({ item, accent }: { item: Project; accent: string }) {
  const period = [item.startDate, item.endDate].filter(Boolean).join(" – ");
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span style={{ fontSize: 10, fontWeight: 700 }}>{item.name}</span>
        {period && <span style={{ fontSize: 8.5, color: "#64748b", whiteSpace: "nowrap" }}>{period}</span>}
      </div>
      {item.tech && <p style={{ fontSize: 9, color: accent, fontWeight: 600 }}>{item.tech}</p>}
      {item.description && <p style={{ fontSize: 9, lineHeight: 1.45, marginTop: 1 }}>{item.description}</p>}
      {item.bullets?.length > 0 && (
        <ul className="mt-0.5 space-y-0.5">
          {item.bullets.map((b, i) => (
            <li key={i} className="flex gap-1.5" style={{ fontSize: 9, lineHeight: 1.4 }}>
              <span style={{ color: accent }}>•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EducationRow({ item, accent }: { item: Education; accent: string }) {
  const period = [item.startDate, item.endDate].filter(Boolean).join(" – ");
  const title = [item.degree, item.field].filter(Boolean).join(" in ");
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span style={{ fontSize: 10, fontWeight: 700 }}>{item.school}</span>
        {period && <span style={{ fontSize: 8.5, color: "#64748b", whiteSpace: "nowrap" }}>{period}</span>}
      </div>
      {title && <p style={{ fontSize: 9, color: accent, fontWeight: 600 }}>{title}</p>}
      {item.grade && <p style={{ fontSize: 8.5, color: "#64748b" }}>{item.grade}</p>}
      {item.description && <p style={{ fontSize: 9, lineHeight: 1.45 }}>{item.description}</p>}
    </div>
  );
}

function strip(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function withProto(url: string) {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

export function EmptyPreview({ template }: { template: TemplateConfig }) {
  return <ResumePreview data={getSampleResume(template.slug)} template={template} />;
}
