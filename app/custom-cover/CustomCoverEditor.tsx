"use client";

import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  assetId?: string;
  objectFit?: "contain" | "cover" | "fill";
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  borderRadius?: number;

  shape?: "rectangle" | "circle";
  fill?: string;

  zIndex?: number;
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
            "relative flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all",
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

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}


function hydrateSurface(
  raw: unknown,
  fallback: DesignSurface,
  assets: Array<{ id?: string; side?: string; previewUrl?: string }>,
): DesignSurface {
  const source =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : {};

  const rawElements = Array.isArray(source.elements)
    ? source.elements
    : [];

  const elements = rawElements
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const element = item as CanvasElement & {
        assetId?: string;
      };

      if (element.type !== "image" || !element.assetId) {
        return element;
      }

      const asset = assets.find(
        (candidate) => candidate.id === element.assetId,
      );

      return {
        ...element,
        src: asset?.previewUrl || element.src || "",
      };
    });

  return {
    ...fallback,
    background:
      typeof source.background === "string"
        ? source.background
        : fallback.background,
    elements,
  };
}

function CoverCanvas({
  surface,
  productImage,
  productName,
  selectedElementId,
  onSelectElement,
  onMoveElement,
}: {
  surface: DesignSurface;
  productImage: string;
  productName: string;
  selectedElementId: string | null;
  onSelectElement: (elementId: string) => void;
  onMoveElement: (elementId: string, x: number, y: number) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{
    id: string;
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const aspectRatio = surface.canvasWidth / surface.canvasHeight;

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    element: CanvasElement,
  ) => {
    event.stopPropagation();

    onSelectElement(element.id);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    draggingRef.current = {
      id: element.id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: element.x,
      startY: element.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const drag = draggingRef.current;
    if (!drag) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx =
      ((event.clientX - drag.pointerX) / rect.width) *
      surface.canvasWidth;

    const dy =
      ((event.clientY - drag.pointerY) / rect.height) *
      surface.canvasHeight;

    const element = surface.elements.find((item) => item.id === drag.id);
    if (!element) return;

    onMoveElement(
      drag.id,
      clamp(drag.startX + dx, 0, surface.canvasWidth - element.width),
      clamp(drag.startY + dy, 0, surface.canvasHeight - element.height),
    );
  };

  const handlePointerUp = () => {
    draggingRef.current = null;
  };

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-[var(--mn-surface-soft)] p-6 xl:p-8">
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <div
          ref={canvasRef}
          className="relative shrink-0 overflow-hidden rounded-[2px] shadow-[var(--mn-shadow-lg)]"
          onClick={() => onSelectElement("")}
          style={{
            aspectRatio,
            height: "min(100%, 760px)",
            width: "auto",
            maxWidth: "100%",
            maxHeight: "100%",
            background: surface.background || "#ffffff",
            containerType: "inline-size",
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
              zIndex: element.zIndex ?? 1,
              touchAction: "none",
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
                onPointerDown={(event) =>
                  handlePointerDown(event, element)
                }
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    onSelectElement(element.id);
                  }
                }}
                style={style}
                className={[
                  "cursor-move select-none",
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
                    {element.text || "Text"}
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

function Inspector({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  element: CanvasElement | null;
  onUpdate: (patch: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  if (!element) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center">
        <div className="max-w-[220px]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-accent-soft)] text-lg text-[var(--mn-accent)]">
            ✦
          </div>

          <p className="text-sm font-semibold">Nothing selected</p>

          <p className="mt-2 text-xs leading-5 text-[var(--mn-text-secondary)]">
            Choose Select, then click or drag an element on your cover.
          </p>
        </div>
      </div>
    );
  }

  const field =
    "mt-1 h-9 w-full rounded-lg border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-2.5 text-xs outline-none focus:border-[var(--mn-accent)]";

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mn-accent)]">
            {element.type}
          </p>
          <p className="mt-1 text-sm font-semibold">Properties</p>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      {element.type === "text" && (
        <div className="space-y-4">
          <label className="block text-xs font-semibold">
            Text
            <textarea
              className={`${field} h-20 resize-none py-2`}
              value={element.text ?? ""}
              onChange={(event) =>
                onUpdate({ text: event.target.value })
              }
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold">
              Size
              <input
                type="number"
                className={field}
                min={8}
                max={300}
                value={element.fontSize ?? 42}
                onChange={(event) =>
                  onUpdate({
                    fontSize: clamp(
                      Number(event.target.value) || 42,
                      8,
                      300,
                    ),
                  })
                }
              />
            </label>

            <label className="text-xs font-semibold">
              Weight
              <select
                className={field}
                value={element.fontWeight ?? 400}
                onChange={(event) =>
                  onUpdate({
                    fontWeight: Number(event.target.value),
                  })
                }
              >
                <option value={400}>Regular</option>
                <option value={500}>Medium</option>
                <option value={600}>Semibold</option>
                <option value={700}>Bold</option>
                <option value={800}>Extra Bold</option>
              </select>
            </label>
          </div>

          <label className="block text-xs font-semibold">
            Color
            <input
              type="color"
              className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-[var(--mn-border)] bg-transparent"
              value={element.color ?? "#111111"}
              onChange={(event) =>
                onUpdate({ color: event.target.value })
              }
            />
          </label>

          <label className="block text-xs font-semibold">
            Alignment
            <select
              className={field}
              value={element.textAlign ?? "center"}
              onChange={(event) =>
                onUpdate({
                  textAlign: event.target.value as
                    | "left"
                    | "center"
                    | "right",
                })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
        </div>
      )}

      {element.type === "image" && (
        <div className="space-y-4">
          <label className="block text-xs font-semibold">
            Fit
            <select
              className={field}
              value={element.objectFit ?? "contain"}
              onChange={(event) =>
                onUpdate({
                  objectFit: event.target.value as
                    | "contain"
                    | "cover"
                    | "fill",
                })
              }
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="fill">Fill</option>
            </select>
          </label>

          <label className="block text-xs font-semibold">
            Scale
            <input
              type="range"
              min="0.25"
              max="3"
              step="0.05"
              className="mt-2 w-full"
              value={element.imageScale ?? 1}
              onChange={(event) =>
                onUpdate({
                  imageScale: Number(event.target.value),
                })
              }
            />
          </label>

          <label className="block text-xs font-semibold">
            Corner Radius
            <input
              type="range"
              min="0"
              max="100"
              className="mt-2 w-full"
              value={element.borderRadius ?? 0}
              onChange={(event) =>
                onUpdate({
                  borderRadius: Number(event.target.value),
                })
              }
            />
          </label>
        </div>
      )}

      {element.type === "shape" && (
        <div className="space-y-4">
          <label className="block text-xs font-semibold">
            Shape
            <select
              className={field}
              value={element.shape ?? "rectangle"}
              onChange={(event) =>
                onUpdate({
                  shape: event.target.value as
                    | "rectangle"
                    | "circle",
                })
              }
            >
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
            </select>
          </label>

          <label className="block text-xs font-semibold">
            Fill
            <input
              type="color"
              className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-[var(--mn-border)] bg-transparent"
              value={element.fill ?? "#111111"}
              onChange={(event) =>
                onUpdate({ fill: event.target.value })
              }
            />
          </label>
        </div>
      )}

      <div className="mt-6 border-t border-[var(--mn-border)] pt-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mn-text-muted)]">
          Position
        </p>

        <div className="grid grid-cols-2 gap-3">
          {(["x", "y", "width", "height"] as const).map(
            (key) => (
              <label
                key={key}
                className="text-xs font-semibold"
              >
                {key.toUpperCase()}
                <input
                  type="number"
                  className={field}
                  value={Math.round(element[key])}
                  min={0}
                  onChange={(event) =>
                    onUpdate({
                      [key]: Math.max(
                        1,
                        Number(event.target.value) || 1,
                      ),
                    })
                  }
                />
              </label>
            ),
          )}
        </div>

        <label className="mt-3 block text-xs font-semibold">
          Rotation
          <input
            type="number"
            className={field}
            value={element.rotation}
            onChange={(event) =>
              onUpdate({
                rotation: Number(event.target.value) || 0,
              })
            }
          />
        </label>

        <label className="mt-3 block text-xs font-semibold">
          Opacity
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            className="mt-2 w-full"
            value={element.opacity}
            onChange={(event) =>
              onUpdate({
                opacity: Number(event.target.value),
              })
            }
          />
        </label>

        <button
          type="button"
          onClick={onDuplicate}
          className="mt-5 h-10 w-full rounded-xl border border-[var(--mn-border-strong)] text-xs font-semibold hover:bg-[var(--mn-control-hover)]"
        >
          Duplicate Element
        </button>
      </div>
    </div>
  );
}

function PreviewOverlay({
  surfaces,
  activeSide,
  onClose,
}: {
  surfaces: Record<EditorSide, DesignSurface>;
  activeSide: EditorSide;
  onClose: () => void;
}) {
  const surface = surfaces[activeSide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[var(--mn-bg)] shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--mn-border)] px-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mn-accent)]">
              Preview
            </p>
            <p className="text-sm font-semibold">
              {SIDES.find((item) => item.id === activeSide)?.label}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--mn-border)] px-4 py-2 text-xs font-semibold"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1">
          <CoverCanvas
            surface={surface}
            productImage=""
            productName=""
            selectedElementId={null}
            onSelectElement={() => undefined}
            onMoveElement={() => undefined}
          />
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
  onMoveElement,
  onAddText,
  onAddShape,
  onUploadImage,
  onBackground,
  onAiDesign,
  onPreview,
  onApprove,
  onSave,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  busy,
  onBack,
}: {
  activeSide: EditorSide;
  setActiveSide: (side: EditorSide) => void;
  surface: DesignSurface;
  productImage: string;
  productName: string;
  selectedElementId: string | null;
  onSelectElement: (elementId: string) => void;
  onMoveElement: (elementId: string, x: number, y: number) => void;
  onAddText: () => void;
  onAddShape: (shape: "rectangle" | "circle") => void;
  onUploadImage: () => void;
  onBackground: () => void;
  onAiDesign: () => void;
  onPreview: () => void;
  onApprove: () => void;
  onSave: () => void;
  onUpdateElement: (patch: Partial<CanvasElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  busy: boolean;
  onBack: () => void;
}) {
  const tools = [
    { icon: "⌁", label: "Select" },
    { icon: "✦", label: "AI Design" },
    { icon: "T", label: "Text" },
    { icon: "▧", label: "Image" },
    { icon: "□", label: "Shape" },
    { icon: "◐", label: "Background" },
  ];

  const selectedElement =
    surface.elements.find(
      (element) => element.id === selectedElementId,
    ) ?? null;

  return (
    <section className="hidden h-dvh w-full min-w-0 flex-col overflow-hidden bg-[var(--mn-bg)] text-[var(--mn-text)] lg:flex">
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[var(--mn-border)] px-6">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-bg)]"
          >
            ← Back
          </button>

          <div className="h-7 w-px bg-[var(--mn-border)]" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-black tracking-[-0.06em]">
                MineNote
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--mn-accent)]" />
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--mn-text-muted)]">
              Custom Cover Studio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="h-11 rounded-xl border border-[var(--mn-border-strong)] px-4 text-sm font-semibold hover:bg-[var(--mn-control-hover)] disabled:opacity-50"
          >
            {busy ? "Working…" : "Save"}
          </button>

          <button
            type="button"
            onClick={onPreview}
            className="h-11 rounded-xl border border-[var(--mn-border-strong)] px-5 text-sm font-semibold hover:bg-[var(--mn-accent-soft)]"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="h-11 rounded-xl bg-[var(--mn-accent)] px-5 text-sm font-semibold text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)] disabled:opacity-50"
          >
            Approve ✓
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
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
                disabled={busy && tool.label === "AI Design"}
                onClick={() => {
                  if (tool.label === "AI Design") onAiDesign();
                  if (tool.label === "Text") onAddText();
                  if (tool.label === "Image") onUploadImage();
                  if (tool.label === "Shape") onAddShape("rectangle");
                  if (tool.label === "Background") onBackground();
                }}
                className={[
                  "group flex h-[62px] w-full flex-col items-center justify-center gap-1.5 rounded-xl px-1 transition-all",
                  index === 0
                    ? "bg-[var(--mn-accent-soft)] text-[var(--mn-accent)]"
                    : "text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]",
                ].join(" ")}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] text-sm font-semibold">
                  {tool.icon}
                </span>

                <span className="text-[10px] font-semibold">
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
                className="flex h-9 items-center justify-center rounded-lg text-sm hover:bg-[var(--mn-control-hover)] disabled:opacity-30"
              >
                ↶
              </button>

              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className="flex h-9 items-center justify-center rounded-lg text-sm hover:bg-[var(--mn-control-hover)] disabled:opacity-30"
              >
                ↷
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden bg-[var(--mn-surface-soft)]">
          <CoverCanvas
            surface={surface}
            productImage={productImage}
            productName={productName}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
            onMoveElement={onMoveElement}
          />
        </main>

        <aside className="flex w-[320px] shrink-0 flex-col overflow-hidden border-l border-[var(--mn-border)] bg-[var(--mn-surface)]">
          <div className="border-b border-[var(--mn-border)] px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)]">
              Inspector
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              Properties
            </h2>
          </div>

          <Inspector
            element={selectedElement}
            onUpdate={onUpdateElement}
            onDelete={onDeleteElement}
            onDuplicate={onDuplicateElement}
          />
        </aside>
      </div>

      <footer className="flex h-[64px] shrink-0 items-center justify-center border-t border-[var(--mn-border)] bg-[var(--mn-bg)]">
        <SideTabs
          activeSide={activeSide}
          onChange={setActiveSide}
        />
      </footer>
    </section>
  );
}

function PlaceholderEditor({
  activeSide,
  setActiveSide,
  onBack,
}: {
  activeSide: EditorSide;
  setActiveSide: (side: EditorSide) => void;
  onBack: () => void;
}) {
  return (
    <section className="flex h-dvh flex-col bg-[var(--mn-bg)] lg:hidden">
      <header className="flex h-14 items-center justify-between border-b border-[var(--mn-border)] px-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl px-3 py-2 text-sm"
        >
          ← Back
        </button>

        <p className="text-sm font-semibold">
          Custom Cover
        </p>

        <span className="text-xs text-[var(--mn-text-muted)]">
          Desktop editor
        </span>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--mn-accent-soft)] text-[var(--mn-accent)]">
            ✦
          </div>
          <p className="font-semibold">Custom Cover Studio</p>
          <p className="mt-2 text-xs text-[var(--mn-text-muted)]">
            Tablet and mobile controls will use the same editor engine.
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--mn-border)] p-2">
        <SideTabs
          activeSide={activeSide}
          onChange={setActiveSide}
        />
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

  const [activeSide, setActiveSide] =
    useState<EditorSide>("front");

  const [selectedElementId, setSelectedElementId] =
    useState<string | null>(null);

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const [busy, setBusy] = useState(false);

  const [defaultSurface] = useState(() =>
    createEmptySurface(
      physicalConfig.size,
      physicalConfig.orientation,
    ),
  );

  const [surfaces, setSurfaces] = useState<
    Record<EditorSide, DesignSurface>
  >(() => ({
    front: createEmptySurface(
      physicalConfig.size,
      physicalConfig.orientation,
    ),
    insideFront: createEmptySurface(
      physicalConfig.size,
      physicalConfig.orientation,
    ),
    insideBack: createEmptySurface(
      physicalConfig.size,
      physicalConfig.orientation,
    ),
    back: createEmptySurface(
      physicalConfig.size,
      physicalConfig.orientation,
    ),
  }));

  const [history, setHistory] =
    useState<SurfaceHistory>({
      past: [],
      future: [],
    });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const latestSurfacesRef = useRef(surfaces);

  const activeSurface = surfaces[activeSide];

  const selectedElement =
    activeSurface.elements.find(
      (element) => element.id === selectedElementId,
    ) ?? null;

  useEffect(() => {
    hydratedRef.current = false;

    let cancelled = false;

    async function loadSavedDesign() {
      try {
        const [customizationResponse, assetsResponse] =
          await Promise.all([
            fetch(`/api/custom-cover/${customizationId}`, {
              cache: "no-store",
            }),
            fetch(
              `/api/custom-cover/${customizationId}/assets`,
              { cache: "no-store" },
            ),
          ]);

        const customizationText =
          await customizationResponse.text();

        const assetsText =
          await assetsResponse.text();

        let customizationPayload: any = {};
        let assetsPayload: any = {};

        try {
          customizationPayload = customizationText
            ? JSON.parse(customizationText)
            : {};
        } catch {
          console.error(
            "Custom cover customization API returned non-JSON:",
            customizationResponse.status,
            customizationText,
          );
        }

        try {
          assetsPayload = assetsText
            ? JSON.parse(assetsText)
            : {};
        } catch {
          console.error(
            "Custom cover assets API returned non-JSON:",
            assetsResponse.status,
            assetsText,
          );
        }

        if (!customizationResponse.ok) {
          throw new Error(
            customizationPayload?.error ||
              "Unable to load customization.",
          );
        }

        const savedDesign =
          customizationPayload?.customization?.design ??
          customizationPayload?.design;

        if (!savedDesign || cancelled) return;

        const assets = Array.isArray(assetsPayload?.assets)
          ? assetsPayload.assets
          : [];

        const loaded = {
          front: hydrateSurface(
            savedDesign.front,
            createEmptySurface(
              physicalConfig.size,
              physicalConfig.orientation,
            ),
            assets,
          ),
          insideFront: hydrateSurface(
            savedDesign.insideFront,
            createEmptySurface(
              physicalConfig.size,
              physicalConfig.orientation,
            ),
            assets,
          ),
          insideBack: hydrateSurface(
            savedDesign.insideBack,
            createEmptySurface(
              physicalConfig.size,
              physicalConfig.orientation,
            ),
            assets,
          ),
          back: hydrateSurface(
            savedDesign.back,
            createEmptySurface(
              physicalConfig.size,
              physicalConfig.orientation,
            ),
            assets,
          ),
        };

        setSurfaces(loaded);
        latestSurfacesRef.current = loaded;
        setHistory({
          past: [],
          future: [],
        });
        setSelectedElementId(null);
        hydratedRef.current = true;
      } catch (error) {
        console.error(
          "Custom cover load failed:",
          error,
        );
      }
    }

    loadSavedDesign();

    return () => {
      cancelled = true;
    };
  }, [
    customizationId,
    physicalConfig.size,
    physicalConfig.orientation,
  ]);

  useEffect(() => {
    latestSurfacesRef.current = surfaces;

    if (!hydratedRef.current) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      if (savingRef.current) return;

      savingRef.current = true;

      try {
        await fetch(`/api/custom-cover/${customizationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            design: {
              front: latestSurfacesRef.current.front,
              insideFront: latestSurfacesRef.current.insideFront,
              insideBack: latestSurfacesRef.current.insideBack,
              back: latestSurfacesRef.current.back,
              canvasWidth:
                latestSurfacesRef.current[activeSide].canvasWidth,
              canvasHeight:
                latestSurfacesRef.current[activeSide].canvasHeight,
              canvasSize:
                latestSurfacesRef.current[activeSide].canvasSize,
              canvasOrientation:
                latestSurfacesRef.current[activeSide].canvasOrientation,
              branding: {
                mineNote: true,
                auraCraft: false,
                logoVariant: "default",
              },
            },
          }),
        });
      } catch (error) {
        console.error("Custom cover autosave failed:", error);
      } finally {
        savingRef.current = false;
      }
    }, 700);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [surfaces, customizationId, productId, activeSide]);

  const commit = (
    updater: (
      current: Record<EditorSide, DesignSurface>,
    ) => Record<EditorSide, DesignSurface>,
  ) => {
    setSurfaces((current) => {
      const next = updater(current);

      setHistory((previous) => ({
        past: [
          ...previous.past,
          structuredClone(current),
        ].slice(-50),
        future: [],
      }));

      return next;
    });
  };

  const updateActiveSurface = (
    updater: (surface: DesignSurface) => DesignSurface,
  ) => {
    commit((current) => ({
      ...current,
      [activeSide]: updater(current[activeSide]),
    }));
  };

  const handleUndo = () => {
    setHistory((currentHistory) => {
      const previous = currentHistory.past.at(-1);

      if (!previous) return currentHistory;

      setSurfaces((current) => ({
        ...previous,
      }));

      return {
        past: currentHistory.past.slice(0, -1),
        future: [
          structuredClone(surfaces),
          ...currentHistory.future,
        ],
      };
    });

    setSelectedElementId(null);
  };

  const handleRedo = () => {
    setHistory((currentHistory) => {
      const next = currentHistory.future[0];

      if (!next) return currentHistory;

      setSurfaces({
        ...next,
      });

      return {
        past: [
          ...currentHistory.past,
          structuredClone(surfaces),
        ],
        future: currentHistory.future.slice(1),
      };
    });

    setSelectedElementId(null);
  };

  const updateElement = (
    patch: Partial<CanvasElement>,
  ) => {
    if (!selectedElementId) return;

    updateActiveSurface((current) => ({
      ...current,
      elements: current.elements.map((element) =>
        element.id === selectedElementId
          ? { ...element, ...patch }
          : element,
      ),
    }));
  };

  const moveElement = (
    elementId: string,
    x: number,
    y: number,
  ) => {
    setSurfaces((current) => ({
      ...current,
      [activeSide]: {
        ...current[activeSide],
        elements: current[activeSide].elements.map(
          (element) =>
            element.id === elementId
              ? { ...element, x, y }
              : element,
        ),
      },
    }));
  };

  const addText = () => {
    const element: CanvasElement = {
      id: makeId("text"),
      type: "text",
      x: activeSurface.canvasWidth * 0.15,
      y: activeSurface.canvasHeight * 0.4,
      width: activeSurface.canvasWidth * 0.7,
      height: activeSurface.canvasHeight * 0.12,
      rotation: 0,
      opacity: 1,
      text: "Your Text",
      fontSize: 72,
      fontWeight: 600,
      color: "#111111",
      textAlign: "center",
      lineHeight: 1.2,
      letterSpacing: 0,
      zIndex: activeSurface.elements.length + 1,
    };

    updateActiveSurface((current) => ({
      ...current,
      elements: [...current.elements, element],
    }));

    setSelectedElementId(element.id);
  };

  const addShape = (
    shape: "rectangle" | "circle",
  ) => {
    const size = Math.min(
      activeSurface.canvasWidth,
      activeSurface.canvasHeight,
    ) * 0.25;

    const element: CanvasElement = {
      id: makeId("shape"),
      type: "shape",
      x: (activeSurface.canvasWidth - size) / 2,
      y: (activeSurface.canvasHeight - size) / 2,
      width: size,
      height: size,
      rotation: 0,
      opacity: 1,
      shape,
      fill: "#111111",
      borderRadius: 0,
      zIndex: activeSurface.elements.length + 1,
    };

    updateActiveSurface((current) => ({
      ...current,
      elements: [...current.elements, element],
    }));

    setSelectedElementId(element.id);
  };

  const uploadImage = () => {
    fileInputRef.current?.click();
  };

  const handleFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    const localUrl = URL.createObjectURL(file);

    const element: CanvasElement = {
      id: makeId("image"),
      type: "image",
      x: activeSurface.canvasWidth * 0.15,
      y: activeSurface.canvasHeight * 0.15,
      width: activeSurface.canvasWidth * 0.7,
      height: activeSurface.canvasHeight * 0.7,
      rotation: 0,
      opacity: 1,
      src: localUrl,
      objectFit: "contain",
      imageScale: 1,
      imageOffsetX: 0,
      imageOffsetY: 0,
      borderRadius: 0,
      zIndex: activeSurface.elements.length + 1,
    };

    // IMPORTANT:
    // Update the ref immediately so a subsequent save/back
    // sees the newly-added image before React finishes rendering.
    const optimisticSurfaces = {
      ...latestSurfacesRef.current,
      [activeSide]: {
        ...latestSurfacesRef.current[activeSide],
        elements: [
          ...latestSurfacesRef.current[activeSide].elements,
          element,
        ],
      },
    } as typeof surfaces;

    latestSurfacesRef.current = optimisticSurfaces;
    setSurfaces(optimisticSurfaces);
    setSelectedElementId(element.id);

    try {
      const formData = new FormData();

      formData.append("side", activeSide);
      formData.append("file", file);

      const response = await fetch(
        `/api/custom-cover/${customizationId}/assets`,
        {
          method: "POST",
          body: formData,
        },
      );

      const text = await response.text();

      let payload: any = {};

      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(
          payload?.error || "Unable to upload image.",
        );
      }

      const asset = payload?.asset;

      if (!asset?.id) {
        throw new Error(
          "Image upload completed without an asset ID.",
        );
      }

      const savedSurfaces = {
        ...latestSurfacesRef.current,
        [activeSide]: {
          ...latestSurfacesRef.current[activeSide],
          elements:
            latestSurfacesRef.current[activeSide].elements.map(
              (item) =>
                item.id === element.id
                  ? {
                      ...item,
                      src:
                        asset.previewUrl || localUrl,
                      assetId: asset.id,
                    }
                  : item,
            ),
        },
      } as typeof surfaces;

      latestSurfacesRef.current = savedSurfaces;
      setSurfaces(savedSurfaces);

      // Do NOT wait for the autosave timer.
      // The uploaded image is persisted immediately.
      await saveDesign(savedSurfaces);

      URL.revokeObjectURL(localUrl);
    } catch (error) {
      const rolledBackSurfaces = {
        ...latestSurfacesRef.current,
        [activeSide]: {
          ...latestSurfacesRef.current[activeSide],
          elements:
            latestSurfacesRef.current[activeSide].elements.filter(
              (item) => item.id !== element.id,
            ),
        },
      } as typeof surfaces;

      latestSurfacesRef.current = rolledBackSurfaces;
      setSurfaces(rolledBackSurfaces);
      setSelectedElementId(null);

      URL.revokeObjectURL(localUrl);

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to upload image.",
      );
    }
  };

  const changeBackground = () => {
    const color = window.prompt(
      "Enter background color",
      activeSurface.background || "#ffffff",
    );

    if (!color) return;

    updateActiveSurface((current) => ({
      ...current,
      background: color.trim(),
    }));
  };

  const generateAi = async () => {
    const prompt = window.prompt(
      "Describe your cover design",
      "A premium modern notebook cover, clean composition, elegant typography space, print-ready artwork",
    );

    if (!prompt?.trim()) return;

    setBusy(true);

    try {
      const response = await fetch(
        "/api/custom-cover/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customizationId,
            prompt: prompt.trim(),
            sides: [activeSide],
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "AI generation failed.",
        );
      }

      const assets =
        Array.isArray(payload.assets)
          ? payload.assets
          : Array.isArray(payload?.generation?.assets)
            ? payload.generation.assets
            : [];

      const generated = assets.find(
        (asset: {
          side?: EditorSide;
        }) => asset.side === activeSide,
      );

      if (!generated) {
        throw new Error(
          "AI generated successfully, but no preview asset was returned.",
        );
      }

      const element: CanvasElement = {
        id: makeId("ai"),
        type: "image",
        x: 0,
        y: 0,
        width: activeSurface.canvasWidth,
        height: activeSurface.canvasHeight,
        rotation: 0,
        opacity: 1,
        src:
          generated.previewUrl ||
          generated.url ||
          generated.signedUrl ||
          "",
        assetId:
          generated.id ||
          generated.assetId,
        objectFit: "cover",
        imageScale: 1,
        imageOffsetX: 0,
        imageOffsetY: 0,
        borderRadius: 0,
        zIndex: activeSurface.elements.length + 1,
      };

      if (!element.src) {
        throw new Error(
          "AI asset was returned without a usable preview URL.",
        );
      }

      updateActiveSurface((current) => ({
        ...current,
        elements: [
          ...current.elements.filter(
            (item) =>
              !(
                item.type === "image" &&
                item.assetId === element.assetId
              ),
          ),
          element,
        ],
      }));

      setSelectedElementId(element.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "AI generation failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const saveDesign = async (
    nextSurfaces: typeof surfaces = latestSurfacesRef.current,
  ) => {
    const currentSurface =
      nextSurfaces[activeSide] ?? nextSurfaces.front;

    const response = await fetch(
      `/api/custom-cover/${customizationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          design: {
            front: nextSurfaces.front,
            insideFront: nextSurfaces.insideFront,
            insideBack: nextSurfaces.insideBack,
            back: nextSurfaces.back,
            canvasWidth: currentSurface.canvasWidth,
            canvasHeight: currentSurface.canvasHeight,
            canvasSize: currentSurface.canvasSize,
            canvasOrientation:
              currentSurface.canvasOrientation,
            branding: {
              mineNote: true,
              auraCraft: false,
              logoVariant: "default",
            },
          },
        }),
      },
    );

    const text = await response.text();

    let payload: any = {};

    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(
        payload?.error || "Unable to save customization.",
      );
    }

    return true;
  };

  const save = async () => {
    setBusy(true);

    try {
      await saveDesign(latestSurfacesRef.current);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to save customization.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleEditorBack = async () => {
    if (busy) return;

    setBusy(true);

    try {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      await saveDesign(latestSurfacesRef.current);

      window.history.back();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to save customization.",
      );
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    setBusy(true);

    try {
      await save();

      const response = await fetch(
        `/api/custom-cover/${customizationId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Unable to approve customization.",
        );
      }

      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to approve customization.",
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteElement = () => {
    if (!selectedElementId) return;

    updateActiveSurface((current) => ({
      ...current,
      elements: current.elements.filter(
        (element) =>
          element.id !== selectedElementId,
      ),
    }));

    setSelectedElementId(null);
  };

  const duplicateElement = () => {
    if (!selectedElement) return;

    const copy: CanvasElement = {
      ...selectedElement,
      id: makeId(selectedElement.type),
      x: selectedElement.x + 40,
      y: selectedElement.y + 40,
      zIndex: activeSurface.elements.length + 1,
    };

    updateActiveSurface((current) => ({
      ...current,
      elements: [...current.elements, copy],
    }));

    setSelectedElementId(copy.id);
  };

  useEffect(() => {
    setSelectedElementId(null);
  }, [activeSide]);

  return (
    <div className="h-dvh w-full overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      <DesktopEditor
        activeSide={activeSide}
        setActiveSide={setActiveSide}
        onBack={handleEditorBack}
        surface={activeSurface ?? defaultSurface}
        productImage={productImage}
        productName={productName}
        selectedElementId={selectedElementId}
        onSelectElement={(id) =>
          setSelectedElementId(id || null)
        }
        onMoveElement={moveElement}
        onAddText={addText}
        onAddShape={addShape}
        onUploadImage={uploadImage}
        onBackground={changeBackground}
        onAiDesign={generateAi}
        onPreview={() => setPreviewOpen(true)}
        onApprove={approve}
        onSave={save}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
        onDuplicateElement={duplicateElement}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        busy={busy}
      />

      <PlaceholderEditor
        activeSide={activeSide}
        setActiveSide={setActiveSide}
        onBack={handleEditorBack}
      />

      {previewOpen && (
        <PreviewOverlay
          surfaces={surfaces}
          activeSide={activeSide}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
