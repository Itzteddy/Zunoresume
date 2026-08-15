"use client";

import { useState } from "react";
import { FileUp, FileText, ClipboardList, Loader2, Sparkles, Gauge } from "lucide-react";
import { toast } from "sonner";
import type { ATSAnalysisResult } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { analyzeAtsAction, analyzeTextAction } from "@/actions/ai";
import { AtsResultDialog } from "./ats-result";

type ResumeOption = {
  id: string;
  title: string;
  atsScore: number | null;
};

export function AnalyzeClient({ resumes }: { resumes: ResumeOption[] }) {
  const [mode, setMode] = useState<"resume" | "upload" | "text">("resume");
  const [resumeId, setResumeId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");

  async function analyzeResume() {
    if (!resumeId) {
      toast.error("Select a resume first.");
      return;
    }
    setBusy(true);
    const res = await analyzeAtsAction({ resumeId });
    setBusy(false);
    if (!res?.success) {
      toast.error(res?.error ?? "Analysis failed.");
      return;
    }
    setResult(res.data as ATSAnalysisResult);
  }

  async function analyzeText() {
    if (text.trim().length < 40) {
      toast.error("Paste at least a few sentences of resume text.");
      return;
    }
    setBusy(true);
    const res = await analyzeTextAction({ text });
    setBusy(false);
    if (!res?.success) {
      toast.error(res?.error ?? "Analysis failed.");
      return;
    }
    setResult(res.data as ATSAnalysisResult);
  }

  async function analyzeUpload(file: File) {
    setBusy(true);
    setFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to analyze PDF.");
        return;
      }
      setText(data.text ?? "");
      setResult(data.analysis as ATSAnalysisResult);
    } catch {
      toast.error("Failed to analyze PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Resume Analyzer</h1>
        <p className="mt-1 text-muted-foreground">
          Get a real ATS score with strengths, weaknesses and actionable recommendations.
        </p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="resume" className="gap-1.5">
            <FileText className="h-4 w-4" /> My resumes
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-1.5">
            <FileUp className="h-4 w-4" /> Upload PDF
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-1.5">
            <ClipboardList className="h-4 w-4" /> Paste text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-4 pt-4">
          <Card className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>Resume</Label>
              <Select value={resumeId} onValueChange={setResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resume to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={analyzeResume} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
              Analyze ATS score
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4 pt-4">
          <Card className="space-y-4 p-6">
            <UploadDropzone onFile={analyzeUpload} busy={busy} fileName={fileName} />
          </Card>
        </TabsContent>

        <TabsContent value="text" className="space-y-4 pt-4">
          <Card className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>Resume text</Label>
              <Textarea
                rows={12}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={"Paste your resume text here…"}
              />
            </div>
            <Button onClick={analyzeText} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
              Analyze text
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {result ? <AtsResultDialog result={result} onClose={() => setResult(null)} /> : null}
    </div>
  );
}

function UploadDropzone({
  onFile,
  busy,
  fileName,
}: {
  onFile: (file: File) => void;
  busy: boolean;
  fileName: string;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center transition-colors hover:border-blue-500/50 hover:bg-blue-500/5 ${busy ? "pointer-events-none opacity-60" : ""}`}
    >
      {busy ? (
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-500" />
      ) : (
        <FileUp className="mb-3 h-8 w-8 text-blue-500" />
      )}
      <p className="text-sm font-medium">{busy ? "Analyzing…" : fileName || "Drop a PDF or click to upload"}</p>
      <p className="mt-1 text-xs text-muted-foreground">PDF files up to 10 MB</p>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}
