"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BuilderStep } from "@/types";

const SCENE_COPY: Record<BuilderStep, { kicker: string; title: string; subtitle: string }> = {
  personal: {
    kicker: "Step 01",
    title: "Let's introduce you.",
    subtitle: "Your name, role and how recruiters can reach you.",
  },
  summary: {
    kicker: "Step 02",
    title: "Tell your story.",
    subtitle: "A crisp 2–4 line pitch that frames everything that follows.",
  },
  education: {
    kicker: "Step 03",
    title: "Build your foundation.",
    subtitle: "Schools, degrees and the grades that matter.",
  },
  experience: {
    kicker: "Step 04",
    title: "Show your impact.",
    subtitle: "The roles that shaped your career — lead with outcomes, not tasks.",
  },
  projects: {
    kicker: "Step 05",
    title: "Prove it.",
    subtitle: "Real projects that make your skills concrete.",
  },
  skills: {
    kicker: "Step 06",
    title: "Stack your edge.",
    subtitle: "The skills that match the jobs you're targeting.",
  },
  certifications: {
    kicker: "Step 07",
    title: "Add your credentials.",
    subtitle: "Certifications and licenses that back up your claims.",
  },
  achievements: {
    kicker: "Step 08",
    title: "Make it memorable.",
    subtitle: "Awards and accomplishments that set you apart.",
  },
  internships: {
    kicker: "Step 09",
    title: "Show early momentum.",
    subtitle: "Internships that signal you're ready to hit the ground running.",
  },
  languages: {
    kicker: "Step 10",
    title: "Say it in any language.",
    subtitle: "Languages and proficiency levels.",
  },
  interests: {
    kicker: "Step 11",
    title: "Show your human side.",
    subtitle: "A few interests make you more than a list of skills.",
  },
  custom: {
    kicker: "Step 12",
    title: "Go beyond the form.",
    subtitle: "Add custom sections that showcase the rest of you.",
  },
  review: {
    kicker: "Final",
    title: "Your resume is ready.",
    subtitle: "Review the details, run a quick check, then export.",
  },
};

export function SectionScene({ step, children }: { step: BuilderStep; children: ReactNode }) {
  const copy = SCENE_COPY[step] ?? SCENE_COPY.personal;
  return (
    <div className="mx-auto w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-500">
          {copy.kicker}
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{copy.title}</h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">{copy.subtitle}</p>
      </motion.div>
      <div className="mt-7">{children}</div>
    </div>
  );
}

export function SceneNav({
  onBack,
  onContinue,
  continuing,
  isFirst,
  isLast,
  continueLabel,
}: {
  onBack: () => void;
  onContinue: () => void;
  continuing?: boolean;
  isFirst: boolean;
  isLast: boolean;
  continueLabel?: string;
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-5">
      <Button variant="ghost" onClick={onBack} disabled={isFirst || continuing}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <Button variant="gradient" size="lg" onClick={onContinue} disabled={continuing}>
        {continuing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Saving…
          </>
        ) : (
          <>
            {continueLabel ?? (isLast ? "Finish & review" : "Save & continue")}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
