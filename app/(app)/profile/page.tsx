import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ProfileClient } from "@/components/profile/profile-client";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return <ProfileClient user={user} />;
}
