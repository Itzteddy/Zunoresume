"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Wand2, Gauge, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Particles } from "./Background";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pb-20 pt-28">
      <div className="aurora-bg absolute inset-0" />
      <div className="grid-overlay absolute inset-0" />
      <Particles />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm backdrop-blur"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-muted-foreground">AI-powered resume co-pilot</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
          >
            <span className="text-gradient-dark dark:text-gradient">Build a Resume</span>
            <br />
            <span className="text-gradient-dark dark:text-gradient">That Gets You</span>
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Noticed.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            Create professional, ATS-friendly resumes with real AI writing, smart
            templates, live previews, and instant resume analysis — in minutes, not days.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg" variant="gradient">
              <Link href="/register">
                Create Resume
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/templates">
                Explore Templates
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> ATS-optimized
            </span>
            <span className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-blue-500" /> AI writing
            </span>
            <span className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cyan-500" /> Instant scoring
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> PDF export
            </span>
          </motion.div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative hidden h-[520px] lg:block">
      {/* Glow */}
      <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-600/30 to-cyan-500/20 blur-3xl" />

      {/* Resume sheet */}
      <motion.div
        initial={{ opacity: 0, rotateY: -18, y: 30 }}
        animate={{ opacity: 1, rotateY: -12, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 top-1/2 w-[300px] -translate-x-[58%] -translate-y-1/2"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="animate-float-slow overflow-hidden rounded-lg bg-white shadow-2xl shadow-blue-500/20 ring-1 ring-black/5">
          <div className="h-16 bg-gradient-to-r from-blue-700 to-blue-500 px-5 pt-4 text-white">
            <div className="h-3 w-36 rounded-full bg-white/90" />
            <div className="mt-1.5 h-2 w-24 rounded-full bg-blue-100/70" />
          </div>
          <div className="space-y-3 px-5 py-4">
            <div className="h-2 w-20 rounded-full bg-blue-600" />
            <div className="h-1.5 w-full rounded-full bg-gray-200" />
            <div className="h-1.5 w-5/6 rounded-full bg-gray-200" />
            <div className="h-2 w-20 rounded-full bg-blue-600" />
            <div className="h-1.5 w-full rounded-full bg-gray-200" />
            <div className="h-1.5 w-4/6 rounded-full bg-gray-200" />
            <div className="h-2 w-20 rounded-full bg-blue-600" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["React", "TypeScript", "Node", "AI/ML", "SQL"].map((s) => (
                <span key={s} className="rounded-md bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating ATS card */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="absolute right-2 top-10"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="glass w-44 rounded-2xl p-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">ATS Score</span>
            <Gauge className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-1 text-3xl font-extrabold text-emerald-500">94</div>
          <div className="mt-2 h-1.5 rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "94%" }}
              transition={{ duration: 1.4, delay: 1.2 }}
              className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Floating AI suggestions */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="absolute left-0 top-24"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="glass w-48 rounded-2xl p-4 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold">AI Suggestions</span>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="rounded-lg bg-accent px-2.5 py-1.5 text-[10px] text-accent-foreground">
              Add measurable impact to bullets
            </div>
            <div className="rounded-lg bg-accent/50 px-2.5 py-1.5 text-[10px]">
              Highlight your React projects
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating resume strength */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="absolute bottom-12 right-8"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold">Resume Strength</div>
            <div className="text-xs text-muted-foreground">Strong &amp; ATS-ready</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
