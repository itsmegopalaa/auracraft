import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";
import AdminOrdersClient from "@/app/admin/orders/AdminOrdersClient";

export default async function AdminOrdersPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_id,
        name,
        email,
        phone,
        city,
        state,
        payment_method,
        payment_status,
        order_status,
        total,
        delivery,
        created_at
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 sm:py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-bold sm:text-2xl text-zinc-900 dark:text-zinc-100">
            MineNote Admin
          </h1>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load orders
            </h2>

            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm text-red-700">
              {JSON.stringify(
                {
                  message: error.message,
                  code: error.code,
                  details: error.details,
                  hint: error.hint,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 sm:py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl font-bold sm:text-2xl text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            MineNote Orders
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {orders?.length ?? 0} order
            {(orders?.length ?? 0) === 1 ? "" : "s"}
          </p>
        </div>

        <AdminOrdersClient orders={orders ?? []} />
      </div>
    </main>
  );
}
