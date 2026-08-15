import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2, ScanSearch, Sparkles, LayoutTemplate, FileText, TrendingUp, Rocket, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listResumes } from "@/services/resume";
import { TEMPLATES } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResumeCard, type ResumeListItem } from "@/components/resumes/resume-card";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const user = await requireUser();
  const { welcome } = await searchParams;
  const resumes = await listResumes(user.id);

  const firstName = user.name.split(" ")[0] ?? "there";
  const avgAts = resumes.length
    ? Math.round(resumes.reduce((sum, r) => sum + (r.atsScore ?? 0), 0) / resumes.length)
    : null;

  const stats = [
    { label: "Resumes", value: resumes.length, icon: FileText, color: "text-blue-500" },
    { label: "Avg ATS score", value: avgAts ?? "—", icon: TrendingUp, color: "text-emerald-500" },
    { label: "Templates", value: TEMPLATES.length, icon: LayoutTemplate, color: "text-violet-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {welcome === "1" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
            <Rocket className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Welcome to Zuno, {firstName}!</p>
            <p className="text-sm text-muted-foreground">
              Choose a template to create your first resume — it only takes minutes.
            </p>
          </div>
          <Button asChild size="sm" className="ml-auto">
            <Link href="/templates">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}

      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening with your resumes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </span>
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ActionCard
          href="/templates"
          icon={FilePlus2}
          title="New Resume"
          desc="Pick a template and start building"
          gradient="from-blue-600 to-cyan-500"
        />
        <ActionCard
          href="/analyze"
          icon={ScanSearch}
          title="Analyze a Resume"
          desc="Upload a PDF and get an ATS report"
          gradient="from-violet-600 to-indigo-500"
        />
        <ActionCard
          href="/assistant"
          icon={Sparkles}
          title="AI Assistant"
          desc="Rewrite, generate, or get feedback"
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent resumes</h2>
          {resumes.length > 0 ? (
            <Link href="/resumes" className="text-sm font-medium text-blue-500 hover:text-blue-400">
              View all
            </Link>
          ) : null}
        </div>

        {resumes.length === 0 ? (
          <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/15 to-cyan-500/15 text-blue-500">
              <FileText className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">No resumes yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first professional resume with one of our 10 ATS-friendly templates.
            </p>
            <Button asChild className="mt-5">
              <Link href="/templates">
                <FilePlus2 className="h-4 w-4" /> Create your first resume
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumes.slice(0, 6).map((r) => (
              <ResumeCard key={r.id} resume={r as ResumeListItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  desc,
  gradient,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/10"
    >
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`} />
      <span className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white`}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
