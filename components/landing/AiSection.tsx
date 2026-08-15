"use client";

import { motion } from "motion/react";
import { Sparkles, PenLine, Target, BrainCircuit, BadgeCheck } from "lucide-react";

const STEPS = [
  { icon: PenLine, title: "Describe what you did", desc: "Enter basic information — even rough notes like “I worked on a website”." },
  { icon: Sparkles, title: "AI writes it like a pro", desc: "Zuno rewrites your content into achievement-oriented, recruiter-ready language." },
  { icon: Target, title: "Match the job", desc: "Paste a job description and see your match percentage plus missing skills." },
  { icon: BrainCircuit, title: "Analyze & optimize", desc: "Get a real ATS score with strengths, weaknesses and keyword recommendations." },
  { icon: BadgeCheck, title: "Export your PDF", desc: "Download a print-ready A4 PDF that keeps your template design pixel-perfect." },
];

export function AiSection() {
  return (
    <section id="ai" className="relative overflow-hidden py-24">
      <div className="aurora-bg absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              AI Co-Pilot
            </span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Your resume has an{" "}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                AI co-pilot.
              </span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Zuno's AI works from your real information. It never invents jobs,
              companies or achievements — it just turns what you've done into language
              recruiters and ATS systems respond to.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Professional summary generation tuned to your target role",
                "Experience & bullet rewriting with action verbs and measurable impact",
                "Project description generator with technical depth and keywords",
                "Skill suggestions you can add to your resume in one click",
                "Job-description matching that tells you exactly what to highlight",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[15px] text-muted-foreground">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="glass rounded-3xl p-6 shadow-2xl shadow-blue-500/10">
              {/* AI chat mock */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold">Zuno AI</span>
                </div>

                <div className="rounded-2xl rounded-tl-sm bg-muted p-4 text-sm text-muted-foreground">
                  How can I improve my resume for a software engineer role?
                </div>

                <div className="rounded-2xl rounded-tr-sm border border-border bg-card p-4 text-sm leading-relaxed">
                  <p className="font-medium text-foreground">Here's how to strengthen your resume:</p>
                  <ul className="mt-2 space-y-1.5 text-muted-foreground">
                    <li>• Start each bullet with a strong action verb (built, optimized, shipped).</li>
                    <li>• Add numbers — “cut load time by 40%” beats “improved performance”.</li>
                    <li>• List your skills exactly as job postings phrase them (React, TypeScript, Node.js).</li>
                  </ul>
                  <div className="mt-3 flex items-center gap-2 text-xs text-blue-500">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Generated from your resume context
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
                <span className="text-sm text-muted-foreground">Ask about your resume…</span>
                <span className="ml-auto flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" /> Generate
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
