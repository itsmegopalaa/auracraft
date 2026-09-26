"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  OrientationIcon,
  PaperIcon,
  SizeIcon,
} from "@/app/components/PhysicalConfigVisuals";

type Props = {
  size: "A4" | "A5";
  setSize: Dispatch<SetStateAction<"A4" | "A5">>;
  orientation: "portrait" | "landscape";
  setOrientation: Dispatch<SetStateAction<"portrait" | "landscape">>;
  paper: "plain" | "ruled" | "dotGrid";
  setPaper: Dispatch<SetStateAction<"plain" | "ruled" | "dotGrid">>;
};

const paperOptions = [
  {
    value: "plain" as const,
    label: "Plain",
    description: "Blank pages",
  },
  {
    value: "ruled" as const,
    label: "Ruled",
    description: "Classic lines",
  },
  {
    value: "dotGrid" as const,
    label: "Dot Grid",
    description: "Creative layout",
  },
];

function optionClass(selected: boolean) {
  return [
    "group relative rounded-2xl border p-3 text-left",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-[var(--mn-focus)]",
    selected
      ? "border-[var(--mn-accent)] bg-[var(--mn-accent)]/[0.07] shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
      : "border-[var(--mn-border)] bg-[var(--mn-surface)] hover:border-[var(--mn-accent)]/50 hover:bg-[var(--mn-accent)]/[0.025]",
  ].join(" ");
}

function Check({ selected }: { selected: boolean }) {
  return (
    <span
      className={[
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-black transition-all",
        selected
          ? "border-[var(--mn-accent)] bg-[var(--mn-accent)] text-white"
          : "border-[var(--mn-border)] bg-transparent text-transparent",
      ].join(" ")}
    >
      ✓
    </span>
  );
}

export default function ProductPhysicalOptions({
  size,
  setSize,
  orientation,
  setOrientation,
  paper,
  setPaper,
}: Props) {
  return (
    <div className="space-y-7">
      {/* SIZE */}
      <section>
        <div className="mb-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--mn-text-secondary)]">
            Size
          </p>
          <p className="mt-1 text-xs text-[var(--mn-text-muted)]">
            Choose your notebook format
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(["A4", "A5"] as const).map((value) => {
            const selected = size === value;

            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setSize(value)}
                className={optionClass(selected)}
              >
                <div className="flex items-center gap-3">
                  <SizeIcon value={value} />

                  <div className="min-w-0 flex-1">
                    <span
                      className={[
                        "block text-sm font-black",
                        selected
                          ? "text-[var(--mn-accent)]"
                          : "text-[var(--mn-text)]",
                      ].join(" ")}
                    >
                      {value}
                    </span>

                    <span className="mt-0.5 block text-xs text-[var(--mn-text-muted)]">
                      {value === "A4"
                        ? "Standard notebook"
                        : "Compact diary size"}
                    </span>
                  </div>

                  <Check selected={selected} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ORIENTATION */}
      <section>
        <div className="mb-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--mn-text-secondary)]">
            Orientation
          </p>
          <p className="mt-1 text-xs text-[var(--mn-text-muted)]">
            Select how your notebook opens
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(["portrait", "landscape"] as const).map((value) => {
            const selected = orientation === value;
            const label =
              value === "portrait" ? "Portrait" : "Landscape";

            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setOrientation(value)}
                className={optionClass(selected)}
              >
                <div className="flex items-center gap-3">
                  <OrientationIcon value={value} />

                  <span
                    className={[
                      "flex-1 text-sm font-bold",
                      selected
                        ? "text-[var(--mn-accent)]"
                        : "text-[var(--mn-text)]",
                    ].join(" ")}
                  >
                    {label}
                  </span>

                  <Check selected={selected} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* PAPER */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--mn-text-secondary)]">
              Paper
            </p>
            <p className="mt-1 text-xs text-[var(--mn-text-muted)]">
              See the page style before you order
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-[var(--mn-border)] px-2.5 py-1 text-[10px] font-bold text-[var(--mn-text-secondary)]">
            80 GSM
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {paperOptions.map((option) => {
            const selected = paper === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setPaper(option.value)}
                className={[
                  "group relative rounded-2xl border p-2 text-left",
                  "transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[var(--mn-focus)]",
                  selected
                    ? "border-[var(--mn-accent)] bg-[var(--mn-accent)]/[0.07] shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                    : "border-[var(--mn-border)] bg-[var(--mn-surface)] hover:border-[var(--mn-accent)]/50",
                ].join(" ")}
              >
                <PaperIcon value={option.value} size="lg" />

                <div className="px-1 pb-1 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={[
                        "text-sm font-black",
                        selected
                          ? "text-[var(--mn-accent)]"
                          : "text-[var(--mn-text)]",
                      ].join(" ")}
                    >
                      {option.label}
                    </span>

                    <Check selected={selected} />
                  </div>

                  <span className="mt-1 block text-[11px] text-[var(--mn-text-muted)]">
                    {option.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
