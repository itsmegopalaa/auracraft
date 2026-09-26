import { requireAdmin } from "@/app/lib/admin-auth";
import PaymentsClient from "./PaymentsClient";

export default async function AdminPaymentsPage() {
  await requireAdmin();
  return <PaymentsClient />;
}
