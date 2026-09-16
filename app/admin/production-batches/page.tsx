import { requireAdmin } from "@/app/lib/admin-auth";
import ProductionBatchesClient from "./ProductionBatchesClient";

export default async function ProductionBatchesPage() {
  await requireAdmin();

  return <ProductionBatchesClient />;
}
