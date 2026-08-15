"use client";

import { motion } from "motion/react";
import {
  Wand2, ShieldCheck, LayoutTemplate, Eye, ScanSearch, FileText,
  Lightbulb, Download, Cloud, Layers,
} from "lucide-react";

const FEATURES = [
  {
    icon: Wand2,
    title: "AI Resume Writer",
    desc: "Generate professional summaries, rewrite experience, and craft project descriptions with a real AI co-pilot.",
    color: "from-blue-600 to-blue-500",
  },
  {
    icon: ShieldCheck,
    title: "ATS Optimization",
    desc: "Real ATS scoring on structure, keywords, action verbs and formatting — with concrete recommendations.",
    color: "from-emerald-600 to-emerald-500",
  },
  {
    icon: LayoutTemplate,
    title: "Professional Templates",
    desc: "10 engineering-focused, A4-ready templates designed for recruiters and automated parsers alike.",
    color: "from-violet-600 to-violet-500",
  },
  {
    icon: Eye,
    title: "Live Resume Preview",
    desc: "Your resume updates in real time as you type — zoom, fit-to-screen, or fullscreen on any device.",
    color: "from-cyan-600 to-cyan-500",
  },
  {
    icon: ScanSearch,
    title: "Resume Analyzer",
    desc: "Upload an existing PDF and get a full ATS analysis with section detection and improvement tips.",
    color: "from-amber-600 to-amber-500",
  },
  {
    icon: FileText,
    title: "AI Summary Generator",
    desc: "Turn your education, skills and experience into a polished summary in one click.",
    color: "from-rose-600 to-rose-500",
  },
  {
    icon: Lightbulb,
    title: "AI Skill Suggestions",
    desc: "Relevant skill recommendations for your target role — add them to your resume with one click.",
    color: "from-indigo-600 to-indigo-500",
  },
  {
    icon: Download,
    title: "PDF Export",
    desc: "Download a print-ready A4 PDF that preserves your exact template design.",
    color: "from-sky-600 to-sky-500",
  },
  {
    icon: Cloud,
    title: "Cloud Save",
    desc: "Autosave with version-safe persistence — your data is never lost, even on refresh.",
    color: "from-teal-600 to-teal-500",
  },
  {
    icon: Layers,
    title: "Multiple Resumes",
    desc: "Keep separate resumes for different roles — software engineer, data scientist, internship and more.",
    color: "from-fuchsia-600 to-fuchsia-500",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              Features
            </span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Everything you need to stand out
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete resume platform — from AI writing to ATS analysis to PDF export.
            </p>
          </motion.div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="glow-hover group relative overflow-hidden rounded-2xl border border-border bg-card p-6"
            >
              <div
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${f.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
              />
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg`}
              >
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
