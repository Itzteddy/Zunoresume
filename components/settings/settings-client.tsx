"use client";

import { useActionState, useState } from "react";
import { Settings2, Moon, Sun, Monitor, Bell, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { updateSettingsAction } from "@/actions/profile";
import { SubmitButton } from "@/components/auth/auth-card";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SettingsData = {
  theme: "light" | "dark" | "system";
  notifyResumeTips: boolean;
  notifyNewsletter: boolean;
};

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function SettingsClient({ settings }: { settings: SettingsData | null }) {
  const [theme, setTheme] = useState<SettingsData["theme"]>(settings?.theme ?? "system");
  const [state, action] = useActionState(updateSettingsAction, null);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
          <Settings2 className="h-6 w-6 text-blue-500" /> Settings
        </h1>
        <p className="mt-1 text-muted-foreground">Customize your Zuno experience.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-blue-500" /> Appearance
          </CardTitle>
          <CardDescription>Choose how Zuno looks for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              document.cookie = `zuno_theme=${theme};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
              const root = document.documentElement;
              const resolved =
                theme === "system"
                  ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
                  : theme;
              root.classList.toggle("dark", resolved === "dark");
              root.style.colorScheme = resolved;
              toast.success("Appearance updated.");
            }}
          >
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((t) => {
                const Icon = t.icon;
                const active = theme === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
                      active
                        ? "border-blue-500 bg-blue-500/10 text-blue-500"
                        : "border-border hover:border-blue-500/40"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Appearance is saved to your device. Saved with your account below.
            </p>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-500" /> Preferences
          </CardTitle>
          <CardDescription>Saved to your account and synced across devices.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            {state?.error ? (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
              </div>
            ) : null}
            {state?.success ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {state.message}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-3">
                {THEMES.map((t) => (
                  <label
                    key={t.value}
                    className={cn(
                      "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all",
                      theme === t.value
                        ? "border-blue-500 bg-blue-500/10 text-blue-500"
                        : "border-border hover:border-blue-500/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={t.value}
                      checked={theme === t.value}
                      onChange={() => setTheme(t.value)}
                      className="sr-only"
                    />
                    <t.icon className="h-4 w-4" /> {t.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-accent/40 px-4 py-3">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Resume improvement tips</p>
                    <p className="text-xs text-muted-foreground">
                      Occasional tips to boost your ATS score.
                    </p>
                  </div>
                </div>
                <SwitchInput
                  name="notifyResumeTips"
                  checked={settings?.notifyResumeTips ?? true}
                />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-accent/40 px-4 py-3">
                <div className="flex items-start gap-3">
                  <Bell className="mt-0.5 h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Newsletter</p>
                    <p className="text-xs text-muted-foreground">
                      Monthly career advice and product updates.
                    </p>
                  </div>
                </div>
                <SwitchInput
                  name="notifyNewsletter"
                  checked={settings?.notifyNewsletter ?? false}
                />
              </div>
            </div>

            <SubmitButton>Save preferences</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SwitchInput({ name, checked }: { name: string; checked: boolean }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        value="on"
        className="peer sr-only"
      />
      <span className="peer h-6 w-11 rounded-full bg-border transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-background after:transition-all peer-checked:bg-blue-500 peer-checked:after:translate-x-5" />
    </label>
  );
}
