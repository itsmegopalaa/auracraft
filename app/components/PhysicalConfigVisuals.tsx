"use client";

type Size = "A4" | "A5";
type Orientation = "portrait" | "landscape";
type Paper = "plain" | "ruled" | "dotGrid";

const base =
  "shrink-0 text-[var(--mn-accent)] transition-all duration-200";

export function SizeIcon({
  value,
  size = "md",
}: {
  value: Size;
  size?: "sm" | "md" | "lg";
}) {
  const dimensions =
    value === "A4"
      ? { x: 12, y: 5, w: 24, h: 38 }
      : { x: 15, y: 8, w: 18, h: 32 };

  const cls =
    size === "sm"
      ? "h-7 w-7"
      : size === "lg"
        ? "h-12 w-12"
        : "h-9 w-9";

  return (
    <svg viewBox="0 0 48 48" className={`${cls} ${base}`} fill="none">
      <rect
        x={dimensions.x}
        y={dimensions.y}
        width={dimensions.w}
        height={dimensions.h}
        rx="3"
        className="fill-[var(--mn-surface)]"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M18 18h12M18 23h9M18 28h11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        className="opacity-30"
      />
      <path
        d="M8 5h6M8 5v6M40 43h-6M40 43v-6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        className="opacity-20"
      />
    </svg>
  );
}

export function OrientationIcon({
  value,
  size = "md",
}: {
  value: Orientation;
  size?: "sm" | "md" | "lg";
}) {
  const cls =
    size === "sm"
      ? "h-7 w-7"
      : size === "lg"
        ? "h-12 w-12"
        : "h-9 w-9";

  const portrait = value === "portrait";

  return (
    <svg viewBox="0 0 48 48" className={`${cls} ${base}`} fill="none">
      <rect
        x={portrait ? 14 : 7}
        y={portrait ? 7 : 14}
        width={portrait ? 20 : 34}
        height={portrait ? 34 : 20}
        rx="3"
        className="fill-[var(--mn-surface)]"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d={portrait ? "M19 17h10M19 22h7M19 27h9" : "M13 22h22M13 27h17"}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        className="opacity-30"
      />
    </svg>
  );
}

export function PaperIcon({
  value,
  size = "md",
}: {
  value: Paper;
  size?: "sm" | "md" | "lg";
}) {
  const cls =
    size === "sm"
      ? "h-8 w-8"
      : size === "lg"
        ? "h-16 w-full"
        : "h-12 w-full";

  return (
    <div
      className={[
        cls,
        "overflow-hidden rounded-lg border border-[var(--mn-border)]",
        "bg-white shadow-inner",
      ].join(" ")}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 160 70"
        className="h-full w-full"
        fill="none"
        preserveAspectRatio="none"
      >
        <rect width="160" height="70" fill="white" />

        {value === "plain" && (
          <>
            <path
              d="M35 24h90M35 34h70M35 44h82"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              className="text-black/[0.045]"
            />
            <text
              x="80"
              y="58"
              textAnchor="middle"
              fontSize="6"
              letterSpacing="1.5"
              fill="currentColor"
              className="text-black/20"
            >
              BLANK
            </text>
          </>
        )}

        {value === "ruled" && (
          <>
            {[14, 24, 34, 44, 54].map((y) => (
              <path
                key={y}
                d={`M18 ${y}H142`}
                stroke="currentColor"
                strokeWidth="1"
                className="text-[var(--mn-accent)]/20"
              />
            ))}
            <path
              d="M29 10V60"
              stroke="currentColor"
              strokeWidth="1"
              className="text-black/[0.04]"
            />
          </>
        )}

        {value === "dotGrid" && (
          <>
            <defs>
              <pattern
                id="minenote-dot-grid"
                width="12"
                height="12"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="6"
                  cy="6"
                  r="1"
                  fill="currentColor"
                  className="text-[var(--mn-accent)]/35"
                />
              </pattern>
            </defs>
            <rect
              x="14"
              y="6"
              width="132"
              height="58"
              fill="url(#minenote-dot-grid)"
            />
          </>
        )}

        <rect
          x="0.5"
          y="0.5"
          width="159"
          height="69"
          rx="8"
          stroke="currentColor"
          className="text-black/[0.025]"
        />
      </svg>
    </div>
  );
}

export function PagesIcon({
  pages,
  size = "md",
}: {
  pages: 100 | 150 | 200;
  size?: "sm" | "md" | "lg";
}) {
  const cls =
    size === "sm"
      ? "h-7 w-7"
      : size === "lg"
        ? "h-12 w-12"
        : "h-9 w-9";

  const layers = pages === 100 ? 2 : pages === 150 ? 3 : 4;

  return (
    <svg viewBox="0 0 48 48" className={`${cls} ${base}`} fill="none">
      {Array.from({ length: layers }).map((_, index) => {
        const offset = (layers - 1 - index) * 2;

        return (
          <rect
            key={index}
            x={11 + offset}
            y={7 + offset}
            width="25"
            height="34"
            rx="3"
            className={
              index === layers - 1
                ? "fill-[var(--mn-surface)]"
                : "fill-black/[0.025]"
            }
            stroke="currentColor"
            strokeWidth={index === layers - 1 ? 1.8 : 1}
          />
        );
      })}

      <path
        d="M18 19h11M18 24h8M18 29h10"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        className="opacity-30"
      />
    </svg>
  );
}

export function PhysicalConfigSummary({
  pages,
  paper,
  paperGsm = 80,
  size,
  orientation,
  compact = false,
}: {
  pages?: number | null;
  paper?: string | null;
  paperGsm?: number | null;
  size?: string | null;
  orientation?: string | null;
  compact?: boolean;
}) {
  const normalizedPaper =
    paper === "ruled" || paper === "dotGrid" ? paper : "plain";

  const validPages =
    pages === 100 || pages === 150 || pages === 200 ? pages : null;

  const validSize = size === "A5" ? "A5" : size === "A4" ? "A4" : null;

  const validOrientation =
    orientation === "landscape"
      ? "landscape"
      : orientation === "portrait"
        ? "portrait"
        : null;

  const paperLabel =
    normalizedPaper === "ruled"
      ? "Ruled"
      : normalizedPaper === "dotGrid"
        ? "Dot Grid"
        : "Plain";

  const orientationLabel =
    validOrientation === "landscape" ? "Landscape" : "Portrait";

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {validPages !== null && (
          <span className="inline-flex items-center gap-1.5">
            <PagesIcon pages={validPages} size="sm" />
            <strong>{validPages}</strong> pages
          </span>
        )}

        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--mn-accent)]" />
          <strong>{paperLabel}</strong>
          {paperGsm ? ` · ${paperGsm} GSM` : ""}
        </span>

        {validSize && (
          <span className="inline-flex items-center gap-1.5">
            <SizeIcon value={validSize} size="sm" />
            <strong>{validSize}</strong>
          </span>
        )}

        {validOrientation && (
          <span className="inline-flex items-center gap-1.5">
            <OrientationIcon value={validOrientation} size="sm" />
            <strong>{orientationLabel}</strong>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {validPages !== null && (
        <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3">
          <PagesIcon pages={validPages} />
          <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-[var(--mn-text-secondary)]">
            Pages
          </p>
          <p className="mt-0.5 text-sm font-bold text-[var(--mn-text)]">
            {validPages}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3">
        <PaperIcon value={normalizedPaper} size="md" />
        <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-[var(--mn-text-secondary)]">
          Paper
        </p>
        <p className="mt-0.5 text-sm font-bold text-[var(--mn-text)]">
          {paperLabel}
        </p>
        <p className="text-[10px] text-[var(--mn-text-muted)]">
          {paperGsm ? `${paperGsm} GSM` : "Not recorded"}
        </p>
      </div>

      {validSize && (
        <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3">
          <SizeIcon value={validSize} />
          <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-[var(--mn-text-secondary)]">
            Size
          </p>
          <p className="mt-0.5 text-sm font-bold text-[var(--mn-text)]">
            {validSize}
          </p>
        </div>
      )}

      {validOrientation && (
        <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3">
          <OrientationIcon value={validOrientation} />
          <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-[var(--mn-text-secondary)]">
            Orientation
          </p>
          <p className="mt-0.5 text-sm font-bold text-[var(--mn-text)]">
            {orientationLabel}
          </p>
        </div>
      )}
    </div>
  );
}
