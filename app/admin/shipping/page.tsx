import Link from "next/link";

import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";
import ShippingControlClient from "./ShippingControlClient";

export default async function AdminShippingPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: shipments, error } = await supabase
    .from("shipments")
    .select(
      "id,order_id,status,shipment_id,courier_name,courier_id,awb,tracking_url,label_url,shipping_charge,weight_grams,length_cm,width_cm,height_cm,created_at,updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:px-8">
        <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/50 dark:bg-zinc-900">
          <h1 className="text-xl font-bold text-zinc-950 dark:text-white">
            Unable to load shipping
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <header className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-600 dark:text-yellow-400">
                MineNote Admin
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                Shipping Control
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
                Prepare shipments automatically, review the final handoff,
                and explicitly authorize courier pickup.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300"
            >
              View Orders →
            </Link>
          </div>
        </header>

        <div className="mt-6">
          <ShippingControlClient
            initialShipments={shipments ?? []}
          />
        </div>
      </div>
    </main>
  );
}
