"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  PRODUCT_PRODUCTION_SIDES,
  type ProductProductionSide,
} from "@/app/lib/product-production-assets";
import {
  getNotebookSheetForSide,
  getNotebookSheetSide,
} from "@/app/lib/notebook-physical-model";

type TemplateAsset = {
  id: string;
  template_id: string;
  side: ProductProductionSide | null;
  storage_path: string;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  signedUrl: string | null;
};

type Template = {
  id: string;
  template_key: string;
  version: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "retired" | string;
  locked: boolean;
  required_elements: unknown;
  assets: TemplateAsset[];
  complete: boolean;
};

const SIDE_LABELS: Record<ProductProductionSide, string> = {
  front: "Front",
  insideFront: "Inside Front",
  insideBack: "Inside Back",
  back: "Back",
};

function sideLabel(side: ProductProductionSide) {
  return SIDE_LABELS[side];
}

export default function MineNoteProductionTemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySide, setBusySide] =
    useState<ProductProductionSide | null>(null);
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileRefs = useRef<
    Partial<Record<ProductProductionSide, HTMLInputElement | null>>
  >({});

  const template = useMemo(
    () =>
      templates.find(
        (item) =>
          item.template_key === "minenote-notebook" &&
          item.version === "v1",
      ) ?? templates[0] ?? null,
    [templates],
  );

  async function loadTemplates() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/admin/production-templates",
        {
          cache: "no-store",
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Unable to load production templates.",
        );
      }

      setTemplates(payload.templates ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load production templates.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTemplates();
  }, []);

  async function uploadSide(
    side: ProductProductionSide,
    file: File,
  ) {
    if (!template) return;

    setBusySide(side);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("side", side);
      formData.append("file", file);

      const response = await fetch(
        `/api/admin/production-templates/${template.id}/assets`,
        {
          method: "POST",
          body: formData,
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            `Unable to upload ${sideLabel(side)} artwork.`,
        );
      }

      setMessage(`${sideLabel(side)} artwork saved.`);
      await loadTemplates();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : `Unable to upload ${sideLabel(side)} artwork.`,
      );
    } finally {
      setBusySide(null);
    }
  }

  async function deleteSide(
    side: ProductProductionSide,
  ) {
    if (!template) return;

    setBusySide(side);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/production-templates/${template.id}/assets`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ side }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            `Unable to remove ${sideLabel(side)} artwork.`,
        );
      }

      setMessage(`${sideLabel(side)} artwork removed.`);
      await loadTemplates();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : `Unable to remove ${sideLabel(side)} artwork.`,
      );
    } finally {
      setBusySide(null);
    }
  }

  async function lockTemplate() {
    if (!template || template.locked) return;

    if (template.status !== "draft") {
      setError(
        "Only a draft MineNote production template can be locked.",
      );
      return;
    }

    if (!template.complete || template.assets.length !== 4) {
      setError(
        "All four canonical production sides must be configured before locking.",
      );
      return;
    }

    const confirmed = window.confirm(
      "Lock and activate MineNote Production Template v1?\n\nAfter locking, the template and its four production assets become immutable. Future changes must use a new template version.",
    );

    if (!confirmed) return;

    setLocking(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/production-templates/${template.id}/lock`,
        {
          method: "POST",
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Unable to lock the MineNote production template.",
        );
      }

      setMessage(
        "MineNote Production Template v1 is now active and locked.",
      );
      await loadTemplates();
    } catch (lockError) {
      setError(
        lockError instanceof Error
          ? lockError.message
          : "Unable to lock the MineNote production template.",
      );
    } finally {
      setLocking(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-sm text-zinc-500">
          Loading MineNote production template…
        </p>
      </section>
    );
  }

  if (!template) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          MineNote Production Template
        </h3>
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
          No MineNote production template exists yet. Apply the
          production-template migrations before uploading artwork.
        </p>
      </section>
    );
  }

  return (
    <section className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              MineNote Production Template
            </h3>
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              {template.version}
            </span>
          </div>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            Permanent four-side production artwork used as the
            MineNote-owned template layer. This is separate from
            customer-facing product imagery.
          </p>
        </div>

        <span
          className={[
            "inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold",
            template.complete
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300"
              : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300",
          ].join(" ")}
        >
          {template.assets.length} / 4 configured
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {template.locked
              ? "Production template is immutable"
              : template.complete
                ? "Template is ready to be activated"
                : "Complete all four production sides before activation"}
          </p>
          <p className="mt-0.5 text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
            {template.locked
              ? "Locked artwork cannot be replaced or removed. Create a new version for future changes."
              : "Locking activates this exact artwork set as the permanent MineNote production template."}
          </p>
        </div>

        {template.locked ? (
          <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300">
            🔒 Active · Immutable
          </span>
        ) : (
          <button
            type="button"
            disabled={
              locking ||
              template.status !== "draft" ||
              !template.complete ||
              template.assets.length !== 4
            }
            onClick={() => void lockTemplate()}
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {locking
              ? "Locking…"
              : "🔒 Lock & Activate Template"}
          </button>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        {PRODUCT_PRODUCTION_SIDES.map((side) => {
          const asset =
            template.assets.find(
              (item) => item.side === side,
            ) ?? null;

          const sheet = getNotebookSheetForSide(side);
          const sheetSide = getNotebookSheetSide(side);
          const busy = busySide === side;

          return (
            <div
              key={side}
              className="flex flex-col gap-4 border-b border-zinc-200 p-4 last:border-b-0 dark:border-zinc-800 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {sideLabel(side)}
                  </span>

                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {sheet.label} ·{" "}
                    {sheetSide === "front"
                      ? "Front"
                      : "Reverse"}
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {asset
                    ? `${asset.mime_type ?? "Image"}${
                        asset.width && asset.height
                          ? ` · ${asset.width}×${asset.height}`
                          : ""
                      }`
                    : "No artwork configured"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {asset?.signedUrl ? (
                  <a
                    href={asset.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Preview
                  </a>
                ) : null}

                {!template.locked &&
                template.status === "draft" ? (
                  <>
                    <input
                      ref={(element) => {
                        fileRefs.current[side] = element;
                      }}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file =
                          event.target.files?.[0];

                        event.target.value = "";

                        if (file) {
                          void uploadSide(side, file);
                        }
                      }}
                    />

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        fileRefs.current[side]?.click()
                      }
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {busy
                        ? "Saving…"
                        : asset
                          ? "Replace"
                          : "Upload"}
                    </button>

                    {asset ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void deleteSide(side)}
                        className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        Remove
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>
          Status:{" "}
          <strong className="text-zinc-700 dark:text-zinc-200">
            {template.status}
          </strong>
        </span>
        <span>•</span>
        <span>
          {template.locked
            ? "Locked"
            : "Editable draft"}
        </span>
        <span>•</span>
        <span>
          Physical order: Front · Inside Front · Inside Back ·
          Back
        </span>
      </div>

      {message ? (
        <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </section>
  );
}
