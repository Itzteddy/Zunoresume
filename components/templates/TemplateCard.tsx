"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BadgeCheck, Eye } from "lucide-react";
import type { TemplateConfig } from "@/types";
import { TemplateMockup } from "@/components/templates/TemplateMockup";

export function TemplateCard({
  template,
  index = 0,
}: {
  template: TemplateConfig;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 5) * 0.06 }}
      className="group relative"
    >
      <Link
        href={`/templates/${template.slug}`}
        className="block overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-blue-500/10"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <TemplateMockup template={template} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-lg">
              <Eye className="h-3.5 w-3.5" /> Preview
            </span>
          </div>
        </div>
        <div className="border-t border-border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold">{template.name}</span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-600">
              <BadgeCheck className="h-3.5 w-3.5" /> ATS {template.atsScore}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{template.category}</p>
        </div>
      </Link>
    </motion.div>
  );
}
