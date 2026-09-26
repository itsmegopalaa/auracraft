"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

type Customer = {
  customer_id: string | null;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  pin: string;
  order_count: number;
  paid_order_count: number;
  lifetime_value: number;
  last_order_at: string;
  orders: Array<{
    id: string;
    order_id: string;
    total: number;
    payment_status: string;
    order_status: string;
    created_at: string;
  }>;
};

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  async function load() {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/customers?q=${encodeURIComponent(query)}`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load customers.");
      }

      setCustomers(data.customers ?? []);
    } catch (error) {
      console.error(error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 sm:py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            MineNote Admin
          </p>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Customers
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Customer directory derived from authenticated orders and
                purchase history.
              </p>
            </div>

            <div className="w-full sm:w-80">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, phone..."
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-yellow-900/30"
              />
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="min-w-full text-left">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                <tr>
                  {["Customer", "Contact", "Orders", "Lifetime", "Last order"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-500">
                      Loading customers…
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-500">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => {
                    const customerKey = `${customer.customer_id ?? customer.email}-${customer.phone}`;
                    const expanded = expandedCustomer === customerKey;

                    return (
                      <Fragment key={customerKey}>
                        <tr
                          key={customerKey}
                          className="cursor-pointer transition hover:bg-zinc-50 dark:hover:bg-zinc-950"
                          onClick={() =>
                            setExpandedCustomer(expanded ? null : customerKey)
                          }
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold text-zinc-900 dark:text-white">
                              {customer.name}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {customer.city}, {customer.state} {customer.pin}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-sm">
                            <p className="text-zinc-800 dark:text-zinc-200">
                              {customer.email || "—"}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {customer.phone || "—"}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold dark:bg-zinc-800 dark:text-zinc-200">
                              {customer.order_count}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-zinc-900 dark:text-white">
                            ₹{customer.lifetime_value.toLocaleString("en-IN")}
                          </td>

                          <td className="px-4 py-4 text-sm text-zinc-500">
                            {new Date(customer.last_order_at).toLocaleDateString("en-IN")}
                          </td>
                        </tr>

                        {expanded && (
                          <tr key={`${customerKey}-history`}>
                            <td
                              colSpan={5}
                              className="bg-zinc-50 px-4 py-4 dark:bg-zinc-950"
                            >
                              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="mb-3 flex items-center justify-between">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                                    Order history
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {customer.paid_order_count} paid
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  {customer.orders.map((order) => (
                                    <Link
                                      key={order.id}
                                      href={`/admin/orders/${order.order_id}`}
                                      onClick={(event) => event.stopPropagation()}
                                      className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                      <div>
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                          {order.order_id}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                          {new Date(order.created_at).toLocaleDateString("en-IN")}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-3 text-xs">
                                        <span className="text-zinc-500">
                                          {order.payment_status}
                                        </span>
                                        <span className="text-zinc-500">
                                          {order.order_status}
                                        </span>
                                        <span className="font-semibold text-zinc-900 dark:text-white">
                                          ₹{order.total.toLocaleString("en-IN")}
                                        </span>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
