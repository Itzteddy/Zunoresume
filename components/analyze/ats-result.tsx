"use client";

import { CheckCircle2, X, Circle, Gauge } from "lucide-react";
import type { ATSAnalysisResult } from "@/types";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export function AtsResultDialog({
  result,
  onClose,
}: {
  result: ATSAnalysisResult;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-emerald-500" /> ATS Score: {result.score}/100
          </DialogTitle>
          <DialogDescription>
            {result.score >= 80
              ? "Great job — your resume is well optimized."
              : result.score >= 60
                ? "Decent, but there's room to improve."
                : "Your resume needs work to pass ATS screeners."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {Object.entries(result.breakdown).map(([key, value]) => (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="capitalize text-muted-foreground">{key}</span>
                <span className="font-semibold">{value}/100</span>
              </div>
              <Progress value={value} />
            </div>
          ))}
        </div>

        {result.strengths.length ? (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-emerald-600">Strengths</h4>
            <ul className="space-y-1 text-sm">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {s}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {result.weaknesses.length ? (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-destructive">Weaknesses</h4>
            <ul className="space-y-1 text-sm">
              {result.weaknesses.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> {s}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {result.recommendations.length ? (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Recommendations</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {result.recommendations.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Circle className="mt-0.5 h-2 w-2 shrink-0 fill-blue-500 text-blue-500" /> {s}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
