import Link from "next/link";
import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

const statusStyles: Record<string, string> = {
  placed:
    "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300",
  confirmed:
    "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300",
  processing:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
  shipped:
    "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300",
  delivered:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  cancelled:
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300",
};

const statusDots: Record<string, string> = {
  placed: "bg-blue-500",
  confirmed: "bg-indigo-500",
  processing: "bg-amber-500",
  shipped: "bg-violet-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
};

export default async function AdminPage() {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, order_id, name, email, total, payment_method, payment_status, order_status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900/50 dark:bg-zinc-900 sm:rounded-3xl sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                !
              </div>

              <div>
                <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Unable to load dashboard
                </h1>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  There was a problem loading your orders.
                </p>

                <pre className="mt-4 overflow-x-auto rounded-xl bg-red-50 p-4 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  {error.message}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const allOrders = orders ?? [];

  const totalOrders = allOrders.length;

  const placedOrders = allOrders.filter(
    (order) => order.order_status === "placed"
  ).length;

  const processingOrders = allOrders.filter(
    (order) => order.order_status === "processing"
  ).length;

  const shippedOrders = allOrders.filter(
    (order) => order.order_status === "shipped"
  ).length;

  const deliveredOrders = allOrders.filter(
    (order) => order.order_status === "delivered"
  ).length;

  const cancelledOrders = allOrders.filter(
    (order) => order.order_status === "cancelled"
  ).length;

  const paidOrders = allOrders.filter(
    (order) => order.payment_status === "paid"
  ).length;

  const revenue = allOrders
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + order.total, 0);

  const recentOrders = allOrders.slice(0, 8);

  const cards = [
    {
      label: "Total Orders",
      value: totalOrders,
      description: "All orders",
      icon: "↗",
      className:
        "border-zinc-200 dark:border-zinc-800",
    },
    {
      label: "New Orders",
      value: placedOrders,
      description: "Awaiting confirmation",
      icon: "●",
      className:
        "border-blue-200/80 dark:border-blue-900/50",
    },
    {
      label: "Processing",
      value: processingOrders,
      description: "Being prepared",
      icon: "◌",
      className:
        "border-amber-200/80 dark:border-amber-900/50",
    },
    {
      label: "Shipped",
      value: shippedOrders,
      description: "On the way",
      icon: "→",
      className:
        "border-violet-200/80 dark:border-violet-900/50",
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      description: "Successfully delivered",
      icon: "✓",
      className:
        "border-emerald-200/80 dark:border-emerald-900/50",
    },
    {
      label: "Paid Orders",
      value: paidOrders,
      description: "Payments received",
      icon: "₹",
      className:
        "border-emerald-200/80 dark:border-emerald-900/50",
    },
    {
      label: "Cancelled",
      value: cancelledOrders,
      description: "Cancelled orders",
      icon: "×",
      className:
        "border-red-200/80 dark:border-red-900/50",
    },
    {
      label: "Revenue",
      value: `₹${revenue.toLocaleString("en-IN")}`,
      description: "From paid orders",
      icon: "₹",
      className:
        "border-yellow-300/80 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-500/5",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
        {/* Header */}
        <header className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-3xl sm:p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-600 dark:text-yellow-400">
                  MineNote Admin
                </p>
              </div>

              <h1 className="mt-3 text-xl font-bold sm:text-2xl tracking-tight text-zinc-950 dark:text-white sm:text-3xl md:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Welcome back. Here&apos;s what&apos;s happening with your
                store.
              </p>

              <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                Signed in as{" "}
                <span className="font-medium text-zinc-600 dark:text-zinc-300">
                  {user.email}
                </span>
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-yellow-300 hover:shadow-md sm:w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              View All Orders
              <span className="ml-2 text-base">→</span>
            </Link>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`group rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900 sm:p-5 ${card.className}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">
                  {card.label}
                </p>

                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {card.icon}
                </span>
              </div>

              <p className="mt-4 text-xl font-bold sm:text-2xl tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                {card.value}
              </p>

              <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500 sm:text-xs">
                {card.description}
              </p>
            </div>
          ))}
        </section>

        {/* Recent Orders */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 md:p-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                  Recent Orders
                </h2>

                <span className="rounded-full bg-zinc-100 px-3 min-h-10.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {recentOrders.length}
                </span>
              </div>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Your latest customer orders
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-yellow-600 transition hover:text-yellow-500 dark:text-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              View all →
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/60">
                  <tr>
                    {[
                      "Order",
                      "Customer",
                      "Total",
                      "Payment",
                      "Status",
                      "Date",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => {
                    const status = order.order_status;
                    const statusClass =
                      statusStyles[status] ??
                      "bg-zinc-100 text-zinc-700 ring-zinc-600/20 dark:bg-zinc-800 dark:text-zinc-300";
                    const dotClass =
                      statusDots[status] ?? "bg-zinc-500";

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-zinc-100 transition hover:bg-zinc-50/70 last:border-0 dark:border-zinc-800 dark:hover:bg-zinc-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/orders/${order.order_id}`}
                            className="font-semibold text-yellow-600 transition hover:text-yellow-500 hover:underline dark:text-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                          >
                            {order.order_id}
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[220px] truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {order.name}
                          </p>

                          <p className="mt-0.5 max-w-[220px] truncate text-xs text-zinc-400 dark:text-zinc-500">
                            {order.email}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          ₹{order.total.toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-zinc-800 dark:text-zinc-200">
                            {order.payment_method}
                          </p>

                          <p className="mt-0.5 text-xs capitalize text-zinc-400 dark:text-zinc-500">
                            {order.payment_status}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${statusClass}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
                            />
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                          {new Date(order.created_at).toLocaleString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-12 text-center sm:px-6 sm:py-16">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-lg text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                ○
              </div>

              <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">
                No orders yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                New customer orders will appear here automatically.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
