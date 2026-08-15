import type { Metadata } from "next";
import { TEMPLATES } from "@/lib/templates";
import { TemplateCard } from "@/components/templates/TemplateCard";

export const metadata: Metadata = { title: "Resume Templates" };

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-widest text-blue-500">
          Templates
        </span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Choose your template
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every template is A4-ready, ATS-optimized, and fully PDF-exportable.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {TEMPLATES.map((t, i) => (
          <TemplateCard key={t.slug} template={t} index={i} />
        ))}
      </div>
    </div>
  );
}
