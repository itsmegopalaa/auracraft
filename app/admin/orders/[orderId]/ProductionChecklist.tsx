"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Checklist = {
  product_printed: boolean;
  cover_verified: boolean;
  notebook_assembled: boolean;
  quality_checked: boolean;
  packed: boolean;
};

type Props = {
  orderId: string;
  checklist: Checklist;
  shipmentStatus: string | null;
};

const ITEMS: {
  field: keyof Checklist;
  label: string;
}[] = [
  { field: "product_printed", label: "Product printed" },
  { field: "cover_verified", label: "Cover verified" },
  { field: "notebook_assembled", label: "Notebook assembled" },
  { field: "quality_checked", label: "Quality checked" },
  { field: "packed", label: "Packed" },
];

export default function ProductionChecklist({
  orderId,
  checklist: initialChecklist,
  shipmentStatus,
}: Props) {
  const router = useRouter();

  const [checklist, setChecklist] = useState(initialChecklist);
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function toggle(field: keyof Checklist) {
    const nextValue = !checklist[field];

    setLoadingField(field);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/production-checklist`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            field,
            value: nextValue,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to update production checklist.",
        );
      }

      setChecklist((current) => ({
        ...current,
        [field]: nextValue,
      }));

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update production checklist.",
      );
    } finally {
      setLoadingField(null);
    }
  }

  const productionCompleted = ITEMS.filter(
    ({ field }) => checklist[field],
  ).length;

  const allComplete = productionCompleted === ITEMS.length;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Production Checklist
          </h3>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {productionCompleted} of {ITEMS.length} production steps completed
          </p>
        </div>

        <span
          className={`text-sm font-medium ${
            allComplete
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {allComplete ? "Production complete" : "Production in progress"}
        </span>
      </div>

      <div className="space-y-3">
        {ITEMS.map(({ field, label }) => {
          const checked = checklist[field];
          const loading = loadingField === field;

          return (
            <button
              key={field}
              type="button"
              onClick={() => toggle(field)}
              disabled={loading}
              className="flex min-h-14 w-full items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-wait disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${
                  checked
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-zinc-300 dark:border-zinc-600"
                }`}
              >
                {checked ? "✓" : ""}
              </span>

              <span
                className={`text-sm font-medium ${
                  checked
                    ? "text-zinc-500 line-through dark:text-zinc-500"
                    : "text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {allComplete && (
        <div className="mt-5 rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-4">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Production complete ✓
          </p>

          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            All five production steps are complete. Shipping automation can
            now create the courier shipment.
          </p>

          <div className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Shipping: {shipmentStatus ?? "Preparing automatically"}
          </div>
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {message}
        </p>
      )}
    </div>
  );
}
