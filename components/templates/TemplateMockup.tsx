"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { TemplateConfig } from "@/types";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { getSampleResume } from "@/components/resume/sample-data";

const A4_WIDTH_PX = 794; // 210mm at 96dpi

export function TemplateMockup({ template }: { template: TemplateConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale((w - 4) / A4_WIDTH_PX);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "210 / 297" }}
    >
      <div
        className="absolute left-0 top-0 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/10"
        style={{
          width: A4_WIDTH_PX,
          height: 1123,
          overflow: "hidden",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <ResumePreview data={getSampleResume(template.slug)} template={template} />
      </div>
    </div>
  );
}
