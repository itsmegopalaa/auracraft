"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type EditorSide = "front" | "insideFront" | "insideBack" | "back";

type PhysicalConfig = {
  size: "A4" | "A5";
  pages: 100 | 150 | 200;
  paper: "plain" | "ruled" | "dotGrid";
  orientation: "portrait" | "landscape";
  quantity: number;
};

type CustomCoverEditorProps = {
  customizationId: string;
  productId: string | null;
  productName: string;
  productImage: string;
  physicalConfig: PhysicalConfig;
};

const SIDES: { id: EditorSide; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "insideFront", label: "Inside Front" },
  { id: "insideBack", label: "Inside Back" },
  { id: "back", label: "Back" },
];

function SideTabs({
  activeSide,
  onChange,
}: {
  activeSide: EditorSide;
  onChange: (side: EditorSide) => void;
}) {
  return (
    <nav
      aria-label="Cover sides"
      className="flex items-center justify-center gap-1"
    >
      {SIDES.map((side) => (
        <button
          key={side.id}
          type="button"
          onClick={() => onChange(side.id)}
          className={[
            "relative flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold tracking-[-0.01em] transition-all duration-200",
            activeSide === side.id
              ? "bg-[var(--mn-accent-soft)] text-[var(--mn-text)]"
              : "text-[var(--mn-text-muted)] hover:bg-[var(--mn-control-bg)] hover:text-[var(--mn-text)]",
          ].join(" ")}
        >
          {side.label}
          {activeSide === side.id && (
            <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[var(--mn-accent)]" />
          )}
        </button>
      ))}
    </nav>
  );
}

type CanvasElement = {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;
  src?: string;
  objectFit?: "contain" | "cover" | "fill";
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  borderRadius?: number;
  shape?: "rectangle" | "circle";
  fill?: string;
};

type DesignSurface = {
  background: string;
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  canvasSize: "A4" | "A5";
  canvasOrientation: "portrait" | "landscape";
};

type SurfaceHistory = {
  past: Record<EditorSide, DesignSurface>[];
  future: Record<EditorSide, DesignSurface>[];
};

function getCanvasSize(
  size: "A4" | "A5",
  orientation: "portrait" | "landscape",
) {
  const base =
    size === "A4"
      ? { width: 2480, height: 3508 }
      : { width: 1748, height: 2480 };

  return orientation === "portrait"
    ? base
    : { width: base.height, height: base.width };
}

function createEmptySurface(
  size: "A4" | "A5",
  orientation: "portrait" | "landscape",
): DesignSurface {
  const canvas = getCanvasSize(size, orientation);

  return {
    background: "#ffffff",
    elements: [],
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    canvasSize: size,
    canvasOrientation: orientation,
  };
}

function CoverCanvas({
  surface,
  productImage,
  productName,
  selectedElementId,
  onSelectElement,
}: {
  surface: DesignSurface;
  productImage: string;
  productName: string;
  selectedElementId: string | null;
  onSelectElement: (elementId: string) => void;
}) {
  const aspectRatio = surface.canvasWidth / surface.canvasHeight;

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-[var(--mn-surface-soft)] p-6 xl:p-8">
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <div
          className="relative shrink-0 overflow-hidden rounded-[2px] shadow-[var(--mn-shadow-lg)]"
          onClick={() => onSelectElement("")}
          style={{
            aspectRatio,
            height: "min(100%, 760px)",
            width: "auto",
            maxWidth: "100%",
            maxHeight: "100%",
            background: surface.background || "#ffffff",
          }}
        >
        {productImage && surface.elements.length === 0 && (
          <img
            src={productImage}
            alt={productName || "Product"}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.07]"
          />
        )}

        <div className="pointer-events-none absolute inset-[2%] border border-dashed border-[var(--mn-border-strong)]" />

        {surface.elements.map((element) => {
          const style: CSSProperties = {
            position: "absolute",
            left: `${(element.x / surface.canvasWidth) * 100}%`,
            top: `${(element.y / surface.canvasHeight) * 100}%`,
            width: `${(element.width / surface.canvasWidth) * 100}%`,
            height: `${(element.height / surface.canvasHeight) * 100}%`,
            transform: `rotate(${element.rotation}deg)`,
            opacity: element.opacity,
          };

          const isSelected = selectedElementId === element.id;

          return (
            <div
              key={element.id}
              role="button"
              tabIndex={0}
              aria-label={`Select ${element.type} element`}
              onClick={(event) => {
                event.stopPropagation();
                onSelectElement(element.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectElement(element.id);
                }
              }}
              style={style}
              className={[
                "cursor-pointer",
                isSelected
                  ? "outline outline-2 outline-[var(--mn-accent)] outline-offset-1"
                  : "outline-none",
              ].join(" ")}
            >
              {element.type === "text" && (
                <div
                  className="flex h-full w-full items-center justify-center break-words"
                  style={{
                    fontSize: `${((element.fontSize ?? 42) / surface.canvasWidth) * 100}cqw`,
                    fontWeight: element.fontWeight ?? 400,
                    color: element.color ?? "#111111",
                    textAlign: element.textAlign ?? "center",
                    lineHeight: element.lineHeight ?? 1.2,
                    letterSpacing: `${element.letterSpacing ?? 0}px`,
                  }}
                >
                  {element.text}
                </div>
              )}

              {element.type === "image" && element.src && (
                <img
                  src={element.src}
                  alt=""
                  draggable={false}
                  className="h-full w-full select-none"
                  style={{
                    objectFit: element.objectFit ?? "contain",
                    borderRadius: element.borderRadius ?? 0,
                    transform: `translate(${element.imageOffsetX ?? 0}px, ${
                      element.imageOffsetY ?? 0
                    }px) scale(${element.imageScale ?? 1})`,
                    transformOrigin: "center center",
                  }}
                />
              )}

              {element.type === "shape" && (
                <div
                  className="h-full w-full"
                  style={{
                    background: element.fill ?? "#111111",
                    borderRadius:
                      element.shape === "circle"
                        ? "50%"
                        : element.borderRadius ?? 0,
                  }}
                />
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function CanvasPlaceholder({ side }: { side: EditorSide }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[var(--mn-bg)] p-6">
      <div className="relative aspect-[2480/3508] h-[min(76vh,720px)] max-h-full rounded-sm bg-white shadow-2xl">
        <div className="absolute inset-5 rounded-sm border border-dashed border-[var(--mn-border)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--mn-text-muted)]">
            MineNote
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--mn-text)]">
            {SIDES.find((item) => item.id === side)?.label}
          </h2>
          <p className="mt-2 max-w-[220px] text-xs leading-5 text-[var(--mn-text-muted)]">
            Canvas preview
          </p>
        </div>
      </div>
    </div>
  );
}

function DesktopEditor({
  activeSide,
  setActiveSide,
  surface,
  productImage,
  productName,
  selectedElementId,
  onSelectElement,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  activeSide: EditorSide;
  setActiveSide: (side: EditorSide) => void;
  surface: DesignSurface;
  productImage: string;
  productName: string;
  selectedElementId: string | null;
  onSelectElement: (elementId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const tools = [
    { icon: "⌁", label: "Select" },
    { icon: "✦", label: "AI Design" },
    { icon: "T", label: "Text" },
    { icon: "▧", label: "Image" },
    { icon: "□", label: "Shape" },
    { icon: "◐", label: "Background" },
  ];

  return (
    <section className="hidden h-dvh w-full min-w-0 flex-col overflow-hidden bg-[var(--mn-bg)] text-[var(--mn-text)] lg:flex">
      {/* MineNote-native studio header */}
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[var(--mn-border)] bg-[var(--mn-bg)]/95 px-6 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-5">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="group inline-flex h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold text-[var(--mn-text-secondary)] transition-all duration-200 hover:bg-[var(--mn-control-bg)] hover:text-[var(--mn-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)]"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
              ←
            </span>
            Back
          </button>

          <div className="h-7 w-px bg-[var(--mn-border)]" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-black tracking-[-0.06em] text-[var(--mn-text)]">
                MineNote
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--mn-accent)]" />
            </div>
            <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--mn-text-muted)]">
              Custom Cover Studio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-5 text-sm font-semibold text-[var(--mn-text)] shadow-[var(--mn-shadow-sm)] transition-all duration-200 hover:border-[var(--mn-accent)] hover:bg-[var(--mn-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)]"
          >
            Preview
          </button>

          <button
            type="button"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--mn-accent)] px-5 text-sm font-semibold text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--mn-shadow-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] active:translate-y-0"
          >
            <span>Approve</span>
            <span className="transition-transform duration-300 group-hover:scale-110">
              ✓
            </span>
          </button>
        </div>
      </header>

      {/* Main editor workspace */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Design navigation */}
        <aside className="flex w-[88px] shrink-0 flex-col border-r border-[var(--mn-border)] bg-[var(--mn-surface)]">
          <div className="px-2 pb-2 pt-4">
            <p className="text-center text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--mn-text-muted)]">
              Design
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 px-2">
            {tools.map((tool, index) => (
              <button
                key={tool.label}
                type="button"
                className={[
                  "group flex h-[62px] w-full flex-col items-center justify-center gap-1.5 rounded-xl px-1 text-[var(--mn-text-secondary)] transition-all duration-200",
                  index === 0
                    ? "bg-[var(--mn-accent-soft)] text-[var(--mn-accent)]"
                    : "hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-200",
                    index === 0
                      ? "border-[var(--mn-accent)]/30 bg-[var(--mn-surface)] text-[var(--mn-accent)]"
                      : "border-[var(--mn-border)] bg-[var(--mn-surface-soft)] group-hover:border-[var(--mn-border-strong)]",
                  ].join(" ")}
                >
                  {tool.icon}
                </span>

                <span className="text-[10px] font-semibold tracking-[-0.01em]">
                  {tool.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="border-t border-[var(--mn-border)] p-2">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Undo"
                className="flex h-9 items-center justify-center rounded-lg text-sm font-semibold text-[var(--mn-text-secondary)] transition-colors hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                ↶
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                aria-label="Redo"
                className="flex h-9 items-center justify-center rounded-lg text-sm font-semibold text-[var(--mn-text-secondary)] transition-colors hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                ↷
              </button>
            </div>
          </div>
        </aside>

        {/* Canvas workspace */}
        <main className="min-w-0 flex-1 overflow-hidden bg-[var(--mn-surface-soft)]">
          <div className="flex h-full min-h-0 items-center justify-center overflow-auto p-8 xl:p-10">
            <div className="flex min-h-full w-full items-center justify-center">
              <CoverCanvas
                surface={surface}
                productImage={productImage}
                productName={productName}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              />
            </div>
          </div>
        </main>

        {/* Properties */}
        <aside className="flex w-[320px] shrink-0 flex-col overflow-hidden border-l border-[var(--mn-border)] bg-[var(--mn-surface)]">
          <div className="border-b border-[var(--mn-border)] px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)]">
              Inspector
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-[var(--mn-text)]">
              Properties
            </h2>
            <p className="mt-1 text-xs leading-5 text-[var(--mn-text-muted)]">
              Select an element to edit its details.
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center px-8 text-center">
            {selectedElementId ? (
              <div className="w-full max-w-[240px]">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--mn-accent)]/30 bg-[var(--mn-accent-soft)] text-lg text-[var(--mn-accent)]">
                  ✓
                </div>
                <p className="text-sm font-semibold text-[var(--mn-text)]">
                  Element selected
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--mn-text-secondary)]">
                  Position and detailed editing controls will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => onSelectElement("")}
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-4 text-xs font-semibold text-[var(--mn-text)] shadow-[var(--mn-shadow-sm)] hover:bg-[var(--mn-control-hover)]"
                >
                  Deselect
                </button>
              </div>
            ) : (
              <div className="max-w-[220px]">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-accent-soft)] text-lg text-[var(--mn-accent)]">
                  ✦
                </div>
                <p className="text-sm font-semibold text-[var(--mn-text)]">
                  Nothing selected
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--mn-text-secondary)]">
                  Choose Select, then click an element on your cover.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Cover side navigation */}
      <footer className="flex h-[64px] shrink-0 items-center justify-center border-t border-[var(--mn-border)] bg-[var(--mn-bg)] px-6">
        <SideTabs
          activeSide={activeSide}
          onChange={setActiveSide}
        />
      </footer>
    </section>
  );
}
function TabletEditor({
  activeSide,
  setActiveSide,
}: {
  activeSide: EditorSide;
  setActiveSide: (side: EditorSide) => void;
}) {
  return (
    <section className="hidden h-dvh min-h-0 flex-col bg-[var(--mn-bg)] md:flex lg:hidden">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--mn-border)] px-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-xl border border-[var(--mn-border)] px-3 py-2 text-xs"
        >
          ← Back
        </button>

        <p className="text-sm font-semibold">Custom Cover</p>

        <button
          type="button"
          className="rounded-xl bg-[var(--mn-accent)] shadow-[var(--mn-shadow-sm)] px-3 py-2 text-xs font-semibold text-[var(--mn-accent-contrast)]"
        >
          Preview
        </button>
      </header>

      <div className="min-h-0 flex-1">
        <CanvasPlaceholder side={activeSide} />
      </div>

      <div className="shrink-0 border-t border-[var(--mn-border)] bg-[var(--mn-bg)] p-3">
        <SideTabs activeSide={activeSide} onChange={setActiveSide} />

        <div className="mt-3 flex gap-2 overflow-x-auto">
          {["AI", "Text", "Image", "Shape", "Background"].map((tool) => (
            <button
              key={tool}
              type="button"
              className="shrink-0 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 py-2 text-xs font-medium"
            >
              {tool}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function MobileEditor({
  activeSide,
  setActiveSide,
}: {
  activeSide: EditorSide;
  setActiveSide: (side: EditorSide) => void;
}) {
  return (
    <section className="flex h-dvh min-h-0 flex-col bg-[var(--mn-bg)] md:hidden">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--mn-border)] px-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-xl px-2 py-2 text-sm"
        >
          ←
        </button>

        <p className="text-sm font-semibold">Custom Cover</p>

        <button
          type="button"
          className="rounded-xl bg-[var(--mn-accent)] shadow-[var(--mn-shadow-sm)] px-3 py-2 text-xs font-semibold text-[var(--mn-accent-contrast)]"
        >
          Preview
        </button>
      </header>

      <div className="shrink-0 border-b border-[var(--mn-border)] p-2">
        <SideTabs activeSide={activeSide} onChange={setActiveSide} />
      </div>

      <div className="min-h-0 flex-1">
        <CanvasPlaceholder side={activeSide} />
      </div>

      <div className="grid shrink-0 grid-cols-5 border-t border-[var(--mn-border)] bg-[var(--mn-bg)]">
        {["AI", "Text", "Image", "Shape", "More"].map((tool) => (
          <button
            key={tool}
            type="button"
            className="flex h-16 items-center justify-center text-[11px] font-medium text-[var(--mn-text-secondary)]"
          >
            {tool}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function CustomCoverEditor({
  customizationId,
  productId,
  productName,
  productImage,
  physicalConfig,
}: CustomCoverEditorProps) {
  const router = useRouter();
  const [activeSide, setActiveSide] = useState<EditorSide>("front");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );

  const defaultSurface = useMemo(
    () =>
      createEmptySurface(
        physicalConfig.size,
        physicalConfig.orientation,
      ),
    [physicalConfig.size, physicalConfig.orientation],
  );

  const [surfaces, setSurfaces] = useState<
    Record<EditorSide, DesignSurface>
  >({
    front: defaultSurface,
    insideFront: defaultSurface,
    insideBack: defaultSurface,
    back: defaultSurface,
  });

  const activeSurface = surfaces[activeSide];

  const [history, setHistory] = useState<SurfaceHistory>({
    past: [],
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const updateSurfaces = (
    updater: (current: Record<EditorSide, DesignSurface>) => Record<
      EditorSide,
      DesignSurface
    >,
  ) => {
    setSurfaces((current) => {
      const next = updater(current);

      setHistory((historyState) => ({
        past: [...historyState.past, current],
        future: [],
      }));

      return next;
    });
  };

  const handleUndo = () => {
    setHistory((currentHistory) => {
      const previous = currentHistory.past.at(-1);

      if (!previous) return currentHistory;

      setSurfaces(previous);

      return {
        past: currentHistory.past.slice(0, -1),
        future: [surfaces, ...currentHistory.future],
      };
    });

    setSelectedElementId(null);
  };

  const handleRedo = () => {
    setHistory((currentHistory) => {
      const next = currentHistory.future[0];

      if (!next) return currentHistory;

      setSurfaces(next);

      return {
        past: [...currentHistory.past, surfaces],
        future: currentHistory.future.slice(1),
      };
    });

    setSelectedElementId(null);
  };

  useEffect(() => {
    setSurfaces((current) => ({
      ...current,
      [activeSide]: current[activeSide] ?? defaultSurface,
    }));
  }, [activeSide, defaultSurface]);

  return (
    <div className="h-dvh w-full overflow-hidden">
      <DesktopEditor
        activeSide={activeSide}
        setActiveSide={setActiveSide}
        surface={activeSurface}
        productImage={productImage}
        productName={productName}
        selectedElementId={selectedElementId}
        onSelectElement={(elementId) =>
          setSelectedElementId(elementId || null)
        }
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <TabletEditor
        activeSide={activeSide}
        setActiveSide={setActiveSide}
      />

      <MobileEditor
        activeSide={activeSide}
        setActiveSide={setActiveSide}
      />
    </div>
  );
}
