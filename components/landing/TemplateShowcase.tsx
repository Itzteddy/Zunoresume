"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { EmptyPreview } from "@/components/resume/ResumePreview";
import { TemplateCard } from "@/components/templates/TemplateCard";

export function TemplateShowcase() {
  return (
    <section id="templates" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              Templates
            </span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Ten professional templates. One perfect match.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every template is A4-ready, print-friendly, PDF-exportable and designed
              to pass automated resume screeners.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link
              href="/templates"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400"
            >
              Browse all templates
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {TEMPLATES.slice(0, 10).map((t, i) => (
            <TemplateCard key={t.slug} template={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TemplateCardThumb({ slug }: { slug: string }) {
  const t = TEMPLATES.find((x) => x.slug === slug);
  if (!t) return null;
  return (
    <div className="relative overflow-hidden rounded-lg bg-white" style={{ width: 210, height: 270 }}>
      <div style={{ width: 210, transform: "scale(0.30)", transformOrigin: "top left" }}>
        <EmptyPreview template={t} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900">
          <Eye className="h-3 w-3" /> Preview
        </span>
      </div>
    </div>
  );
}
