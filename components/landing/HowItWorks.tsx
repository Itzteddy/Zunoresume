"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const STEPS = [
  { num: "01", title: "Create an account", desc: "Sign up with email or Google in seconds." },
  { num: "02", title: "Choose a template", desc: "Pick one of 10 professional, ATS-friendly designs." },
  { num: "03", title: "Enter your information", desc: "Fill the guided multi-step builder — or import from an existing PDF." },
  { num: "04", title: "Let AI improve it", desc: "Generate summaries, rewrite bullets, and get skill suggestions." },
  { num: "05", title: "Analyze your ATS score", desc: "See a real score with strengths, weaknesses and keyword gaps." },
  { num: "06", title: "Download your PDF", desc: "Export a print-ready A4 PDF that preserves your design." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              How it works
            </span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              From blank page to interview in minutes
            </h2>
          </motion.div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6"
            >
              <span className="absolute -right-3 -top-6 text-7xl font-extrabold text-foreground/[0.05] transition-colors group-hover:text-blue-500/10">
                {s.num}
              </span>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/15 to-cyan-500/15 text-blue-600 dark:text-blue-400">
                <span className="text-sm font-bold">{s.num}</span>
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="border-gradient relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-8 py-16 text-center text-white shadow-2xl shadow-blue-500/30 md:px-16"
        >
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

          <h2 className="relative text-4xl font-bold tracking-tight md:text-5xl">
            Your next opportunity starts
            <br />
            with your resume.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-blue-50/90">
            Join thousands of students and professionals building resumes that actually
            get noticed.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 shadow-xl">
              <Link href="/register">
                Create your resume
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="border border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link href="/templates">Browse templates</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
