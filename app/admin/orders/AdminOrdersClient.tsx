"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Order = {
  id: number;
  order_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  total: number;
  delivery: string;
  custom_cover_id?: string | null;
  created_at: string;
};

type Props = {
  orders: Order[];
};

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = ["paid", "pending", "failed"];
const PAYMENT_METHODS = ["Razorpay", "COD"];

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function orderStatusClass(status: string) {
  switch (status) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "shipped":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
    case "processing":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "confirmed":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300";
    case "cancelled":
      return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

function paymentStatusClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "failed":
      return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";
    default:
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
  }
}

function UnderlineLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex w-fit font-semibold text-zinc-900 dark:text-zinc-100 ${className}`}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-200 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
    </Link>
  );
}

export default function AdminOrdersClient({ orders }: Props) {
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");

  const metrics = useMemo(() => {
    const paid = orders.filter((order) => order.payment_status === "paid");
    const awaitingConfirmation = orders.filter(
      (order) =>
        order.payment_status === "paid" &&
        order.order_status === "placed",
    );
    const production = orders.filter(
      (order) =>
        order.payment_status === "paid" &&
        ["confirmed", "processing"].includes(order.order_status),
    );
    const shipping = orders.filter((order) =>
      ["shipped"].includes(order.order_status),
    );

    return {
      total: orders.length,
      paid: paid.length,
      awaitingConfirmation: awaitingConfirmation.length,
      production: production.length,
      shipping: shipping.length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.order_id.toLowerCase().includes(query) ||
        order.name.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.phone.toLowerCase().includes(query);

      const matchesOrderStatus =
        orderStatus === "all" || order.order_status === orderStatus;

      const matchesPaymentStatus =
        paymentStatus === "all" || order.payment_status === paymentStatus;

      const matchesPaymentMethod =
        paymentMethod === "all" || order.payment_method === paymentMethod;

      return (
        matchesSearch &&
        matchesOrderStatus &&
        matchesPaymentStatus &&
        matchesPaymentMethod
      );
    });
  }, [orders, search, orderStatus, paymentStatus, paymentMethod]);

  const hasFilters =
    search.trim() !== "" ||
    orderStatus !== "all" ||
    paymentStatus !== "all" ||
    paymentMethod !== "all";

  function clearFilters() {
    setSearch("");
    setOrderStatus("all");
    setPaymentStatus("all");
    setPaymentMethod("all");
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["All orders", metrics.total, "Everything received"],
          ["Paid", metrics.paid, "Payment confirmed"],
          [
            "Needs confirmation",
            metrics.awaitingConfirmation,
            "Paid + placed",
          ],
          ["Production", metrics.production, "Confirmed / processing"],
          ["Shipping", metrics.shipping, "Currently shipped"],
        ].map(([label, value, hint]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {value}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {hint}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Order control
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Find and manage orders
          </h2>
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label
              htmlFor="order-search"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Search
            </label>
            <input
              id="order-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Order ID, name, email or phone..."
              className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-yellow-950"
            />
          </div>

          <div>
            <label
              htmlFor="order-status"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Order status
            </label>
            <select
              id="order-status"
              value={orderStatus}
              onChange={(event) => setOrderStatus(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="all">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {titleCase(status)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="payment-status"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Payment
            </label>
            <select
              id="payment-status"
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="all">All payments</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {titleCase(status)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="payment-method"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Method
            </label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="all">All methods</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {orders.length}
            </span>{" "}
            orders
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:w-fit"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {filteredOrders.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Live order list
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Open an order to manage its complete lifecycle.
              </p>
            </div>

            <span className="text-xs font-medium text-zinc-400">
              {filteredOrders.length} visible
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Order
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Total
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Payment
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-100 transition hover:bg-zinc-50/80 last:border-0 dark:border-zinc-800 dark:hover:bg-zinc-950/70"
                  >
                    <td className="px-5 py-4 align-top">
                      <UnderlineLink
                        href={`/admin/orders/${order.order_id}`}
                        className="text-yellow-700 dark:text-yellow-400"
                      >
                        {order.order_id}
                      </UnderlineLink>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {order.delivery}
                        </span>

                        {order.custom_cover_id ? (
                          <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-[11px] font-semibold text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300">
                            Custom cover
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {order.name}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {order.email}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {order.phone}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        ₹{Number(order.total).toLocaleString("en-IN")}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <p className="text-sm text-zinc-800 dark:text-zinc-200">
                        {order.payment_method}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${paymentStatusClass(order.payment_status)}`}
                      >
                        {order.payment_status}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${orderStatusClass(order.order_status)}`}
                      >
                        {titleCase(order.order_status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-top text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(order.created_at).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Order control
          </p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {hasFilters ? "No matching orders" : "No orders yet"}
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {hasFilters
              ? "Try changing your search or filters."
              : "Orders will appear here after customers place them."}
          </p>
        </div>
      )}
    </div>
  );
}
