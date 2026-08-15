"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { LayoutGrid, Sparkles, Eye, Download, Loader2, X } from "lucide-react";
import type {
  ResumeData, TemplateConfig, BuilderStep, ATSAnalysisResult, JobMatchResult, Project,
} from "@/types";
import { TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ResumePDFDocument } from "@/components/resume/ResumePDF";
import {
  saveFullResumeAction, updateTemplateAction, updateAtsScoreAction,
} from "@/actions/resume";
import {
  analyzeAtsAction, jobMatchAction, generateSummaryAction, rewriteContentAction,
  generateProjectAction, suggestSkillsAction,
} from "@/actions/ai";
import { useResumeHistory } from "./history";
import { STEPS, isSectionFilled } from "./step-defs";
import { uid } from "./list-editor";
import { WorkspaceNav, type SaveState } from "./workspace-nav";
import { ProgressRail } from "./progress-rail";
import { SectionScene, SceneNav } from "./scenes";
import { PersonalEditor } from "./personal-editor";
import { SummaryEditor, type SummaryTone } from "./summary-editor";
import { SkillsEditor } from "./skills-editor";
import { CustomSectionsEditor } from "./custom-editor";
import {
  EducationEditor, ExperienceEditor, InternshipEditor, ProjectEditor,
  CertificationEditor, AchievementEditor, LanguageEditor, InterestEditor,
} from "./section-forms";
import { ReviewScene } from "./review-scene";
import { PreviewCanvas } from "./preview-canvas";
import { CopilotPanel } from "./copilot-panel";
import { AIEditOverlay } from "./ai-edit";
import { AtsDialog, JobDialog } from "./analyze-dialogs";
import { PanelBody, type PanelTab } from "./panel";
import { DownloadDialog, type DownloadState } from "./download-dialog";
import { usePageCount } from "./preview-canvas";
import { ResumePreview } from "@/components/resume/ResumePreview";

const ORDER: BuilderStep[] = STEPS.map((s) => s.id);

const SECTION_KEY: Record<string, keyof ResumeData> = {
  personal: "personal",
  summary: "summary",
  education: "education",
  experience: "experience",
  projects: "projects",
  skills: "skills",
  certifications: "certifications",
  achievements: "achievements",
  internships: "internships",
  languages: "languages",
  interests: "interests",
  custom: "customSections",
  review: "summary",
};

type Props = {
  resumeId: string;
  title: string;
  data: ResumeData;
  template: TemplateConfig;
  initialStep: BuilderStep;
  atsScore: number | null;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
};

export function BuilderWorkspace({
  resumeId,
  title,
  data: initialData,
  template,
  initialStep,
  atsScore,
}: Props) {
  const router = useRouter();
  const { data, set, undo, redo, canUndo, canRedo } = useResumeHistory(initialData);
  const [step, setStep] = useState<BuilderStep>(initialStep);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [currentTemplate, setCurrentTemplate] = useState<TemplateConfig>(template);
  const [templateChanging, setTemplateChanging] = useState(false);

  const [panelTab, setPanelTab] = useState<PanelTab>("sections");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  const [download, setDownload] = useState<DownloadState>({ phase: "idle" });
  const downloading = download.phase === "running";
  const { sheetRef, pages: downloadPages } = usePageCount(data, currentTemplate, download.phase !== "idle");

  const [summaryTone, setSummaryTone] = useState<SummaryTone | null>(null);
  const [summaryPreview, setSummaryPreview] = useState<string | null>(null);

  const [suggesting, setSuggesting] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);

  const [aiOverlay, setAiOverlay] = useState<{
    title: string;
    original: string;
    draft: string | null;
    onApply: () => void;
  } | null>(null);
  const [rewriteBulletLoading, setRewriteBulletLoading] = useState<string | null>(null);

  const [projectGen, setProjectGen] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", tech: "", description: "" });
  const [projectGenerating, setProjectGenerating] = useState(false);

  const [atsOpen, setAtsOpen] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
  const [atsRunning, setAtsRunning] = useState(false);

  const [jobOpen, setJobOpen] = useState(false);
  const [jobDesc, setJobDesc] = useState("");
  const [jobResult, setJobResult] = useState<JobMatchResult | null>(null);
  const [jobRunning, setJobRunning] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  /* Autosave */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const res = await saveFullResumeAction({ resumeId, data });
      setSaveState(res?.success ? "saved" : "error");
      if (!res?.success) toast.error(res?.error ?? "Autosave failed.");
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, resumeId]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (k === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (k === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const completed = useMemo(() => {
    const map: Partial<Record<BuilderStep, boolean>> = {};
    for (const s of STEPS) {
      if (s.id === "review") {
        map.review = true;
        continue;
      }
      map[s.id] = isSectionFilled(s.id, data[SECTION_KEY[s.id]]);
    }
    return map;
  }, [data]);

  function goTo(next: BuilderStep) {
    setStep(next);
    router.replace(`/builder/${resumeId}?step=${next}`);
    setMobilePreviewOpen(false);
    setAiOverlay(null);
  }

  async function saveNow() {
    setSaveState("saving");
    const res = await saveFullResumeAction({ resumeId, data });
    setSaveState(res?.success ? "saved" : "error");
    if (!res?.success) toast.error(res?.error ?? "Save failed.");
    return res?.success;
  }

  async function downloadPdf() {
    if (download.phase === "running") return;
    setDownload({ phase: "running", stage: 0 });
    try {
      await new Promise((r) => setTimeout(r, 650));
      setDownload((d) => (d.phase === "running" ? { ...d, stage: 1 } : d));
      const blob = await pdf(
        <ResumePDFDocument data={data} template={currentTemplate} />
      ).toBlob();
      setDownload((d) => (d.phase === "running" ? { ...d, stage: 2 } : d));
      await new Promise((r) => setTimeout(r, 600));
      setDownload((d) => (d.phase === "running" ? { ...d, stage: 3 } : d));
      await new Promise((r) => setTimeout(r, 500));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(data.personal.fullName || title || "resume").replace(/[^\w\d -]/g, "").trim() || "resume"}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setDownload((d) => (d.phase === "running" ? { phase: "done", size: blob.size, pages: downloadPages } : d));
      toast.success("PDF downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate PDF.");
      setDownload({ phase: "idle" });
    }
  }

  async function changeTemplate(slug: string) {
    if (slug === currentTemplate.slug) return;
    const next = TEMPLATES.find((t) => t.slug === slug);
    if (!next) return;
    setTemplateChanging(true);
    setCurrentTemplate(next);
    const res = await updateTemplateAction({ resumeId, templateSlug: slug });
    setTemplateChanging(false);
    if (!res?.success) {
      toast.error(res?.error ?? "Could not change template.");
      setCurrentTemplate(currentTemplate);
      return;
    }
    toast.success("Template changed.");
  }

  async function runAts() {
    setAtsOpen(true);
    setAtsRunning(true);
    const res = await analyzeAtsAction({ resumeId });
    setAtsRunning(false);
    if (!res?.success) {
      toast.error(res?.error ?? "ATS analysis failed.");
      return;
    }
    setAtsResult(res.data as ATSAnalysisResult);
    await updateAtsScoreAction({ resumeId, score: (res.data as ATSAnalysisResult).score });
    router.refresh();
  }

  async function runJobMatch() {
    if (!jobDesc.trim()) {
      toast.error("Paste a job description first.");
      return;
    }
    setJobRunning(true);
    const res = await jobMatchAction({ resumeId, jobDescription: jobDesc });
    setJobRunning(false);
    if (!res?.success) {
      toast.error(res?.error ?? "Job matching failed.");
      return;
    }
    setJobResult(res.data as JobMatchResult);
  }

  async function handleGenerateSummary(tone: SummaryTone) {
    setSummaryTone(tone);
    const res = await generateSummaryAction({ resumeId, data, tone });
    setSummaryTone(null);
    if (!res.success || res.data == null) {
      toast.error(res.error ?? "Could not generate summary.");
      return;
    }
    setSummaryPreview(res.data as string);
    toast.success("Draft ready — review before applying.");
  }

  function applySummary() {
    if (!summaryPreview) return;
    set((d) => ({ ...d, summary: summaryPreview }));
    setSummaryPreview(null);
    toast.success("Summary updated.");
  }

  async function handleSuggestSkills() {
    setSuggesting(true);
    const res = await suggestSkillsAction({ resumeId });
    setSuggesting(false);
    if (!res.success || res.data == null) {
      toast.error(res.error ?? "Could not suggest skills.");
      return;
    }
    setSuggestedSkills(res.data as string[]);
  }

  function applySuggestedSkills() {
    const existing = new Set(data.skills.map((s) => s.name.toLowerCase()));
    const next = [...data.skills];
    for (const name of suggestedSkills) {
      if (!existing.has(name.toLowerCase())) {
        next.push({ id: uid(), name, level: "", order: next.length });
      }
    }
    set((d) => ({ ...d, skills: next }));
    setSuggestedSkills([]);
    toast.success("Skills added.");
  }

  async function handleRewriteBullet(
    kind: "experience" | "internship" | "project",
    itemIndex: number,
    bulletIndex: number,
    bullet: string
  ) {
    const byKind = {
      experience: data.experience,
      internship: data.internships,
      project: data.projects,
    };
    const key = kind === "project" ? "projects" : kind === "internship" ? "internships" : "experience";
    const items = byKind[kind];
    const item = items[itemIndex];
    if (!item) return;
    setRewriteBulletLoading(`${itemIndex}-${bulletIndex}`);
    const res = await rewriteContentAction({
      resumeId,
      kind,
      item: { bullet },
      mode: "improve",
    });
    setRewriteBulletLoading(null);
    if (!res.success || res.data == null) {
      toast.error(res.error ?? "Could not rewrite. Try again.");
      return;
    }
    const draft = res.data as string;
    setAiOverlay({
      title: "AI bullet rewrite",
      original: bullet,
      draft,
      onApply: () => {
        set((d) => {
          const arr = [...(d[key] as { bullets: string[] }[])];
          arr[itemIndex] = {
            ...arr[itemIndex],
            bullets: arr[itemIndex].bullets.map((b, bi) => (bi === bulletIndex ? draft : b)),
          };
          return { ...d, [key]: arr };
        });
        toast.success("Bullet updated.");
      },
    });
  }

  async function handleGenerateProject() {
    if (!projectForm.name.trim()) {
      toast.error("Give the project a name first.");
      return;
    }
    setProjectGenerating(true);
    const res = await generateProjectAction({
      resumeId,
      name: projectForm.name.trim(),
      tech: projectForm.tech.trim(),
      description: projectForm.description.trim(),
    });
    setProjectGenerating(false);
    if (!res.success || res.data == null) {
      toast.error(res.error ?? "Could not generate project.");
      return;
    }
    const gen = res.data as { description?: string; bullets?: string[] };
    const project: Project = {
      id: uid(),
      name: projectForm.name.trim(),
      link: "",
      tech: projectForm.tech.trim(),
      startDate: "",
      endDate: "",
      description: gen.description ?? "",
      bullets: gen.bullets?.length ? gen.bullets : [""],
      order: data.projects.length,
    };
    set((d) => ({ ...d, projects: [...d.projects, project] }));
    setProjectGen(false);
    setProjectForm({ name: "", tech: "", description: "" });
    goTo("projects");
    toast.success("Project added.");
  }

  function handleCopilotNav(target: string, action?: "generateSummary" | "suggestSkills") {
    if (target === "ats") {
      setCopilotOpen(false);
      setAtsOpen(true);
      return;
    }
    if (target === "job") {
      setCopilotOpen(false);
      setJobOpen(true);
      return;
    }
    const s = target as BuilderStep;
    if (STEPS.some((x) => x.id === s)) {
      setCopilotOpen(false);
      goTo(s);
      if (action === "generateSummary") void handleGenerateSummary("professional");
      if (action === "suggestSkills") void handleSuggestSkills();
    }
  }

  async function shareResume() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  const orderIndex = ORDER.indexOf(step);
  const isFirst = orderIndex === 0;
  const nextStep = orderIndex < ORDER.length - 1 ? ORDER[orderIndex + 1] : null;

  async function handleContinue() {
    if (!nextStep) return;
    const ok = await saveNow();
    if (ok) goTo(nextStep);
  }

  function renderEditor() {
    switch (step) {
      case "personal":
        return <PersonalEditor value={data.personal} onChange={(p) => set((d) => ({ ...d, personal: p }))} />;
      case "summary":
        return (
          <SummaryEditor
            value={data.summary}
            onChange={(v) => set((d) => ({ ...d, summary: v }))}
            onGenerate={(tone) => void handleGenerateSummary(tone)}
            generating={summaryTone}
            generatedPreview={summaryPreview}
            onApply={applySummary}
            onDiscard={() => setSummaryPreview(null)}
          />
        );
      case "education":
        return <EducationEditor items={data.education} onChange={(v) => set((d) => ({ ...d, education: v }))} />;
      case "experience":
        return (
          <ExperienceEditor
            items={data.experience}
            onChange={(v) => set((d) => ({ ...d, experience: v }))}
            onRewriteBullet={(ii, bi, b) => void handleRewriteBullet("experience", ii, bi, b)}
            aiBulletLoading={rewriteBulletLoading}
          />
        );
      case "projects":
        return (
          <ProjectEditor
            items={data.projects}
            onChange={(v) => set((d) => ({ ...d, projects: v }))}
            onGenerate={() => setProjectGen(true)}
            generating={projectGenerating}
            onRewriteBullet={(ii, bi, b) => void handleRewriteBullet("project", ii, bi, b)}
            aiBulletLoading={rewriteBulletLoading}
          />
        );
      case "skills":
        return (
          <SkillsEditor
            skills={data.skills}
            onChange={(v) => set((d) => ({ ...d, skills: v }))}
            onSuggest={() => void handleSuggestSkills()}
            suggesting={suggesting}
            suggested={suggestedSkills}
            onApplySuggested={applySuggestedSkills}
            onClearSuggested={() => setSuggestedSkills([])}
          />
        );
      case "certifications":
        return <CertificationEditor items={data.certifications} onChange={(v) => set((d) => ({ ...d, certifications: v }))} />;
      case "achievements":
        return <AchievementEditor items={data.achievements} onChange={(v) => set((d) => ({ ...d, achievements: v }))} />;
      case "internships":
        return (
          <InternshipEditor
            items={data.internships}
            onChange={(v) => set((d) => ({ ...d, internships: v }))}
            onRewriteBullet={(ii, bi, b) => void handleRewriteBullet("internship", ii, bi, b)}
            aiBulletLoading={rewriteBulletLoading}
          />
        );
      case "languages":
        return <LanguageEditor items={data.languages} onChange={(v) => set((d) => ({ ...d, languages: v }))} />;
      case "interests":
        return <InterestEditor items={data.interests} onChange={(v) => set((d) => ({ ...d, interests: v }))} />;
      case "custom":
        return <CustomSectionsEditor sections={data.customSections} onChange={(v) => set((d) => ({ ...d, customSections: v }))} />;
      case "review":
        return (
          <ReviewScene
            completed={completed}
            atsScore={atsScore}
            atsRunning={atsRunning}
            onAts={() => void runAts()}
            onJob={() => setJobOpen(true)}
            onDownload={() => void downloadPdf()}
            downloading={downloading}
            onCopilot={() => setCopilotOpen(true)}
          />
        );
      default:
        return null;
    }
  }

  const editor = renderEditor();

  return (
    <div className="workspace-bg relative min-h-screen">
      <div className="workspace-grid pointer-events-none absolute inset-0" />
      <div className="workspace-noise" />

      <WorkspaceNav
        title={title}
        saveState={saveState}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        previewOpen={previewOpen}
        onTogglePreview={() => {
          setPreviewOpen((o) => !o);
          setCopilotOpen(false);
        }}
        copilotOpen={copilotOpen}
        onToggleCopilot={() => {
          setCopilotOpen((o) => !o);
          setPreviewOpen(false);
        }}
        onDownload={() => void downloadPdf()}
        downloading={downloading}
        onShare={() => void shareResume()}
      >
        <ProgressRail step={step} completed={completed} onNavigate={goTo} />
      </WorkspaceNav>

      <div className="relative mx-auto flex max-w-[1440px] items-start gap-4 px-3 pb-28 pt-[4.75rem] md:px-5 lg:pb-10">
        <aside className="sticky top-[4.75rem] hidden h-[calc(100vh-6rem)] w-64 shrink-0 overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-xl lg:block">
          <PanelBody
            mobile={false}
            tab={panelTab}
            onTabChange={setPanelTab}
            step={step}
            completed={completed}
            onNavigate={goTo}
            templateSlug={currentTemplate.slug}
            onTemplateChange={(s) => void changeTemplate(s)}
            templateChanging={templateChanging}
            atsScore={atsScore}
            atsRunning={atsRunning}
            onAts={() => void runAts()}
            onJobMatch={() => setJobOpen(true)}
            onDownload={() => void downloadPdf()}
            downloading={downloading}
            onShare={() => void shareResume()}
            onCloseMobile={() => setMobilePanelOpen(false)}
          />
        </aside>

        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <SectionScene key={step} step={step}>
              {editor}
            </SectionScene>
          </AnimatePresence>
          <SceneNav
            isFirst={isFirst}
            isLast={step === "review"}
            onBack={() => {
              if (orderIndex > 0) goTo(ORDER[orderIndex - 1]);
            }}
            onContinue={() => {
              if (step === "review") void downloadPdf();
              else void handleContinue();
            }}
            continuing={step === "review" ? downloading : saveState === "saving"}
            continueLabel={step === "review" ? "Download PDF" : undefined}
          />
        </main>

        <PreviewCanvas
          data={data}
          template={currentTemplate}
          dockOpen={previewOpen}
          mobileOpen={mobilePreviewOpen}
          onCloseDock={() => setPreviewOpen(false)}
          onCloseMobile={() => setMobilePreviewOpen(false)}
        />
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/80 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
          <BarButton icon={LayoutGrid} label="Sections" onClick={() => setMobilePanelOpen(true)} />
          <BarButton icon={Sparkles} label="Copilot" active={copilotOpen} onClick={() => { setCopilotOpen(true); setPreviewOpen(false); }} />
          <BarButton icon={Eye} label="Preview" onClick={() => { setMobilePreviewOpen(true); setCopilotOpen(false); }} />
          <BarButton icon={Download} label="Download" loading={downloading} onClick={() => void downloadPdf()} />
        </div>
      </div>

      {/* Mobile sections drawer */}
      <AnimatePresence>
        {mobilePanelOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobilePanelOpen(false)}
          >
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-72 max-w-[85%] border-r border-border bg-card/95 backdrop-blur-xl"
            >
              <PanelBody
                mobile
                tab={panelTab}
                onTabChange={setPanelTab}
                step={step}
                completed={completed}
                onNavigate={(s) => {
                  goTo(s);
                  setMobilePanelOpen(false);
                }}
                templateSlug={currentTemplate.slug}
                onTemplateChange={(s) => void changeTemplate(s)}
                templateChanging={templateChanging}
                atsScore={atsScore}
                atsRunning={atsRunning}
                onAts={() => {
                  setMobilePanelOpen(false);
                  void runAts();
                }}
                onJobMatch={() => {
                  setMobilePanelOpen(false);
                  setJobOpen(true);
                }}
                onDownload={() => {
                  setMobilePanelOpen(false);
                  void downloadPdf();
                }}
                downloading={downloading}
                onShare={() => void shareResume()}
                onCloseMobile={() => setMobilePanelOpen(false)}
              />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <CopilotPanel
        open={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        resumeId={resumeId}
        onNavigateTo={handleCopilotNav}
      />

      <AIEditOverlay
        open={Boolean(aiOverlay)}
        title={aiOverlay?.title ?? ""}
        original={aiOverlay?.original ?? ""}
        draft={aiOverlay?.draft ?? null}
        onApply={() => {
          aiOverlay?.onApply();
          setAiOverlay(null);
        }}
        onRetry={() => {
          setAiOverlay(null);
          toast.info("Re-run the rewrite from the bullet you were editing.");
        }}
        onClose={() => setAiOverlay(null)}
      />

      <AtsDialog
        open={atsOpen}
        onOpenChange={(o) => {
          setAtsOpen(o);
          if (!o) setAtsResult(null);
        }}
        result={atsResult}
        running={atsRunning}
      />

      <JobDialog
        open={jobOpen}
        onOpenChange={(o) => {
          setJobOpen(o);
          if (!o) setJobResult(null);
        }}
        jobDesc={jobDesc}
        onJobDescChange={setJobDesc}
        onRun={() => void runJobMatch()}
        running={jobRunning}
        result={jobResult}
      />

      <Dialog open={projectGen} onOpenChange={setProjectGen}>
        <DialogContent className="border-border/60 bg-background/95 backdrop-blur-xl sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15">
                <Sparkles className="h-4 w-4 text-blue-500" />
              </span>
              Generate a project
            </DialogTitle>
            <DialogDescription>
              Tell us what you built — the AI writes the description and bullet points.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input
              value={projectForm.name}
              onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Project name (e.g. Taskly)"
              className="h-10 w-full rounded-xl border border-input bg-background/60 px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <input
              value={projectForm.tech}
              onChange={(e) => setProjectForm((f) => ({ ...f, tech: e.target.value }))}
              placeholder="Tech stack (e.g. Next.js, Postgres, OpenAI)"
              className="h-10 w-full rounded-xl border border-input bg-background/60 px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <textarea
              value={projectForm.description}
              onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              placeholder="What does it do? Who used it? What was your role?"
              className="w-full resize-y rounded-xl border border-input bg-background/60 p-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setProjectGen(false)} disabled={projectGenerating}>
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button variant="gradient" onClick={() => void handleGenerateProject()} disabled={projectGenerating}>
              {projectGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {projectGenerating ? "Generating…" : "Generate project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DownloadDialog
        open={download.phase !== "idle"}
        onOpenChange={(o) => {
          if (!o && download.phase === "running") return;
          setDownload({ phase: "idle" });
        }}
        state={download}
        stage={download.phase === "running" ? download.stage : 0}
        pages={downloadPages}
        template={currentTemplate}
        onRerun={() => void downloadPdf()}
        onEdit={() => setDownload({ phase: "idle" })}
      />

      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0 opacity-0">
        <div className="w-[210mm]">
          <div ref={sheetRef} className="resume-sheet paper-shadow">
            <ResumePreview data={data} template={currentTemplate} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BarButton({
  icon: Icon,
  label,
  onClick,
  active,
  loading,
}: {
  icon: typeof LayoutGrid;
  label: string;
  onClick: () => void;
  active?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[11px] font-medium transition-colors",
        active ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
      {label}
    </button>
  );
}
