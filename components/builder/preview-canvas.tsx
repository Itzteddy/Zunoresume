"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Maximize2, Minimize2, FileText } from "lucide-react";
import type { ResumeData, TemplateConfig } from "@/types";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5];
const A4_MM_TO_PX = 297 * 3.7795275591;

export function usePageCount(data: ResumeData, template: TemplateConfig, active: boolean) {
  const [pages, setPages] = useState(1);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const el = sheetRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      setPages(Math.max(1, Math.ceil(h / A4_MM_TO_PX)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, data, template]);

  return { sheetRef, pages };
}

function PreviewBody({
  data,
  template,
  onClose,
  closeLabel,
  variant,
}: {
  data: ResumeData;
  template: TemplateConfig;
  onClose: () => void;
  closeLabel?: string;
  variant: "dock" | "overlay";
}) {
  const [zoom, setZoom] = useState(0.6);
  const [fullscreen, setFullscreen] = useState(false);
  const { sheetRef, pages } = usePageCount(data, template, true);

  const body = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          Live preview
          <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-500">
            {pages} {pages === 1 ? "page" : "pages"}
          </span>
        </span>
        <div className="flex items-center gap-0.5">
          {ZOOMS.map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setZoom(z)}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                Math.abs(zoom - z) < 0.001
                  ? "bg-blue-500 text-white"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {Math.round(z * 100)}%
            </button>
          ))}
          {variant === "dock" ? (
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => setFullscreen((f) => !f)}
              aria-label={fullscreen ? "Exit fullscreen" : "Open fullscreen"}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          ) : null}
          <Button variant="ghost" size="iconSm" onClick={onClose} aria-label={closeLabel ?? "Close preview"}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_center,rgba(120,130,160,0.12),transparent_70%)] p-5">
        <div
          className="mx-auto w-fit origin-top-left transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
        >
          <div className="w-[210mm]">
            <div ref={sheetRef} className="resume-sheet paper-shadow">
              <ResumePreview data={data} template={template} />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <AnimatePresence>
        {fullscreen ? (
          <motion.div
            key="fs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col bg-background/95 backdrop-blur-xl"
          >
            {body}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="flex h-full flex-col">{body}</div>
    </>
  );
}

export function PreviewCanvas({
  data,
  template,
  dockOpen,
  mobileOpen,
  onCloseDock,
  onCloseMobile,
}: {
  data: ResumeData;
  template: TemplateConfig;
  dockOpen: boolean;
  mobileOpen: boolean;
  onCloseDock: () => void;
  onCloseMobile: () => void;
}) {
  return (
    <>
      <AnimatePresence initial={false}>
        {dockOpen ? (
          <motion.aside
            key="dock"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "42%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-[4.75rem] hidden h-[calc(100vh-6rem)] max-w-[660px] min-w-[360px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card/90 shadow-2xl backdrop-blur-xl lg:block"
          >
            <PreviewBody
              data={data}
              template={template}
              variant="dock"
              onClose={onCloseDock}
              closeLabel="Close preview"
            />
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex flex-col bg-background lg:hidden"
          >
            <PreviewBody
              data={data}
              template={template}
              variant="overlay"
              onClose={onCloseMobile}
              closeLabel="Back to editing"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
