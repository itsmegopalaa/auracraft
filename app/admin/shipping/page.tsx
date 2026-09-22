import Link from "next/link";
import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

export default async function AdminShippingPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: shipments, error } = await supabase
    .from("shipments")
    .select(
      "id, order_id, courier_name, courier_id, awb, tracking_url, shipping_charge, weight, length, width, height, status, created_at, updated_at"
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

  const rows = shipments ?? [];
  const ready = rows.filter((shipment) => shipment.status === "ready_for_pickup");
  const active = rows.filter(
    (shipment) =>
      shipment.status !== "delivered" &&
      shipment.status !== "cancelled"
  );

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
                Shipping
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Monitor shipments and orders ready for carrier pickup.
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

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total shipments</p>
            <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">{rows.length}</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-500/5">
            <p className="text-xs text-amber-700 dark:text-amber-400">Ready for pickup</p>
            <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">{ready.length}</p>
          </div>

          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 shadow-sm dark:border-violet-900/50 dark:bg-violet-500/5">
            <p className="text-xs text-violet-700 dark:text-violet-400">Active shipments</p>
            <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">{active.length}</p>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
              Shipment Queue
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Shipping data from the existing fulfillment system.
            </p>
          </div>

          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <tr>
                    {["Order", "Courier", "AWB", "Status", "Charge", "Updated"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${shipment.order_id}`}
                          className="font-semibold text-yellow-600 hover:underline dark:text-yellow-400"
                        >
                          {shipment.order_id}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-700 dark:text-zinc-200">
                        {shipment.courier_name || shipment.courier_id || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        {shipment.awb || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {(shipment.status || "unknown").replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-700 dark:text-zinc-200">
                        {shipment.shipping_charge != null
                          ? `₹${Number(shipment.shipping_charge).toLocaleString("en-IN")}`
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {shipment.updated_at
                          ? new Date(shipment.updated_at).toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              <div className="text-3xl">🚚</div>
              <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">
                No shipments yet
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Shipments will appear here when fulfillment begins.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
