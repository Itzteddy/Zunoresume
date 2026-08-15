import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAdminStats } from "@/actions/admin";
import { AdminClient } from "@/components/admin/admin-client";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  await requireAdmin();
  const stats = await getAdminStats();

  return <AdminClient stats={stats} />;
}
