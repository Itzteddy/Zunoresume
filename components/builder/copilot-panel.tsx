"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Send, Loader2, Lightbulb, FileSearch, Briefcase, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assistantAction } from "@/actions/ai";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "ai"; text: string };

const QUICK_ACTIONS = [
  { id: "summary", label: "Improve my summary", icon: Lightbulb },
  { id: "ats", label: "Analyze ATS fit", icon: FileSearch },
  { id: "job", label: "Match a job post", icon: Briefcase },
  { id: "skills", label: "Suggest skills", icon: Wand2 },
];

const PRESET_PROMPTS: Record<string, string> = {
  summary:
    "Looking at my resume, give me 3 specific, concrete suggestions to strengthen my professional summary. Reference my actual background.",
  ats: "Do a quick ATS health check on my resume and tell me the top 3 things most likely to hurt my chances.",
  job: "What's the best way to tailor my resume to a specific job description? What should I change first?",
  skills:
    "Based on my experience and target role, list 6 skills I should add or strengthen to be more competitive.",
};

export function CopilotPanel({
  open,
  onClose,
  resumeId,
  onNavigateTo,
}: {
  open: boolean;
  onClose: () => void;
  resumeId: string;
  onNavigateTo: (step: string, action?: "generateSummary" | "suggestSkills") => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hi! I'm your resume copilot. Ask me anything — improving a summary, structuring a bullet, tailoring to a job, or a full review. I can see your live resume.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    const res = await assistantAction({ resumeId, question: q });
    setBusy(false);
    setMessages((m) => [
      ...m,
      {
        role: "ai",
        text: res.success && res.data
          ? (res.data as string)
          : res.error ?? "Sorry, something went wrong. Try again.",
      },
    ]);
  };

  const quickAction = async (id: string) => {
    if (id === "ats" || id === "job") {
      onNavigateTo(id);
      return;
    }
    if (id === "summary") {
      onNavigateTo("summary", "generateSummary");
      return;
    }
    if (id === "skills") {
      onNavigateTo("skills", "suggestSkills");
      return;
    }
    await ask(PRESET_PROMPTS[id] ?? "");
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 24, x: 24 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 24, x: 24 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-3 right-3 top-[4.75rem] z-40 flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl sm:w-[380px]"
        >
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-500/30">
                <Sparkles className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-card" />
              </span>
              AI Copilot
            </span>
            <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close copilot">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-md bg-blue-500 text-white"
                      : "rounded-bl-md bg-muted/80 text-foreground/90"
                  )}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
            {busy ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            ) : null}
          </div>

          {messages.length <= 1 ? (
            <div className="px-4 pb-2">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Try a quick action
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => quickAction(a.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/5 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-500/10 disabled:opacity-50 dark:text-blue-300"
                  >
                    <a.icon className="h-3.5 w-3.5" />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(input);
            }}
            className="border-t border-border/70 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your resume…"
                className="h-10 flex-1 rounded-xl border border-input bg-background/70 px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <Button variant="gradient" size="icon" type="submit" disabled={busy || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
