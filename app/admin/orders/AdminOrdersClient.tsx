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
  created_at: string;
};

type Props = {
  orders: Order[];
};

export default function AdminOrdersClient({ orders }: Props) {
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");

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
        orderStatus === "all" ||
        order.order_status === orderStatus;

      const matchesPaymentStatus =
        paymentStatus === "all" ||
        order.payment_status === paymentStatus;

      const matchesPaymentMethod =
        paymentMethod === "all" ||
        order.payment_method === paymentMethod;

      return (
        matchesSearch &&
        matchesOrderStatus &&
        matchesPaymentStatus &&
        matchesPaymentMethod
      );
    });
  }, [
    orders,
    search,
    orderStatus,
    paymentStatus,
    paymentMethod,
  ]);

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
    <>
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label
              htmlFor="order-search"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Search orders
            </label>

            <input
              id="order-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Order ID, name, email or phone..."
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
            />
          </div>

          <div>
            <label
              htmlFor="order-status"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Order status
            </label>

            <select
              id="order-status"
              value={orderStatus}
              onChange={(event) => setOrderStatus(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-yellow-400"
            >
              <option value="all">All statuses</option>
              <option value="placed">Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="payment-status"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Payment status
            </label>

            <select
              id="payment-status"
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-yellow-400"
            >
              <option value="all">All payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="payment-method"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Payment method
            </label>

            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-yellow-400"
            >
              <option value="all">All methods</option>
              <option value="Razorpay">Razorpay</option>
              <option value="COD">COD</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            Showing{" "}
            <span className="font-semibold text-zinc-900">
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-900">
              {orders.length}
            </span>{" "}
            orders
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-fit rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {filteredOrders.length > 0 ? (
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
              {filteredOrders.map((order) => (
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
                    ₹{order.total.toLocaleString("en-IN")}
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
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
                      {order.order_status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-zinc-500">
                    {new Date(order.created_at).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-zinc-900">
            {hasFilters ? "No matching orders" : "No orders yet"}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            {hasFilters
              ? "Try changing your search or filters."
              : "Orders will appear here after customers place them."}
          </p>
        </div>
      )}
    </>
  );
}
