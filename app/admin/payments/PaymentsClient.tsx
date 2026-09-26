"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Payment = {
  id: string;
  order_id: string;
  name: string;
  email: string;
  total: number;
  payment_method: string;
  payment_status: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  refund_status: string | null;
  refund_id: string | null;
  refund_amount: number | null;
  created_at: string;
};

type Summary = {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  refunded: number;
  paid_value: number;
};

export default function PaymentsClient() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    paid: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    paid_value: 0,
  });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [resultCount, setResultCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/admin/payments?q=${encodeURIComponent(query)}`,
          { cache: "no-store" },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load payments.");
        }

        setPayments(data.payments ?? []);
        setResultCount(Number(data.result_count ?? 0));
        setSummary(data.summary ?? summary);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const cards = [
    ["Paid", summary.paid],
    ["Pending", summary.pending],
    ["Failed", summary.failed],
    ["Refunded", summary.refunded],
  ];

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 sm:py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                MineNote Admin
              </p>
              <h1 className="mt-3 text-3xl font-bold text-zinc-950 dark:text-white">
                Payments
              </h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Razorpay payment ledger, payment states, and refund visibility.
              </p>
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order, payment ID, customer..."
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white sm:w-96"
            />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Paid value
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
              ₹{summary.paid_value.toLocaleString("en-IN")}
            </p>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {query
                ? `${resultCount.toLocaleString("en-IN")} matching payment${resultCount === 1 ? "" : "s"}`
                : `${summary.total.toLocaleString("en-IN")} payment${summary.total === 1 ? "" : "s"} in ledger`}
            </p>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="min-w-full text-left">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                <tr>
                  {["Order", "Customer", "Amount", "Status", "Razorpay", "Refund"].map(
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
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-500">
                      Loading payments…
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-500">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/orders/${payment.order_id}`}
                          className="font-semibold text-zinc-900 underline-offset-4 hover:underline dark:text-white"
                        >
                          {payment.order_id}
                        </Link>
                        <p className="mt-1 text-xs text-zinc-500">
                          {new Date(payment.created_at).toLocaleDateString("en-IN")}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">
                          {payment.name}
                        </p>
                        <p className="text-xs text-zinc-500">{payment.email}</p>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold">
                        ₹{payment.total.toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold dark:bg-zinc-800 dark:text-zinc-200">
                          {payment.payment_status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs text-zinc-500">
                        {payment.razorpay_payment_id ? (
                          <span className="break-all">{payment.razorpay_payment_id}</span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-4 text-xs">
                        {payment.refund_status ? (
                          <span className="font-semibold">
                            {payment.refund_status}
                            {payment.refund_amount
                              ? ` · ₹${payment.refund_amount.toLocaleString("en-IN")}`
                              : ""}
                          </span>
                        ) : (
                          <span className="text-zinc-400">No refund</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
