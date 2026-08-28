import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, price, description, category, image, stock, active, theme, badge, featured, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <header className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <p className="text-sm font-medium text-yellow-600">
            MineNote Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Products
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your notebook catalog, pricing, stock, and availability.
          </p>
        </header>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load products
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error.message}
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <AdminProductsClient products={products ?? []} />
          </div>
        )}
      </div>
    </main>
  );
}
