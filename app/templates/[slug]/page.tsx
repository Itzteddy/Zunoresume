import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, FileText, Printer, Cpu, LayoutTemplate } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { TemplateMockup } from "@/components/templates/TemplateMockup";
import { UseTemplateButton } from "@/components/templates/use-template-button";

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = TEMPLATES.find((x) => x.slug === slug);
  return { title: t ? `${t.name} Template` : "Template" };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = TEMPLATES.find((t) => t.slug === slug);
  if (!template) notFound();

  const features = [
    { icon: BadgeCheck, label: `ATS Score ${template.atsScore}/100` },
    { icon: Printer, label: "Print-ready A4 PDF export" },
    { icon: Cpu, label: "Parser-friendly layout" },
    { icon: LayoutTemplate, label: "Font: " + template.font },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/templates"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All templates
      </Link>

      <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <BadgeCheck className="h-3.5 w-3.5" /> ATS {template.atsScore}/100
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">{template.name}</h1>
          <p className="mt-2 text-muted-foreground">{template.category} template</p>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            {template.description}
          </p>

          <ul className="mt-6 space-y-2.5">
            {features.map((f) => (
              <li key={f.label} className="flex items-center gap-2.5 text-sm">
                <f.icon className="h-4 w-4 text-blue-500" />
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <UseTemplateButton slug={template.slug} />
            <Link
              href="/templates"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-input bg-background/60 px-8 text-base font-medium hover:bg-accent"
            >
              <FileText className="h-4 w-4" /> Compare templates
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-blue-600/10 to-cyan-500/10 blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 p-3 shadow-2xl backdrop-blur-sm sm:p-4">
            <TemplateMockup template={template} />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Live preview — exactly what your resume will look like on A4
          </p>
        </div>
      </div>
    </div>
  );
}
