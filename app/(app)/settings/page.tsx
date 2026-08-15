import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/actions/profile";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getSettings();

  return (
    <SettingsClient
      settings={
        settings
          ? {
              theme: settings.theme as "light" | "dark" | "system",
              notifyResumeTips: settings.notifyResumeTips,
              notifyNewsletter: settings.notifyNewsletter,
            }
          : null
      }
    />
  );
}
