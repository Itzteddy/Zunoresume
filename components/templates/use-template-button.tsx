"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { createResumeWithTemplate } from "@/actions/resume";
import { Button } from "@/components/ui/button";

export function UseTemplateButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const result = await createResumeWithTemplate(slug);
      if (result.ok) {
        router.push(result.url);
      } else {
        router.push(result.loginUrl);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button size="lg" onClick={handleClick} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {loading ? "Creating…" : "Use this template"}
    </Button>
  );
}
