"use client";

import { useState } from "react";
import { Sparkles, Send, Loader2, FileText, Bot } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { assistantAction } from "@/actions/ai";
import { cn } from "@/lib/utils";

type ResumeOption = { id: string; title: string };
type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How can I improve my summary?",
  "What keywords should I add for a backend role?",
  "Are my bullets strong enough?",
  "Should I include my GPA?",
];

export function AssistantClient({ resumes }: { resumes: ResumeOption[] }) {
  const [resumeId, setResumeId] = useState<string>(resumes[0]?.id ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    if (!resumeId) {
      toast.error("Select a resume for context first.");
      return;
    }
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setBusy(true);
    const res = await assistantAction({ resumeId, question });
    setBusy(false);
    if (!res?.success) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${res?.error ?? "Request failed."}` }]);
      return;
    }
    setMessages((m) => [...m, { role: "assistant", content: String(res.data ?? "") }]);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
          <Sparkles className="h-6 w-6 text-blue-500" /> AI Assistant
        </h1>
        <p className="mt-1 text-muted-foreground">
          Ask anything about your resume — it answers using your real data, never inventing facts.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Context resume</Label>
        <Select value={resumeId} onValueChange={setResumeId}>
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Choose a resume" />
          </SelectTrigger>
          <SelectContent>
            {resumes.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {messages.length === 0 ? (
        <Card className="space-y-3 p-6">
          <p className="text-sm text-muted-foreground">Try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-xl border border-border bg-accent/40 px-3 py-2 text-left text-sm transition-colors hover:border-blue-500/50 hover:text-blue-500"
              >
                {s}
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "flex max-w-[85%] items-start gap-2.5 rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white"
                    : "border border-border bg-card"
                )}
              >
                {m.role === "assistant" ? (
                  <Bot className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                ) : (
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
                )}
                <span className="whitespace-pre-wrap">{m.content}</span>
              </div>
            </div>
          ))}
          {busy ? (
            <div className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> Thinking…
            </div>
          ) : null}
        </div>
      )}

      <div className="flex items-end gap-2">
        <Textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask about your resume… (Enter to send, Shift+Enter for a new line)"
          className="flex-1"
        />
        <Button onClick={() => send(input)} disabled={busy || !input.trim()} size="icon" className="h-10 w-10 shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
