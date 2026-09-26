import { requireAdmin } from "@/app/lib/admin-auth";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  await requireAdmin();
  return <SettingsClient />;
}
