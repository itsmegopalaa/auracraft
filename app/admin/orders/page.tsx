import Link from "next/link";
import { requireAdmin } from "@/app/lib/admin-auth";
import { createClient } from "@/utils/supabase/server";

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
    <main className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-zinc-900">
          MineNote Admin
        </h1>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
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
    <main className="min-h-screen bg-zinc-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">
            MineNote Orders
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {orders?.length ?? 0} order
            {(orders?.length ?? 0) === 1 ? "" : "s"}
          </p>
        </div>

        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold">
                    Order
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold">
                    Total
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 text-sm font-semibold">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.order_id}`}
                        className="font-semibold text-yellow-600 hover:text-yellow-500 hover:underline"
                      >
                        {order.order_id}
                      </Link>

                      <p className="text-xs text-zinc-500">
                        {order.delivery}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900">
                        {order.name}
                      </p>

                      <p className="text-sm text-zinc-500">
                        {order.email}
                      </p>

                      <p className="text-xs text-zinc-500">
                        {order.phone}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      ₹{order.total}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm">
                        {order.payment_method}
                      </p>

                      <p className="text-xs text-zinc-500">
                        {order.payment_status}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                        {order.order_status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-500">
                      {new Date(order.created_at).toLocaleString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-zinc-900">
              No orders yet
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Orders will appear here after customers place them.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
