import Link from "next/link";
import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

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

        <div className="mx-auto max-w-7xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            MineNote Admin
          </h1>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load dashboard
            </h2>

            <pre className="mt-4 whitespace-pre-wrap text-sm text-red-700">
              {error.message}
            </pre>
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
    },
    {
      label: "New Orders",
      value: placedOrders,
    },
    {
      label: "Processing",
      value: processingOrders,
    },
    {
      label: "Shipped",
      value: shippedOrders,
    },
    {
      label: "Delivered",
      value: deliveredOrders,
    },
    {
      label: "Paid Orders",
      value: paidOrders,
    },
    {
      label: "Cancelled",
      value: cancelledOrders,
    },
    {
      label: "Revenue",
      value: `₹${revenue.toLocaleString("en-IN")}`,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-600">
              MineNote Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Signed in as {user.email}
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="w-fit rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300"
          >
            View All Orders →
          </Link>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>

              <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {card.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-5">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Latest customer orders
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="text-sm font-medium text-yellow-600 hover:text-yellow-500"
            >
              View all
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Order
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Customer
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Total
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Payment
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${order.order_id}`}
                          className="font-semibold text-yellow-600 hover:underline"
                        >
                          {order.order_id}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {order.name}
                        </p>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {order.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        ₹{order.total.toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-zinc-900 dark:text-zinc-100">
                          {order.payment_method}
                        </p>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {order.payment_status}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium capitalize text-zinc-700 dark:text-zinc-300">
                          {order.order_status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(order.created_at).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                No orders yet
              </h3>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                New customer orders will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
