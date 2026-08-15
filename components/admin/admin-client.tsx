"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, FileText, Sparkles, KeyRound, ShieldCheck, Ban } from "lucide-react";
import { toast } from "sonner";
import { adminToggleTemplate, adminSetUserDisabled } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AdminStats = {
  totalUsers: number;
  totalResumes: number;
  aiRequests: number;
  activeSessions: number;
  templates: Array<{ id: string; name: string; slug: string; atsScore: number; isActive: boolean }>;
  recentRegistrations: Array<{ id: string; name: string; email: string; image: string | null; provider: string }>;
  templateUsage: Array<{ name: string; slug: string; count: number; atsScore: number; isActive: boolean }>;
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
}

export function AdminClient({ stats }: { stats: AdminStats }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleUserDisabled(userId: string, disabled: boolean) {
    startTransition(async () => {
      await adminSetUserDisabled({ userId, disabled });
      toast.success(disabled ? "User disabled." : "User enabled.");
      router.refresh();
    });
  }

  const statsCards = [
    { label: "Total users", value: stats.totalUsers, icon: Users },
    { label: "Resumes created", value: stats.totalResumes, icon: FileText },
    { label: "AI requests", value: stats.aiRequests, icon: Sparkles },
    { label: "Active sessions", value: stats.activeSessions, icon: KeyRound },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
          <ShieldCheck className="h-6 w-6 text-blue-500" /> Admin
        </h1>
        <p className="mt-1 text-muted-foreground">Platform overview and moderation tools.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Toggle template visibility and spot usage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.templateUsage.map((t) => (
              <div key={t.slug} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Used {t.count}× · ATS {t.atsScore}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  {t.isActive ? "Active" : "Hidden"}
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    defaultChecked={t.isActive}
                    onChange={(e) => {
                      const fd = new FormData();
                      fd.set("slug", t.slug);
                      fd.set("isActive", String(e.target.checked));
                      startTransition(async () => {
                        await adminToggleTemplate(fd);
                        toast.success("Template updated.");
                        router.refresh();
                      });
                    }}
                  />
                  <span className="relative h-6 w-11 rounded-full bg-border transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-background after:transition-all peer-checked:bg-blue-500 peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent registrations</CardTitle>
            <CardDescription>Latest accounts on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentRegistrations.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={u.image ?? undefined} alt={u.name} />
                    <AvatarFallback>{initials(u.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{u.provider}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => toggleUserDisabled(u.id, true)}
                  >
                    <Ban className="h-3.5 w-3.5" /> Disable
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
