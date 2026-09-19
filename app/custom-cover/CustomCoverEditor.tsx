"use client";

import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";


function StudioIcon({
  name,
  size = 18,
  strokeWidth = 1.8,
  className = "",
}: {
  name:
    | "back"
    | "save"
    | "preview"
    | "cart"
    | "check"
    | "undo"
    | "redo"
    | "select"
    | "sparkles"
    | "text"
    | "image"
    | "shape"
    | "close"
    | "delete"
    | "duplicate"
    | "forward"
    | "backward"
    | "front"
    | "layers";
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "back":
      return <svg {...common}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>;
    case "save":
      return <svg {...common}><path d="M5 4h11l3 3v13H5z"/><path d="M8 4v6h8V4"/><path d="M8 20v-6h8v6"/></svg>;
    case "preview":
      return <svg {...common}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>;
    case "cart":
      return <svg {...common}><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="19" r="1"/><circle cx="18" cy="19" r="1"/></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>;
    case "undo":
      return <svg {...common}><path d="M9 7H5v4"/><path d="M5 11c1.8-3.6 5-5.2 8.5-4.2 3.3.9 5.5 3.5 5.5 7.2 0 3.9-3 6.5-7 6.5-2.8 0-5.1-1.1-6.5-3"/></svg>;
    case "redo":
      return <svg {...common}><path d="M15 7h4v4"/><path d="M19 11c-1.8-3.6-5-5.2-8.5-4.2C7.2 7.7 5 10.3 5 14c0 3.9 3 6.5 7 6.5 2.8 0 5.1-1.1 6.5-3"/></svg>;
    case "select":
      return <svg {...common}><path d="m5 3 6.5 14 2-6 6-2L5 3Z"/><path d="m14 15 4 4"/></svg>;
    case "sparkles":
      return <svg {...common}><path d="m12 3-1.2 4.3L7 8.5l3.8 1.2L12 14l1.2-4.3L17 8.5l-3.8-1.2L12 3Z"/><path d="m19 13-.7 2.3L16 16l2.3.7L19 19l.7-2.3L22 16l-2.3-.7L19 13Z"/></svg>;
    case "text":
      return <svg {...common}><path d="M5 5h14"/><path d="M12 5v14"/><path d="M8 19h8"/></svg>;
    case "image":
      return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L6 20"/></svg>;
    case "shape":
      return <svg {...common}><rect x="4" y="4" width="8" height="8" rx="1"/><circle cx="16.5" cy="16.5" r="4.5"/></svg>;
    case "close":
      return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>;
    case "delete":
      return <svg {...common}><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m7 7 1 13h8l1-13"/><path d="M10 11v5M14 11v5"/></svg>;
    case "duplicate":
      return <svg {...common}><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>;
    case "forward":
      return <svg {...common}><path d="m9 6 6 6-6 6"/></svg>;
    case "backward":
      return <svg {...common}><path d="m15 6-6 6 6 6"/></svg>;
    case "front":
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case "layers":
      return <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m4 12 8 4 8-4"/><path d="m4 16 8 5 8-5"/></svg>;
  }
}

type CustomCoverApiErrorPayload = {
  error?: string;
};

type CustomCoverLoadPayload = {
  customization?: {
    design?: Record<string, unknown>;
  };
  design?: Record<string, unknown>;
  error?: string;
};

type CustomCoverAssetsPayload = {
  assets?: Array<{
    id: string;
    side: EditorSide;
    kind?: string;
    previewUrl?: string;
    storagePath?: string;
    width?: number;
    height?: number;
    mimeType?: string;
    fileSize?: number;
  }>;
  error?: string;
};

type CustomCoverUploadPayload = {
  asset?: {
    id: string;
    previewUrl?: string;
  };
  error?: string;
};

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
          {productImage && (
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
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${JSON.stringify(element.src)})`,
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize:
                        element.objectFit === "cover"
                          ? "cover"
                          : element.objectFit === "fill"
                            ? "100% 100%"
                            : "contain",
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
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
}: {
  element: CanvasElement | null;
  onUpdate: (patch: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
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

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold">
              Line Height
              <input
                type="number"
                className={field}
                min={0.7}
                max={3}
                step={0.1}
                value={element.lineHeight ?? 1.2}
                onChange={(event) =>
                  onUpdate({
                    lineHeight: clamp(
                      Number(event.target.value) || 1.2,
                      0.7,
                      3,
                    ),
                  })
                }
              />
            </label>

            <label className="text-xs font-semibold">
              Letter Spacing
              <input
                type="number"
                className={field}
                min={-10}
                max={30}
                step={0.5}
                value={element.letterSpacing ?? 0}
                onChange={(event) =>
                  onUpdate({
                    letterSpacing: clamp(
                      Number(event.target.value) || 0,
                      -10,
                      30,
                    ),
                  })
                }
              />
            </label>
          </div>
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

        <div className="mt-5 border-t border-[var(--mn-border)] pt-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--mn-text-muted)]">
            Layer
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onBringForward}
              className="h-9 rounded-lg border border-[var(--mn-border-strong)] text-xs font-semibold hover:bg-[var(--mn-control-hover)]"
            >
              ↑ Forward
            </button>
            <button
              type="button"
              onClick={onSendBackward}
              className="h-9 rounded-lg border border-[var(--mn-border-strong)] text-xs font-semibold hover:bg-[var(--mn-control-hover)]"
            >
              ↓ Backward
            </button>
            <button
              type="button"
              onClick={onBringToFront}
              className="h-9 rounded-lg border border-[var(--mn-border-strong)] text-xs font-semibold hover:bg-[var(--mn-control-hover)]"
            >
              ↑↑ Front
            </button>
            <button
              type="button"
              onClick={onSendToBack}
              className="h-9 rounded-lg border border-[var(--mn-border-strong)] text-xs font-semibold hover:bg-[var(--mn-control-hover)]"
            >
              ↓↓ Back
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onDuplicate}
          className="mt-4 h-10 w-full rounded-xl border border-[var(--mn-border-strong)] text-xs font-semibold hover:bg-[var(--mn-control-hover)]"
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
  onAddToCart,
  busy,
}: {
  surfaces: Record<EditorSide, DesignSurface>;
  activeSide: EditorSide;
  onClose: () => void;
  onAddToCart?: () => void;
  busy?: boolean;
}) {
  const surface = surfaces[activeSide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8">
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[var(--mn-bg)] shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--mn-border)] px-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--mn-accent)]">
              <StudioIcon name="preview" size={16} />
            Preview
            </p>
            <p className="text-sm font-semibold">
              {SIDES.find((item) => item.id === activeSide)?.label}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 items-center gap-2 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 text-sm font-semibold text-[var(--mn-text-secondary)] shadow-[var(--mn-shadow-sm)] transition hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] active:scale-[0.98]"
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

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--mn-border)] bg-[var(--mn-surface)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl px-4 text-sm font-semibold text-[var(--mn-text-secondary)] transition hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] active:scale-[0.98]"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={busy}
            className="flex h-11 items-center gap-2 rounded-xl bg-[var(--mn-accent)] px-5 text-sm font-semibold text-white shadow-[var(--mn-shadow-sm)] transition hover:brightness-95 hover:shadow-[var(--mn-shadow-md)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <StudioIcon name="cart" size={17} />
            {busy ? "Adding…" : "Add to Cart"}
          </button>
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
  onSave,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
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
  onSave: () => void;
  onUpdateElement: (patch: Partial<CanvasElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  busy: boolean;
  onBack: () => void;
}) {
  const tools = [
    { icon: "select", label: "Select" },
    { icon: "sparkles", label: "AI Design" },
    { icon: "text", label: "Text" },
    { icon: "image", label: "Image" },
    { icon: "shape", label: "Shape" },
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
            <StudioIcon name="back" size={17} />
            Back
          </button>

          <div className="h-7 w-px bg-[var(--mn-border)]" />

          <span className="hidden xl:inline-flex rounded-lg border border-[var(--mn-border-strong)] bg-[var(--mn-surface-soft)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mn-text-muted)]">
            🖥️ Desktop Editor · Full Screen
          </span>

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
            className="flex h-11 items-center gap-2 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 text-sm font-semibold text-[var(--mn-text)] shadow-[var(--mn-shadow-sm)] transition hover:border-[var(--mn-border-strong)] hover:bg-[var(--mn-control-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <StudioIcon name="save" size={16} />
            <span>{busy ? "Saving…" : "Save"}</span>
          </button>

          <button
            type="button"
            onClick={onPreview}
            className="flex h-11 items-center gap-2 rounded-xl bg-[var(--mn-accent)] px-5 text-sm font-semibold text-white shadow-[var(--mn-shadow-sm)] transition hover:brightness-95 hover:shadow-[var(--mn-shadow-md)] active:scale-[0.98]"
          >
            <StudioIcon name="preview" size={17} />
            <span>Preview</span>
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
            {tools.map((tool, index) => {
              const isSelectTool = tool.label === "Select";
              const label = isSelectTool && selectedElementId
                ? "Deselect"
                : tool.label;
              const icon = isSelectTool && selectedElementId
                ? "×"
                : tool.icon;

              return (
                <button
                  key={tool.label}
                  type="button"
                  disabled={busy && tool.label === "AI Design"}
                  onClick={() => {
                    if (isSelectTool) {
                      if (selectedElementId) {
                        onSelectElement("");
                      }
                      return;
                    }

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
                    <StudioIcon name={icon as any} size={17} />
                  </span>

                  <span className="text-[10px] font-semibold">
                    {label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-[var(--mn-border)] p-2">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className="flex h-9 items-center justify-center rounded-lg text-sm hover:bg-[var(--mn-control-hover)] disabled:opacity-30"
              >
                <StudioIcon name="undo" size={18} />
              </button>

              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className="flex h-9 items-center justify-center rounded-lg text-sm hover:bg-[var(--mn-control-hover)] disabled:opacity-30"
              >
                <StudioIcon name="redo" size={18} />
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden bg-[var(--mn-surface-soft)]">
          <div className="relative flex h-full min-h-0 w-full flex-1 items-center justify-center">
            <CoverCanvas
              surface={surface}
              productImage={productImage}
              productName={productName}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
              onMoveElement={onMoveElement}
            />

          </div>
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
            onBringForward={onBringForward}
            onSendBackward={onSendBackward}
            onBringToFront={onBringToFront}
            onSendToBack={onSendToBack}
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
  onSave,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  busy,
}: {
  activeSide: EditorSide;
  setActiveSide: (side: EditorSide) => void;
  onBack: () => void;
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
  onSave: () => void;
  onUpdateElement: (patch: Partial<CanvasElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  busy: boolean;
}) {
  const tools = [
    { icon: "select", label: "Select" },
    { icon: "sparkles", label: "AI Design" },
    { icon: "text", label: "Text" },
    { icon: "image", label: "Image" },
    { icon: "shape", label: "Shape" },
    { icon: "◐", label: "Background" },
  ];

  const selectedElement =
    surface.elements.find(
      (element) => element.id === selectedElementId,
    ) ?? null;

  const handleTool = (label: string) => {
    if (label === "AI Design") onAiDesign();
    if (label === "Text") onAddText();
    if (label === "Image") onUploadImage();
    if (label === "Shape") onAddShape("rectangle");
    if (label === "Background") onBackground();
  };

  return (
    <>
      {/* TABLET EDITOR */}
      <section className="hidden h-dvh w-full min-w-0 flex-col overflow-hidden bg-[var(--mn-bg)] text-[var(--mn-text)] md:flex lg:hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--mn-border)] px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-bg)]"
            >
              <StudioIcon name="back" size={17} />
            Back
            </button>

            <div className="h-6 w-px bg-[var(--mn-border)]" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-[-0.05em]">
                  MineNote
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--mn-accent)]" />
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--mn-text-muted)]">
                Custom Cover Studio
              </p>
            </div>

            <span className="ml-3 hidden sm:inline-flex rounded-lg border border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mn-accent)]">

            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className="flex h-10 items-center gap-2 rounded-xl bg-[var(--mn-accent)] px-4 text-sm font-semibold text-white shadow-[var(--mn-shadow-sm)] transition hover:brightness-95 hover:shadow-[var(--mn-shadow-md)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <StudioIcon name="save" size={16} />
              <span>{busy ? "Saving…" : "Save"}</span>
            </button>

            <button
              type="button"
              onClick={onPreview}
              className="flex h-10 items-center gap-2 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 text-sm font-semibold text-[var(--mn-text)] shadow-[var(--mn-shadow-sm)] transition hover:border-[var(--mn-accent)] hover:bg-[var(--mn-accent-soft)] hover:text-[var(--mn-accent)] active:scale-[0.98]"
            >
              <StudioIcon name="preview" size={16} />
              <span>Preview</span>
            </button>
          </div>
        </header>

        <div className="shrink-0 border-b border-[var(--mn-border)] bg-[var(--mn-bg)] px-3 py-2">
          <SideTabs
            activeSide={activeSide}
            onChange={setActiveSide}
          />
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
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

          <aside className="flex w-[300px] shrink-0 flex-col overflow-hidden border-l border-[var(--mn-border)] bg-[var(--mn-surface)]">
            <div className="border-b border-[var(--mn-border)] px-5 py-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)]">
                Inspector
              </p>
              <h2 className="mt-1 text-base font-semibold">
                Properties
              </h2>
            </div>

            <Inspector
              element={selectedElement}
              onUpdate={onUpdateElement}
              onDelete={onDeleteElement}
              onDuplicate={onDuplicateElement}
              onBringForward={onBringForward}
              onSendBackward={onSendBackward}
              onBringToFront={onBringToFront}
              onSendToBack={onSendToBack}
            />
          </aside>
        </div>

        <footer className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-[var(--mn-border)] bg-[var(--mn-surface)] px-3 py-2">
          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] p-1 shadow-[var(--mn-shadow-sm)]">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
              title="Undo"
              className="flex h-9 w-10 items-center justify-center rounded-lg border border-transparent text-lg font-medium text-[var(--mn-text)] transition hover:border-[var(--mn-border)] hover:bg-[var(--mn-surface)] hover:shadow-[var(--mn-shadow-sm)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <StudioIcon name="undo" size={18} />
            </button>

            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
              title="Redo"
              className="flex h-9 w-10 items-center justify-center rounded-lg border border-transparent text-lg font-medium text-[var(--mn-text)] transition hover:border-[var(--mn-border)] hover:bg-[var(--mn-surface)] hover:shadow-[var(--mn-shadow-sm)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <StudioIcon name="redo" size={18} />
            </button>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            {tools.map((tool) => {
              const isSelectTool = tool.label === "Select";
              const label = isSelectTool && selectedElementId
                ? "Deselect"
                : tool.label;
              const icon = isSelectTool && selectedElementId
                ? "×"
                : tool.icon;

              return (
                <button
                  key={tool.label}
                  type="button"
                  disabled={busy && tool.label === "AI Design"}
                  onClick={() => {
                    if (isSelectTool) {
                      if (selectedElementId) {
                        onSelectElement("");
                      }
                      return;
                    }

                    handleTool(tool.label);
                  }}
                  className={[
                    "flex h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-semibold",
                    isSelectTool
                      ? "bg-[var(--mn-accent-soft)] text-[var(--mn-accent)]"
                      : "text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]",
                  ].join(" ")}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] text-sm">
                    <StudioIcon name={icon as any} size={17} />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>

        </footer>
      </section>

      {/* MOBILE — SEPARATE TOUCH-FIRST EDITOR */}
      <section className="flex h-dvh flex-col overflow-hidden bg-[var(--mn-bg)] md:hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--mn-border)] bg-[var(--mn-surface)] px-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--mn-text-secondary)] transition hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] active:scale-95"
          >
            <StudioIcon name="back" size={18} />
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold">MineNote</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--mn-text-muted)]">
              Custom Cover Studio
            </p>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-[var(--mn-accent)] px-3.5 text-xs font-semibold text-white shadow-[var(--mn-shadow-sm)] transition hover:brightness-95 hover:shadow-[var(--mn-shadow-md)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <StudioIcon name="save" size={15} />
            <span>{busy ? "Saving…" : "Save"}</span>
          </button>

          <button
            type="button"
            onClick={onPreview}
            aria-label="Preview"
            className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-3 text-xs font-semibold text-[var(--mn-text)] shadow-[var(--mn-shadow-sm)] transition hover:border-[var(--mn-accent)] hover:bg-[var(--mn-accent-soft)] hover:text-[var(--mn-accent)] active:scale-[0.97]"
          >
            <StudioIcon name="preview" size={15} />
            <span>Preview</span>
          </button>
        </header>

        <div className="shrink-0 overflow-x-auto border-b border-[var(--mn-border)] bg-[var(--mn-surface)] px-2 py-2">
          <SideTabs
            activeSide={activeSide}
            onChange={setActiveSide}
          />
        </div>

        <main className="min-h-0 flex-1 overflow-hidden bg-[var(--mn-surface-soft)] p-3">
          <div className="flex h-full w-full items-center justify-center">
            <CoverCanvas
              surface={surface}
              productImage={productImage}
              productName={productName}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
              onMoveElement={onMoveElement}
            />
          </div>
        </main>

        <footer className="shrink-0 border-t border-[var(--mn-border)] bg-[var(--mn-surface)] px-3 py-2">
          <div className="mx-auto flex max-w-full items-center justify-center gap-2 overflow-x-auto">
            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] p-1">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                aria-label="Undo"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-[var(--mn-text-secondary)] transition hover:bg-[var(--mn-surface)] hover:text-[var(--mn-text)] active:scale-95 disabled:opacity-30"
              >
                <StudioIcon name="undo" size={18} />
              </button>

              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                aria-label="Redo"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-[var(--mn-text-secondary)] transition hover:bg-[var(--mn-surface)] hover:text-[var(--mn-text)] active:scale-95 disabled:opacity-30"
              >
                <StudioIcon name="redo" size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (selectedElementId) {
                  onSelectElement("");
                }
              }}
              className={[
                "flex h-11 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition active:scale-95",
                selectedElementId
                  ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] text-[var(--mn-accent)]"
                  : "border-[var(--mn-border)] bg-[var(--mn-surface-soft)] text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-hover)]",
              ].join(" ")}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--mn-border)] bg-[var(--mn-surface)] text-sm">
                ⌁
              </span>
              <span>{selectedElementId ? "Deselect" : "Select"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTool("AI Design")}
              disabled={busy}
              aria-label="AI Design"
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-accent-soft)] px-3 text-xs font-semibold text-[var(--mn-accent)] transition hover:border-[var(--mn-accent)] active:scale-95 disabled:opacity-40"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--mn-accent)]/20 bg-[var(--mn-surface)]/60 text-sm">
                ✦
              </span>
              <span>AI Design</span>
            </button>

            <div className="h-7 w-px shrink-0 bg-[var(--mn-border)]" />

            <button
              type="button"
              onClick={() => handleTool("Text")}
              aria-label="Text"
              className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] text-[var(--mn-text-secondary)] transition hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] active:scale-95"
            >
              <span className="text-sm font-bold leading-none">T</span>
              <span className="text-[8px] font-medium leading-none">Text</span>
            </button>

            <button
              type="button"
              onClick={() => handleTool("Image")}
              aria-label="Image"
              className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] text-[var(--mn-text-secondary)] transition hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] active:scale-95"
            >
              <span className="text-sm leading-none">▧</span>
              <span className="text-[8px] font-medium leading-none">Image</span>
            </button>

            <button
              type="button"
              onClick={() => handleTool("Shape")}
              aria-label="Shape"
              className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] text-[var(--mn-text-secondary)] transition hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] active:scale-95"
            >
              <span className="text-sm leading-none">□</span>
              <span className="text-[8px] font-medium leading-none">Shape</span>
            </button>
          </div>
        </footer>
      </section>
    </>
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
  const [backDialogOpen, setBackDialogOpen] =
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
  const saveAgainRef = useRef(false);
  const savePromiseRef = useRef<Promise<void> | null>(null);
  const skipDirtyEffectRef = useRef(false);
  const dirtyVersionRef = useRef(0);
  const savedVersionRef = useRef(0);
  const hasEditedRef = useRef(false);
  const latestSurfacesRef = useRef(surfaces);
  const flushSaveRef = useRef<() => Promise<void>>(async () => {});

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

        let customizationPayload: CustomCoverLoadPayload = {};
        let assetsPayload: CustomCoverAssetsPayload = {};

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

        skipDirtyEffectRef.current = true;
        setSurfaces(loaded);
        latestSurfacesRef.current = loaded;
        dirtyVersionRef.current = 0;
        savedVersionRef.current = 0;
        hasEditedRef.current = false;
        saveAgainRef.current = false;
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
    if (!hydratedRef.current) return;

    if (skipDirtyEffectRef.current) {
      skipDirtyEffectRef.current = false;
      latestSurfacesRef.current = surfaces;
      return;
    }

    latestSurfacesRef.current = surfaces;
    dirtyVersionRef.current += 1;
    hasEditedRef.current = true;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      void flushSaveRef.current();
    }, 700);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [surfaces]);

  const commit = (
    updater: (
      current: Record<EditorSide, DesignSurface>,
    ) => Record<EditorSide, DesignSurface>,
  ) => {
    const current = latestSurfacesRef.current;
    const next = updater(current);

    latestSurfacesRef.current = next;

    setHistory((previous) => ({
      past: [
        ...previous.past,
        structuredClone(current),
      ].slice(-50),
      future: [],
    }));

    setSurfaces(next);
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
    updateActiveSurface((current) => ({
      ...current,
      elements: current.elements.map((element) =>
        element.id === elementId
          ? { ...element, x, y }
          : element,
      ),
    }));
  };

  const reorderSelectedElement = (
    mode: "forward" | "backward" | "front" | "back",
  ) => {
    if (!selectedElementId) return;

    updateActiveSurface((current) => {
      const elements = [...current.elements];
      const index = elements.findIndex(
        (element) => element.id === selectedElementId,
      );

      if (index < 0) return current;

      const nextIndex =
        mode === "front"
          ? elements.length - 1
          : mode === "back"
            ? 0
            : mode === "forward"
              ? Math.min(index + 1, elements.length - 1)
              : Math.max(index - 1, 0);

      if (nextIndex === index) return current;

      const [selected] = elements.splice(index, 1);
      elements.splice(nextIndex, 0, selected);

      return {
        ...current,
        elements: elements.map((element, position) => ({
          ...element,
          zIndex: position + 1,
        })),
      };
    });
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

      let payload: CustomCoverUploadPayload = {};

      try {
        payload = text
          ? (JSON.parse(text) as CustomCoverUploadPayload)
          : {};
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
                      src: localUrl,
                      assetId: asset.id,
                    }
                  : item,
            ),
        },
      } as typeof surfaces;

      latestSurfacesRef.current = savedSurfaces;
      setSurfaces(savedSurfaces);

      // Wait until the uploaded asset ID is persisted with the design.
      // Keep the local object URL alive for the current canvas session.
      await flushSave();
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

    const responseText = await response.text();

    let payload: CustomCoverApiErrorPayload = {};

    try {
      payload = responseText
        ? (JSON.parse(responseText) as CustomCoverApiErrorPayload)
        : {};
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(
        payload.error || "Unable to save customization.",
      );
    }

    return true;
  };

  const flushSave = async () => {
    if (!hydratedRef.current) return;

    // If another save is already running, wait for it.
    // Save/Back must never continue before that request finishes.
    if (savePromiseRef.current) {
      await savePromiseRef.current;

      if (dirtyVersionRef.current > savedVersionRef.current) {
        await flushSave();
      }

      return;
    }

    const promise = (async () => {
      savingRef.current = true;

      try {
        while (
          dirtyVersionRef.current > savedVersionRef.current
        ) {
          const versionToSave = dirtyVersionRef.current;
          const snapshot = latestSurfacesRef.current;

          await saveDesign(snapshot);

          savedVersionRef.current = Math.max(
            savedVersionRef.current,
            versionToSave,
          );
        }
      } finally {
        savingRef.current = false;
      }
    })();

    savePromiseRef.current = promise;

    try {
      await promise;
    } finally {
      if (savePromiseRef.current === promise) {
        savePromiseRef.current = null;
      }

      if (
        dirtyVersionRef.current > savedVersionRef.current &&
        hydratedRef.current
      ) {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = setTimeout(() => {
          void flushSaveRef.current();
        }, 100);
      }
    }
  };

  useEffect(() => {
    flushSaveRef.current = flushSave;
  });

  const save = async () => {
    setBusy(true);

    try {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      // Save the exact latest editor state directly.
      await saveDesign(latestSurfacesRef.current);

      dirtyVersionRef.current = 0;
      savedVersionRef.current = 0;
      hasEditedRef.current = false;
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to save customization.",
      );
      throw error;
    } finally {
      setBusy(false);
    }
  };

  const saveAndLeave = async () => {
    if (busy) return;

    setBusy(true);

    try {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      // Back must always persist the exact latest editor state.
      await saveDesign(latestSurfacesRef.current);

      dirtyVersionRef.current = 0;
      savedVersionRef.current = 0;
      hasEditedRef.current = false;

      setBackDialogOpen(false);
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

  const deleteCustomization = async () => {
    if (busy) return;

    setBusy(true);

    try {
      const response = await fetch(
        `/api/custom-cover/${customizationId}`,
        {
          method: "DELETE",
        },
      );

      const text = await response.text();

      let payload: { error?: string } = {};

      try {
        payload = text
          ? (JSON.parse(text) as { error?: string })
          : {};
      } catch {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to delete project.",
        );
      }

      setBackDialogOpen(false);
      window.history.back();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete project.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleEditorBack = () => {
    if (busy) return;

    // Every Back action goes through the project decision dialog.
    // The project itself is never deleted just by leaving the editor.
    setBackDialogOpen(true);
  };


  const { addCustomCoverToCart } = useCart();

  const addToCartFromPreview = async () => {
    if (busy) return;

    if (!productId) {
      window.alert("Please select a notebook before adding it to cart.");
      return;
    }

    const quantity = Math.max(
      1,
      Math.floor(
        Number.isFinite(Number(physicalConfig?.quantity))
          ? Number(physicalConfig?.quantity)
          : 1,
      ),
    );

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
          payload?.error || "Unable to prepare your custom cover.",
        );
      }

      const product = payload?.product;

      if (
        !product?.id ||
        typeof product.name !== "string" ||
        !Number.isFinite(Number(product.price))
      ) {
        throw new Error("Product details were unavailable.");
      }

      addCustomCoverToCart(
        {
          id: String(product.id),
          name: product.name,
          price: Number(product.price),
          image: productImage || null,
        },
        customizationId,
        quantity,
      );

      router.push("/cart");
    } catch (error) {
      console.error("CUSTOM COVER ADD TO CART FAILED:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to add your custom cover to cart.",
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
        onSave={save}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
        onDuplicateElement={duplicateElement}
        onBringForward={() => reorderSelectedElement("forward")}
        onSendBackward={() => reorderSelectedElement("backward")}
        onBringToFront={() => reorderSelectedElement("front")}
        onSendToBack={() => reorderSelectedElement("back")}
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
        onSave={save}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
        onDuplicateElement={duplicateElement}
        onBringForward={() => reorderSelectedElement("forward")}
        onSendBackward={() => reorderSelectedElement("backward")}
        onBringToFront={() => reorderSelectedElement("front")}
        onSendToBack={() => reorderSelectedElement("back")}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        busy={busy}
      />

      {backDialogOpen && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-[var(--mn-overlay)]
            px-4 py-6
            backdrop-blur-md
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="back-dialog-title"
          aria-describedby="back-dialog-description"
        >
          <div
            className="
              relative w-full max-w-[440px]
              overflow-hidden
              rounded-[28px]
              border border-[var(--mn-border-strong)]
              bg-[var(--mn-surface)]
              text-[var(--mn-text)]
              shadow-[var(--mn-shadow-lg)]
              ring-1 ring-black/[0.03]
            "
          >
            <div
              className="
                pointer-events-none absolute inset-x-0 top-0 h-px
                bg-gradient-to-r
                from-transparent
                via-[var(--mn-accent)]
                to-transparent
                opacity-70
              "
            />

            <div className="px-6 pb-5 pt-6 sm:px-7 sm:pt-7">
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex h-11 w-11 shrink-0 items-center justify-center
                    rounded-2xl
                    border border-[var(--mn-border)]
                    bg-[var(--mn-accent-soft)]
                    text-[var(--mn-accent)]
                  "
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6l4 2"
                    />
                    <circle cx="12" cy="12" r="8.5" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-accent)]">
                    MineNote Studio
                  </p>

                  <h2
                    id="back-dialog-title"
                    className="
                      mt-1.5
                      text-[21px] font-semibold
                      leading-tight tracking-[-0.025em]
                      text-[var(--mn-text)]
                    "
                  >
                    Leave your project?
                  </h2>

                  <p
                    id="back-dialog-description"
                    className="
                      mt-2.5
                      text-sm leading-6
                      text-[var(--mn-text-secondary)]
                    "
                  >
                    Your custom cover is saved as a draft. Choose how you
                    want to continue.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--mn-border)] px-6 py-5 sm:px-7">
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => void saveAndLeave()}
                  disabled={busy}
                  className="
                    group flex w-full items-center justify-between
                    rounded-2xl
                    border border-[var(--mn-accent)]
                    bg-[var(--mn-accent)]
                    px-4 py-3.5
                    text-sm font-semibold
                    text-[var(--mn-accent-contrast)]
                    shadow-[var(--mn-shadow-sm)]
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:shadow-[var(--mn-shadow-md)]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[var(--mn-focus)]
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-[var(--mn-surface)]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    disabled:hover:translate-y-0
                  "
                >
                  <span>{busy ? "Saving..." : "Save & Back"}</span>

                  {!busy && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M13 6l6 6-6 6"
                      />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => void deleteCustomization()}
                  disabled={busy}
                  className="
                    group flex w-full items-center justify-between
                    rounded-2xl
                    border border-[var(--mn-danger)]/25
                    bg-[var(--mn-danger-soft)]
                    px-4 py-3.5
                    text-sm font-semibold
                    text-[var(--mn-danger)]
                    transition-all duration-200
                    hover:border-[var(--mn-danger)]/40
                    hover:bg-[var(--mn-danger)]/[0.10]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[var(--mn-danger)]
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-[var(--mn-surface)]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <span>Delete Project</span>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 opacity-80 transition-transform duration-200 group-hover:scale-105"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7h16M9 7V4h6v3M8 11v6M16 11v6M6 7l1 13h10l1-13"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setBackDialogOpen(false)}
                  disabled={busy}
                  className="
                    w-full rounded-2xl
                    px-4 py-3
                    text-sm font-medium
                    text-[var(--mn-text-secondary)]
                    transition-all duration-200
                    hover:bg-[var(--mn-control-hover)]
                    hover:text-[var(--mn-text)]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[var(--mn-focus)]
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-[var(--mn-surface)]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>
              </div>

              <p className="mt-4 text-center text-[10px] leading-4 text-[var(--mn-text-muted)]">
                Your draft remains available until you delete it or add it
                to your cart.
              </p>
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <PreviewOverlay surfaces={surfaces} activeSide={activeSide} onClose={() => setPreviewOpen(false)} onAddToCart={addToCartFromPreview} busy={busy} />
      )}
    </div>
  );
}
