import { requireAdmin } from "@/app/lib/admin-auth";
import CustomersClient from "./CustomersClient";

export default async function AdminCustomersPage() {
  await requireAdmin();
  return <CustomersClient />;
}
