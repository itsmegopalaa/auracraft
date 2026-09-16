/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ChangeEvent,
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

type EditorElementType = "text" | "image" | "shape";

type EditorElement = {
  id: string;
  type: EditorElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right";
  color?: string;
  letterSpacing?: number;
  lineHeight?: number;
  src?: string;
  objectFit?: "cover" | "contain" | "fill";
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  shape?: "rectangle" | "circle";
  fill?: string;
  borderRadius?: number;
};

type DesignState = {
  background: string;
  elements: EditorElement[];
};

type Props = {
  customizationId: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  physicalConfig?: {
    size: "A4" | "A5";
    pages: 100 | 150 | 200;
    paper: "plain" | "ruled" | "dotGrid";
    orientation: "portrait" | "landscape";
    quantity: number;
  };
};

type Interaction =
  | {
      type: "drag";
      id: string;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    }
  | {
      type: "resize";
      id: string;
      handle: "nw" | "ne" | "sw" | "se";
      startX: number;
      startY: number;
      originX: number;
      originY: number;
      originWidth: number;
      originHeight: number;
    }
  | {
      type: "rotate";
      id: string;
      centerX: number;
      centerY: number;
      startX: number;
      startY: number;
      startRotation: number;
    };

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 760;

const initialDesign: DesignState = {
  background: "#ffffff",
  elements: [],
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function CustomCoverEditor({
  customizationId,
  productId,
  productName,
  productImage,
  physicalConfig,
}: Props) {
  const router = useRouter();
  const { addCustomCoverToCart } = useCart();

  const [design, setDesign] = useState<DesignState>(initialDesign);
  const [history, setHistory] = useState<DesignState[]>([]);
  const [future, setFuture] = useState<DesignState[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<
    "select" | "text" | "image" | "shape" | "ai"
  >("select");
  const [zoom, setZoom] = useState(0.72);
  const [fitZoom, setFitZoom] = useState(0.72);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState<"properties" | "background" | "ai">(
    "properties",
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [approving, setApproving] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState(
    productId ?? "",
  );
  const [selectedProductName, setSelectedProductName] = useState(
    productName ?? "Custom Cover",
  );
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState<
    Array<{
      id: string;
      name: string;
      image: string | null;
      price: number;
      category: string | null;
    }>
  >([]);
  const [productSearching, setProductSearching] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const canvasViewportRef = useRef<HTMLDivElement | null>(null);
  const interactionRef = useRef<Interaction | null>(null);

  const selectedElement = useMemo(
    () =>
      design.elements.find((element) => element.id === selectedId) ?? null,
    [design.elements, selectedId],
  );

  useEffect(() => {
    const raw = localStorage.getItem(
      `minenote-custom-cover-${customizationId}`,
    );

    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as DesignState;

      if (
        parsed &&
        typeof parsed.background === "string" &&
        Array.isArray(parsed.elements)
      ) {
        // Local draft hydration from browser storage.
        // This intentional state update is needed to restore the saved editor draft.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDesign(parsed);
      }
    } catch {
      // Ignore malformed local data.
    }
  }, [customizationId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(
          `minenote-custom-cover-${customizationId}`,
          JSON.stringify(design),
        );
        setSaved(true);
      } catch {
        setSaved(false);
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [design, customizationId]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedId(null);
      }

      if (
        (event.key === "Backspace" || event.key === "Delete") &&
        selectedId &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        deleteSelected();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  function commit(next: DesignState) {
    setHistory((current) => [...current.slice(-39), design]);
    setFuture([]);
    setDesign(next);
    setSaved(false);
  }

  function updateElement(id: string, patch: Partial<EditorElement>) {
    commit({
      ...design,
      elements: design.elements.map((element) =>
        element.id === id ? { ...element, ...patch } : element,
      ),
    });
  }

  function addText() {
    const element: EditorElement = {
      id: makeId("text"),
      type: "text",
      x: 120,
      y: 300,
      width: 360,
      height: 90,
      rotation: 0,
      opacity: 1,
      text: "Your Text",
      fontSize: 42,
      fontWeight: "600",
      textAlign: "center",
      color: "#111111",
    };

    commit({
      ...design,
      elements: [...design.elements, element],
    });

    setSelectedId(element.id);
    setTool("select");
    setPanel("properties");
  }

  function addShape(shape: "rectangle" | "circle") {
    const element: EditorElement = {
      id: makeId("shape"),
      type: "shape",
      x: 175,
      y: 280,
      width: 250,
      height: 180,
      rotation: 0,
      opacity: 1,
      shape,
      fill: "#111111",
      borderRadius: shape === "circle" ? 999 : 24,
    };

    commit({
      ...design,
      elements: [...design.elements, element],
    });

    setSelectedId(element.id);
    setTool("select");
    setPanel("properties");
  }

  function handleImage(file: File) {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : null;
      if (!src) return;

      const element: EditorElement = {
        id: makeId("image"),
        type: "image",
        x: 100,
        y: 230,
        width: 400,
        height: 300,
        rotation: 0,
        opacity: 1,
        src,
        objectFit: "contain",
        imageScale: 1,
        imageOffsetX: 0,
        imageOffsetY: 0,
      };

      commit({
        ...design,
        elements: [...design.elements, element],
      });

      setSelectedId(element.id);
      setTool("select");
      setPanel("properties");
    };

    reader.readAsDataURL(file);
  }

  function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      event.target.value = "";
      return;
    }

    if (selectedElement?.type === "image") {
      if (!file.type.startsWith("image/")) {
        event.target.value = "";
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const src =
          typeof reader.result === "string" ? reader.result : null;

        if (!src || !selectedElement) return;

        updateElement(selectedElement.id, {
          src,
        });

        setTool("select");
        setPanel("properties");
      };

      reader.readAsDataURL(file);
    } else {
      handleImage(file);
    }

    event.target.value = "";
  }

  function deleteSelected() {
    if (!selectedId) return;

    commit({
      ...design,
      elements: design.elements.filter(
        (element) => element.id !== selectedId,
      ),
    });

    setSelectedId(null);
  }

  function undo() {
    const previous = history[history.length - 1];
    if (!previous) return;

    setFuture((current) => [design, ...current]);
    setHistory((current) => current.slice(0, -1));
    setDesign(previous);
    setSelectedId(null);
  }

  function redo() {
    const next = future[0];
    if (!next) return;

    setHistory((current) => [...current, design]);
    setFuture((current) => current.slice(1));
    setDesign(next);
    setSelectedId(null);
  }

  function resetDesign() {
    commit({
      background: initialDesign.background,
      elements: [],
    });

    setSelectedId(null);
  }

  function changeBackground(value: string) {
    commit({
      ...design,
      background: value,
    });
  }

  useEffect(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;

    const updateFitZoom = () => {
      const rect = viewport.getBoundingClientRect();

      const availableWidth = Math.max(220, rect.width - 32);
      const availableHeight = Math.max(300, rect.height - 32);

      const widthFit = availableWidth / CANVAS_WIDTH;
      const heightFit = availableHeight / CANVAS_HEIGHT;

      const nextFit = Math.max(
        0.4,
        Math.min(1.2, widthFit, heightFit),
      );

      setFitZoom(Number(nextFit.toFixed(3)));
    };

    updateFitZoom();

    const observer = new ResizeObserver(updateFitZoom);
    observer.observe(viewport);

    window.addEventListener("resize", updateFitZoom);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateFitZoom);
    };
  }, []);

  const displayZoom = Math.min(zoom, fitZoom);

  function getCanvasPoint(event: ReactPointerEvent) {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: (event.clientX - rect.left) / displayZoom,
      y: (event.clientY - rect.top) / displayZoom,
    };
  }

  function beginDrag(
    event: ReactPointerEvent,
    element: EditorElement,
  ) {
    event.stopPropagation();

    if (tool !== "select") return;

    const point = getCanvasPoint(event);

    setSelectedId(element.id);
    setPanel("properties");

    interactionRef.current = {
      type: "drag",
      id: element.id,
      startX: point.x,
      startY: point.y,
      originX: element.x,
      originY: element.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function beginResize(
    event: ReactPointerEvent,
    element: EditorElement,
    handle: "nw" | "ne" | "sw" | "se",
  ) {
    event.stopPropagation();

    const point = getCanvasPoint(event);

    interactionRef.current = {
      type: "resize",
      id: element.id,
      handle,
      startX: point.x,
      startY: point.y,
      originX: element.x,
      originY: element.y,
      originWidth: element.width,
      originHeight: element.height,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function beginRotate(
    event: ReactPointerEvent,
    element: EditorElement,
  ) {
    event.stopPropagation();

    const point = getCanvasPoint(event);

    interactionRef.current = {
      type: "rotate",
      id: element.id,
      centerX: element.x + element.width / 2,
      centerY: element.y + element.height / 2,
      startX: point.x,
      startY: point.y,
      startRotation: element.rotation,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent) {
    const interaction = interactionRef.current;
    if (!interaction) return;

    const point = getCanvasPoint(event);

    setDesign((current) => ({
      ...current,
      elements: current.elements.map((element) => {
        if (element.id !== interaction.id) return element;

        if (interaction.type === "drag") {
          return {
            ...element,
            x: Math.max(
              -element.width + 20,
              Math.min(
                CANVAS_WIDTH - 20,
                interaction.originX + point.x - interaction.startX,
              ),
            ),
            y: Math.max(
              -element.height + 20,
              Math.min(
                CANVAS_HEIGHT - 20,
                interaction.originY + point.y - interaction.startY,
              ),
            ),
          };
        }

        if (interaction.type === "resize") {
          const dx = point.x - interaction.startX;
          const dy = point.y - interaction.startY;

          const minWidth = 40;
          const minHeight = 30;

          let x = interaction.originX;
          let y = interaction.originY;
          let width = interaction.originWidth;
          let height = interaction.originHeight;

          if (interaction.handle.includes("e")) {
            width = Math.max(
              minWidth,
              Math.min(
                CANVAS_WIDTH - x,
                interaction.originWidth + dx,
              ),
            );
          }

          if (interaction.handle.includes("s")) {
            height = Math.max(
              minHeight,
              Math.min(
                CANVAS_HEIGHT - y,
                interaction.originHeight + dy,
              ),
            );
          }

          if (interaction.handle.includes("w")) {
            const maxX =
              interaction.originX + interaction.originWidth - minWidth;

            const nextX = Math.max(
              0,
              Math.min(maxX, interaction.originX + dx),
            );

            x = nextX;
            width = interaction.originX + interaction.originWidth - nextX;
          }

          if (interaction.handle.includes("n")) {
            const maxY =
              interaction.originY + interaction.originHeight - minHeight;

            const nextY = Math.max(
              0,
              Math.min(maxY, interaction.originY + dy),
            );

            y = nextY;
            height = interaction.originY + interaction.originHeight - nextY;
          }

          return {
            ...element,
            x,
            y,
            width,
            height,
          };
        }

        const angle =
          (Math.atan2(
            point.y - interaction.centerY,
            point.x - interaction.centerX,
          ) *
            180) /
          Math.PI;

        const startAngle =
          (Math.atan2(
            interaction.startY - interaction.centerY,
            interaction.startX - interaction.centerX,
          ) *
            180) /
          Math.PI;

        return {
          ...element,
          rotation: interaction.startRotation + angle - startAngle,
        };
      }),
    }));
  }

  function finishInteraction() {
    if (!interactionRef.current) return;

    interactionRef.current = null;
    setSaved(false);
  }

  async function searchProducts(query: string) {
    const normalized = query.trim();

    setProductQuery(query);

    if (!normalized) {
      setProductResults([]);
      return;
    }

    setProductSearching(true);

    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(normalized)}`,
      );

      if (!response.ok) {
        throw new Error("Unable to search products.");
      }

      const data = await response.json();

      setProductResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("PRODUCT SEARCH FAILED:", error);
      setProductResults([]);
    } finally {
      setProductSearching(false);
    }
  }

  function selectProduct(product: {
    id: string;
    name: string;
  }) {
    setSelectedProductId(product.id);
    setSelectedProductName(product.name);
    setProductQuery("");
    setProductResults([]);
    setSaved(false);
  }

  async function saveCustomization(): Promise<boolean> {
    if (saving) return false;

    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch(
        `/api/custom-cover/${customizationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            design,
            productId: selectedProductId || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to save customization.",
        );
      }

      try {
        localStorage.setItem(
          `minenote-custom-cover-${customizationId}`,
          JSON.stringify(design),
        );
      } catch {
        // Local cache is optional.
      }

      setSaved(true);
      return true;
    } catch (error) {
      console.error("CUSTOM COVER SAVE FAILED:", error);
      setSaved(false);

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to save customization.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function approveAndAddToCart() {
    if (approving || saving) return;

    if (!selectedProductId) {
      window.alert("Please select a notebook before approval.");
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

    setApproving(true);

    try {
      const didSave = await saveCustomization();

      if (!didSave) {
        return;
      }

      const response = await fetch(
        `/api/custom-cover/${customizationId}/approve`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to approve custom cover.",
        );
      }

      const approvedProduct = data?.product;

      if (
        !approvedProduct?.id ||
        typeof approvedProduct.name !== "string" ||
        !Number.isFinite(Number(approvedProduct.price))
      ) {
        throw new Error(
          "Custom cover was approved, but product details were unavailable.",
        );
      }

      addCustomCoverToCart(
        {
          id: String(approvedProduct.id),
          name: approvedProduct.name,
          price: Number(approvedProduct.price),
          image: productImage || null,
        },
        customizationId,
        quantity,
      );

      router.push("/cart");
    } catch (error) {
      console.error(
        "CUSTOM COVER APPROVAL FAILED:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to approve custom cover.",
      );
    } finally {
      setApproving(false);
    }
  }

  async function runAI() {
    const prompt = aiPrompt.trim();

    if (!prompt || aiBusy) return;

    setAiBusy(true);

    try {
      const response = await fetch("/api/custom-cover/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customizationId,
          prompt,
          sides: ["front"],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to generate the cover with AI.",
        );
      }

      const assetsResponse = await fetch(
        `/api/custom-cover/${customizationId}/assets`,
      );

      const assetsData = await assetsResponse.json();

      if (!assetsResponse.ok) {
        throw new Error(
          assetsData?.error || "Unable to load the generated cover.",
        );
      }

      const generatedAsset = Array.isArray(assetsData?.assets)
        ? assetsData.assets.find(
            (asset: {
              side?: string;
              kind?: string;
              previewUrl?: string;
            }) =>
              asset.side === "front" &&
              asset.kind === "preview" &&
              typeof asset.previewUrl === "string" &&
              asset.previewUrl.length > 0,
          )
        : null;

      if (!generatedAsset?.previewUrl) {
        throw new Error(
          "AI generation completed, but the generated preview was not found.",
        );
      }

      const element: EditorElement = {
        id: makeId("ai-image"),
        type: "image",
        x: 0,
        y: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        rotation: 0,
        opacity: 1,
        src: generatedAsset.previewUrl,
        objectFit: "cover",
        imageScale: 1,
        imageOffsetX: 0,
        imageOffsetY: 0,
      };

      commit({
        ...design,
        elements: [
          ...design.elements.filter(
            (current) =>
              !(
                current.type === "image" &&
                current.id.startsWith("ai-image-")
              ),
          ),
          element,
        ],
      });

      setSelectedId(element.id);
      setTool("select");
      setPanel("properties");
      setAiPrompt("");
      setSaved(false);

      await saveCustomization();
    } catch (error) {
      console.error("CUSTOM COVER AI GENERATION FAILED:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to generate the cover with AI.",
      );
    } finally {
      setAiBusy(false);
    }
  }

  const canvasStyle: CSSProperties = {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    background: design.background || "#ffffff",
    transform: `scale(${displayZoom})`,
    transformOrigin: "center center",
    touchAction: "none",
    userSelect: "none",
  };

  const toolbarButton =
    "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[1.5rem] text-[10px] transition";

  return (
    <div className="min-h-[100dvh] bg-[var(--mn-bg)] text-[var(--mn-text)]">
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--mn-border)] bg-[var(--mn-bg)]/95 px-3 backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-[1.25rem] border border-[var(--mn-border)] px-3 py-2 text-sm text-[var(--mn-text-secondary)] hover:border-[var(--mn-border-strong)] hover:text-[var(--mn-text)]"
          >
            ← Back
          </button>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold">MineNote</p>
            <p className="text-[11px] text-[var(--mn-text-muted)]">Custom Cover</p>
          </div>
        </div>

        <div className="hidden text-center md:block">
          <p className="text-sm font-semibold">Design your cover</p>
          <p className="text-[11px] text-[var(--mn-text-muted)]">
            {saved ? "✓ Saved" : "Saving..."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-[var(--mn-text-muted)] lg:block">
            {productName || "Custom Cover"}
          </span>

          <button
            type="button"
            onClick={() => setPreview(true)}
            className="rounded-[1.25rem] border border-[var(--mn-border)] px-3 py-2 text-sm text-[var(--mn-text-secondary)] hover:border-[var(--mn-border-strong)] hover:text-[var(--mn-text)]"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={saveCustomization}
            disabled={saving}
            className="rounded-[1.25rem] bg-[var(--mn-accent)] px-4 py-2 text-sm font-semibold text-[var(--mn-accent-contrast)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      <div className="absolute left-4 top-[4.5rem] z-40 w-[min(360px,calc(100vw-2rem))]">
        <div className="rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 shadow-[var(--mn-shadow-lg)] backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
                Notebook
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--mn-text)]">
                {selectedProductName}
              </p>
            </div>
            {selectedProductId && (
              <span className="rounded-full bg-[color-mix(in_srgb,var(--mn-success)_10%,var(--mn-surface))] px-2 py-1 text-[10px] font-semibold text-[var(--mn-success)]">
                Selected
              </span>
            )}
          </div>

          <input
            value={productQuery}
            onChange={(event) => {
              void searchProducts(event.target.value);
            }}
            placeholder="Search notebook..."
            className="w-full rounded-[1.25rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-3 py-2 text-sm text-[var(--mn-text)] outline-none placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-border-strong)]"
          />

          {productSearching && (
            <p className="px-1 py-2 text-xs text-[var(--mn-text-muted)]">
              Searching...
            </p>
          )}

          {productResults.length > 0 && (
            <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
              {productResults.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => selectProduct(product)}
                  className="flex w-full items-center gap-3 rounded-[1.25rem] p-2 text-left transition hover:bg-[var(--mn-control-hover)]"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt=""
                      className="h-11 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-11 w-10 rounded-lg bg-[var(--mn-control-hover)]" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--mn-text)]">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-[var(--mn-text-muted)]">
                      ₹{product.price}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!selectedProductId && !productQuery && (
            <p className="mt-2 text-[11px] leading-4 text-[var(--mn-warning)]">
              You can design without a notebook. Select one before approval.
            </p>
          )}
        </div>
      </div>

      <main className="flex min-h-[calc(100dvh-4rem)] min-w-0 flex-col overflow-hidden lg:flex-row">
        {/* TOOLBAR */}
        <aside className="order-2 border-t border-[var(--mn-border)] bg-[var(--mn-surface-soft)] lg:order-1 lg:w-[92px] lg:border-r lg:border-t-0">
          <div className="flex items-center justify-center gap-2 overflow-x-auto p-2 lg:h-full lg:flex-col lg:justify-start lg:gap-3 lg:py-5">
            <button
              type="button"
              onClick={() => setTool("select")}
              className={`${toolbarButton} ${
                tool === "select"
                  ? "bg-[var(--mn-accent)] text-[var(--mn-accent-contrast)]"
                  : "text-[var(--mn-text-muted)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]"
              }`}
            >
              <span className="text-lg">↖</span>
              Select
            </button>

            <button
              type="button"
              onClick={addText}
              className={`${toolbarButton} ${
                tool === "text"
                  ? "bg-[var(--mn-accent)] text-[var(--mn-accent-contrast)]"
                  : "text-[var(--mn-text-muted)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]"
              }`}
            >
              <span className="text-lg font-semibold">T</span>
              Text
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`${toolbarButton} text-[var(--mn-text-muted)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]`}
            >
              <span className="text-lg">▧</span>
              {selectedElement?.type === "image" ? "Replace" : "Image"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
            />

            <button
              type="button"
              onClick={() => addShape("rectangle")}
              className={`${toolbarButton} text-[var(--mn-text-muted)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]`}
            >
              <span className="text-lg">□</span>
              Shape
            </button>

            <button
              type="button"
              onClick={() => {
                setPanel("background");
                setTool("select");
              }}
              className={`${toolbarButton} text-[var(--mn-text-muted)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]`}
            >
              <span className="text-lg">◐</span>
              Background
            </button>

            <button
              type="button"
              onClick={() => {
                setPanel("ai");
                setTool("ai");
              }}
              className={`${toolbarButton} ${
                tool === "ai"
                  ? "bg-[var(--mn-accent)] text-[var(--mn-accent-contrast)]"
                  : "text-[var(--mn-text-muted)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]"
              }`}
            >
              <span className="text-lg">✦</span>
              AI
            </button>
          </div>
        </aside>

        {/* CANVAS */}
        <section
        className="order-1 flex min-h-0 min-w-0 flex-1 flex-col lg:order-2"
        style={{
          background:
            "radial-gradient(circle at 50% 12%, #3d4046 0%, #292b30 48%, #18191c 100%)",
        }}>
          <div
    ref={canvasViewportRef}
    className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-10"
  >
            <div
              ref={canvasRef}
              className="relative shrink-0 shadow-[var(--mn-shadow-lg)]"
              style={canvasStyle}
              onPointerMove={handlePointerMove}
              onPointerUp={finishInteraction}
              onPointerCancel={finishInteraction}
              onClick={() => setSelectedId(null)}
            >
              <div className="pointer-events-none absolute inset-[32px] border border-dashed border-[var(--mn-border-strong)]" />

              {productImage && design.elements.length === 0 && (
                <img
                  src={productImage}
                  alt={productName || "Product"}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.07]"
                />
              )}

              {design.elements.map((element) => {
                const selected = element.id === selectedId;

                const style: CSSProperties = {
                  position: "absolute",
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  transform: `rotate(${element.rotation}deg)`,
                  opacity: element.opacity,
                  touchAction: "none",
                };

                return (
                  <div
                    key={element.id}
                    className={`absolute overflow-visible ${
                      selected ? "z-30" : "z-10"
                    }`}
                    style={style}
                    onPointerDown={(event) =>
                      beginDrag(event, element)
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedId(element.id);
                      setPanel("properties");
                    }}
                  >
                    {element.type === "text" && (
                      <div
                        className="flex h-full w-full items-center justify-center break-words"
                        style={{
                          fontSize: element.fontSize,
                          fontWeight: element.fontWeight,
                          color: element.color,
                          textAlign: element.textAlign,
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
                          background: element.fill,
                          borderRadius:
                            element.shape === "circle"
                              ? "50%"
                              : element.borderRadius,
                        }}
                      />
                    )}

                    {selected && (
                      <>
                        <div className="pointer-events-none absolute inset-0 border-2 border-black" />

                        <button
                          type="button"
                          aria-label="Resize top left"
                          className="absolute -left-2 -top-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-black bg-white"
                          onPointerDown={(event) =>
                            beginResize(event, element, "nw")
                          }
                        />

                        <button
                          type="button"
                          aria-label="Resize top right"
                          className="absolute -right-2 -top-2 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-black bg-white"
                          onPointerDown={(event) =>
                            beginResize(event, element, "ne")
                          }
                        />

                        <button
                          type="button"
                          aria-label="Resize bottom left"
                          className="absolute -bottom-2 -left-2 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-black bg-white"
                          onPointerDown={(event) =>
                            beginResize(event, element, "sw")
                          }
                        />

                        <button
                          type="button"
                          aria-label="Resize bottom right"
                          className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-black bg-white"
                          onPointerDown={(event) =>
                            beginResize(event, element, "se")
                          }
                        />

                        <button
                          type="button"
                          aria-label="Rotate element"
                          className="absolute -top-10 left-1/2 h-7 w-7 -translate-x-1/2 cursor-grab rounded-full border-2 border-black bg-white text-xs text-black shadow"
                          onPointerDown={(event) =>
                            beginRotate(event, element)
                          }
                        >
                          ↻
                        </button>

                        <button
                          type="button"
                          aria-label="Delete element"
                          className="absolute -right-9 -top-9 h-7 w-7 rounded-full bg-transparent text-xs text-[var(--mn-text)] shadow"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteSelected();
                          }}
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="flex flex-wrap items-center justify-center gap-1 border-t border-[var(--mn-border)] bg-[var(--mn-surface-soft)] px-3 py-2">
            <button
              type="button"
              onClick={undo}
              disabled={!history.length}
              className="rounded-lg px-3 py-2 text-lg text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-hover)] disabled:opacity-20"
            >
              ↶
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={!future.length}
              className="rounded-lg px-3 py-2 text-lg text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-hover)] disabled:opacity-20"
            >
              ↷
            </button>

            <div className="mx-2 h-5 w-px bg-[var(--mn-control-hover)]" />

            <button
              type="button"
              onClick={() =>
                setZoom((value) => Math.max(0.4, value - 0.1))
              }
              className="rounded-lg px-3 py-2 text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]"
            >
              −
            </button>

            <button
              type="button"
              onClick={() => setZoom(fitZoom)}
              className="min-w-[60px] rounded-lg px-2 py-2 text-xs text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              type="button"
              onClick={() =>
                setZoom((value) => Math.min(1.4, value + 0.1))
              }
              className="rounded-lg px-3 py-2 text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]"
            >
              +
            </button>

            <button
              type="button"
              onClick={() => setZoom(fitZoom)}              className="rounded-lg px-3 py-2 text-xs text-[var(--mn-text-muted)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)]"
            >
              Fit
            </button>

            <div className="mx-2 h-5 w-px bg-[var(--mn-control-hover)]" />

            <button
              type="button"
              onClick={resetDesign}
              disabled={saving || approving}
              className="rounded-lg px-3 py-2 text-xs text-[var(--mn-text-muted)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>

            <div className="mx-2 h-5 w-px bg-[var(--mn-control-hover)]" />

            <button
              type="button"
              onClick={saveCustomization}
              disabled={saving || approving}
              className="rounded-lg border border-[var(--mn-border-strong)] px-3 py-2 text-xs font-medium text-[var(--mn-text-secondary)] hover:bg-[var(--mn-control-hover)] hover:text-[var(--mn-text)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={approveAndAddToCart}
              disabled={saving || approving}
              className="rounded-lg bg-[var(--mn-accent)] px-4 py-2 text-xs font-semibold text-[var(--mn-accent-contrast)] shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {approving
                ? "Adding..."
                : `Approve & Add to Cart · ${physicalConfig?.quantity ?? 1}`}
            </button>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <aside className="order-3 w-full border-t border-[var(--mn-border)] bg-[var(--mn-surface-soft)] lg:w-[330px] lg:border-l lg:border-t-0">
          <div className="h-full overflow-y-auto p-5">
            {panel === "ai" ? (
              <div>
                <div className="mb-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
                    MineNote AI
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Design Assistant
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[var(--mn-text-muted)]">
                    Describe the cover you want and AI will help build the
                    concept directly inside the editor.
                  </p>
                </div>

                <label className="text-xs text-[var(--mn-text-muted)]">
                  Describe your design
                </label>

                <textarea
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  placeholder="A dark anime warrior under a red moon..."
                  rows={6}
                  className="mt-2 w-full resize-none rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-4 text-sm outline-none placeholder:text-[var(--mn-text-muted)] focus:border-[var(--mn-border-strong)]"
                />

                <button
                  type="button"
                  disabled={!aiPrompt.trim() || aiBusy}
                  onClick={runAI}
                  className="mt-3 w-full rounded-[1.5rem] bg-[var(--mn-accent)] py-3 text-sm font-semibold text-[var(--mn-accent-contrast)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {aiBusy ? "Preparing..." : "✦ Generate with AI"}
                </button>

                <div className="mt-7">
                  <p className="mb-3 text-xs font-semibold text-[var(--mn-text-muted)]">
                    Quick ideas
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Minimal",
                      "Anime",
                      "Gaming",
                      "Aesthetic",
                      "Dark",
                      "Space",
                    ].map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() =>
                          setAiPrompt(`Create a ${idea.toLowerCase()} cover`)
                        }
                        className="rounded-full border border-[var(--mn-border)] px-3 py-2 text-xs text-[var(--mn-text-muted)] hover:border-[var(--mn-border-strong)] hover:text-[var(--mn-text)]"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-4">
                  <p className="text-xs font-semibold text-[var(--mn-text-secondary)]">
                    AI workflow
                  </p>

                  <div className="mt-3 space-y-2 text-xs leading-5 text-[var(--mn-text-muted)]">
                    <p>01 — Describe your idea</p>
                    <p>02 — Generate a concept</p>
                    <p>03 — Review variations</p>
                    <p>04 — Add the result to your canvas</p>
                  </div>
                </div>
              </div>
            ) : panel === "background" ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
                  Design
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Background
                </h2>

                <div className="mt-7 flex flex-wrap gap-3">
                  {[
                    "#ffffff",
                    "#111111",
                    "#f5f1e8",
                    "#e8edf3",
                    "#efe1e1",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => changeBackground(color)}
                      className={`h-12 w-12 rounded-[1.5rem] border-2 ${
                        design.background === color
                          ? "border-[var(--mn-accent)]"
                          : "border-[var(--mn-border)]"
                      }`}
                      style={{ background: color }}
                    />
                  ))}
                </div>

                <label className="mt-7 block text-xs text-[var(--mn-text-muted)]">
                  Custom color
                </label>

                <input
                  type="color"
                  value={design.background}
                  onChange={(event) =>
                    changeBackground(event.target.value)
                  }
                  className="mt-2 h-12 w-full cursor-pointer rounded-[1.25rem] border border-[var(--mn-border)] bg-transparent"
                />

                <button
                  type="button"
                  onClick={() => setPanel("properties")}
                  className="mt-6 w-full rounded-[1.25rem] border border-[var(--mn-border)] py-3 text-sm text-[var(--mn-text-secondary)] hover:border-[var(--mn-border-strong)] hover:text-[var(--mn-text)]"
                >
                  Done
                </button>
              </div>
            ) : selectedElement ? (
              <div>
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
                      Selected
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      {selectedElement.type === "text"
                        ? "Text"
                        : selectedElement.type === "image"
                          ? "Image"
                          : "Shape"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={deleteSelected}
                    className="rounded-lg px-2 py-1 text-xs text-[var(--mn-danger)] hover:bg-[color-mix(in_srgb,var(--mn-danger)_10%,var(--mn-surface))] hover:text-[var(--mn-danger)]"
                  >
                    Delete
                  </button>
                </div>

                {selectedElement.type === "text" && (
                  <>
                    <label className="text-xs text-[var(--mn-text-muted)]">
                      Content
                    </label>

                    <textarea
                      value={selectedElement.text ?? ""}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          text: event.target.value,
                        })
                      }
                      rows={3}
                      className="mt-2 w-full resize-none rounded-[1.25rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-3 text-sm outline-none focus:border-[var(--mn-border-strong)]"
                    />

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[var(--mn-text-muted)]">
                          Size
                        </label>

                        <input
                          type="number"
                          min="8"
                          max="160"
                          value={selectedElement.fontSize ?? 42}
                          onChange={(event) =>
                            updateElement(selectedElement.id, {
                              fontSize: Number(event.target.value),
                            })
                          }
                          className="mt-2 w-full rounded-[1.25rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-3 py-2 text-sm outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[var(--mn-text-muted)]">
                          Weight
                        </label>

                        <select
                          value={selectedElement.fontWeight ?? "600"}
                          onChange={(event) =>
                            updateElement(selectedElement.id, {
                              fontWeight: event.target.value,
                            })
                          }
                          className="mt-2 w-full rounded-[1.25rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-3 py-2 text-sm outline-none"
                        >
                          <option value="400">Regular</option>
                          <option value="500">Medium</option>
                          <option value="600">Semibold</option>
                          <option value="700">Bold</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="text-xs text-[var(--mn-text-muted)]">
                        Alignment
                      </label>

                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {(["left", "center", "right"] as const).map(
                          (alignment) => (
                            <button
                              key={alignment}
                              type="button"
                              onClick={() =>
                                updateElement(selectedElement.id, {
                                  textAlign: alignment,
                                })
                              }
                              className={`rounded-[1.25rem] border py-2 text-xs capitalize ${
                                selectedElement.textAlign === alignment
                                  ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)]"
                                  : "border-[var(--mn-border)] text-[var(--mn-text-muted)]"
                              }`}
                            >
                              {alignment}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    <label className="mt-5 block text-xs text-[var(--mn-text-muted)]">
                      Color
                    </label>

                    <input
                      type="color"
                      value={selectedElement.color ?? "#111111"}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          color: event.target.value,
                        })
                      }
                      className="mt-2 h-11 w-full cursor-pointer rounded-[1.25rem] border border-[var(--mn-border)] bg-transparent"
                    />

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[var(--mn-text-muted)]">
                          Letter spacing
                        </label>

                        <input
                          type="number"
                          min="-5"
                          max="20"
                          step="0.5"
                          value={selectedElement.letterSpacing ?? 0}
                          onChange={(event) =>
                            updateElement(selectedElement.id, {
                              letterSpacing: Number(event.target.value),
                            })
                          }
                          className="mt-2 w-full rounded-[1.25rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-3 py-2 text-sm outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[var(--mn-text-muted)]">
                          Line height
                        </label>

                        <input
                          type="number"
                          min="0.8"
                          max="3"
                          step="0.1"
                          value={selectedElement.lineHeight ?? 1.2}
                          onChange={(event) =>
                            updateElement(selectedElement.id, {
                              lineHeight: Number(event.target.value),
                            })
                          }
                          className="mt-2 w-full rounded-[1.25rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-[var(--mn-text-muted)]">
                          Opacity
                        </label>

                        <span className="text-xs text-[var(--mn-text-muted)]">
                          {Math.round((selectedElement.opacity ?? 1) * 100)}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={selectedElement.opacity ?? 1}
                        onChange={(event) =>
                          updateElement(selectedElement.id, {
                            opacity: Number(event.target.value),
                          })
                        }
                        className="mt-3 w-full"
                      />
                    </div>
                  </>
                )}

                {selectedElement.type === "image" && (
                  <>
                    <div className="rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mn-text-muted)]">
                        Image
                      </p>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 w-full rounded-[1.25rem] bg-[var(--mn-accent)] py-3 text-sm font-semibold text-[var(--mn-accent-contrast)] hover:opacity-90"
                      >
                        Replace image
                      </button>

                      <label className="mt-5 block text-xs text-[var(--mn-text-muted)]">
                        Fit
                      </label>

                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {(["cover", "contain", "fill"] as const).map((fit) => (
                          <button
                            key={fit}
                            type="button"
                            onClick={() =>
                              updateElement(selectedElement.id, {
                                objectFit: fit,
                              })
                            }
                            className={`rounded-[1.25rem] border py-2 text-xs capitalize ${
                              (selectedElement.objectFit ?? "contain") === fit
                                ? "border-[var(--mn-accent)] bg-[var(--mn-accent-soft)] text-[var(--mn-text)]"
                                : "border-[var(--mn-border)] text-[var(--mn-text-muted)] hover:border-[var(--mn-border-strong)]"
                            }`}
                          >
                            {fit}
                          </button>
                        ))}
                      </div>

                      <label className="mt-5 block text-xs text-[var(--mn-text-muted)]">
                        Border radius · {Math.round(selectedElement.borderRadius ?? 0)}px
                        <input
                          type="range"
                          min="0"
                          max="120"
                          value={Math.min(selectedElement.borderRadius ?? 0, 120)}
                          onChange={(event) =>
                            updateElement(selectedElement.id, {
                              borderRadius: Number(event.target.value),
                            })
                          }
                          className="mt-3 w-full"
                        />
                      </label>

                      <div className="mt-5 flex items-center justify-between">
                        <label className="text-xs text-[var(--mn-text-muted)]">
                          Opacity
                        </label>
                        <span className="text-xs text-[var(--mn-text-muted)]">
                          {Math.round((selectedElement.opacity ?? 1) * 100)}%
                        </span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={selectedElement.opacity ?? 1}
                        onChange={(event) =>
                          updateElement(selectedElement.id, {
                            opacity: Number(event.target.value),
                          })
                        }
                        className="mt-3 w-full"
                      />
                    </div>
                  </>
                )}

                {selectedElement.type === "shape" && (
                  <>
                    <label className="text-xs text-[var(--mn-text-muted)]">
                      Shape
                    </label>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateElement(selectedElement.id, {
                            shape: "rectangle",
                            borderRadius: 24,
                          })
                        }
                        className="rounded-[1.25rem] border border-[var(--mn-border)] py-3 text-xs text-[var(--mn-text-secondary)] hover:border-[var(--mn-border-strong)]"
                      >
                        Rectangle
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateElement(selectedElement.id, {
                            shape: "circle",
                            borderRadius: 999,
                          })
                        }
                        className="rounded-[1.25rem] border border-[var(--mn-border)] py-3 text-xs text-[var(--mn-text-secondary)] hover:border-[var(--mn-border-strong)]"
                      >
                        Circle
                      </button>
                    </div>

                    <label className="mt-5 block text-xs text-[var(--mn-text-muted)]">
                      Fill
                    </label>

                    <input
                      type="color"
                      value={selectedElement.fill ?? "#111111"}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          fill: event.target.value,
                        })
                      }
                      className="mt-2 h-11 w-full cursor-pointer rounded-[1.25rem] border border-[var(--mn-border)] bg-transparent"
                    />

                    {selectedElement.shape !== "circle" && (
                      <label className="mt-5 block text-xs text-[var(--mn-text-muted)]">
                        Corner radius · {Math.round(selectedElement.borderRadius ?? 0)}px
                        <input
                          type="range"
                          min="0"
                          max="120"
                          value={Math.min(selectedElement.borderRadius ?? 0, 120)}
                          onChange={(event) =>
                            updateElement(selectedElement.id, {
                              borderRadius: Number(event.target.value),
                            })
                          }
                          className="mt-3 w-full"
                        />
                      </label>
                    )}

                    <div className="mt-5 flex items-center justify-between">
                      <label className="text-xs text-[var(--mn-text-muted)]">
                        Opacity
                      </label>
                      <span className="text-xs text-[var(--mn-text-muted)]">
                        {Math.round((selectedElement.opacity ?? 1) * 100)}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedElement.opacity ?? 1}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          opacity: Number(event.target.value),
                        })
                      }
                      className="mt-3 w-full"
                    />
                  </>
                )}

                <div className="mt-7 border-t border-[var(--mn-border)] pt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mn-text-muted)]">
                    Transform
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="text-xs text-[var(--mn-text-muted)]">
                      X
                      <input
                        type="number"
                        value={Math.round(selectedElement.x)}
                        onChange={(event) =>
                          updateElement(selectedElement.id, {
                            x: Number(event.target.value),
                          })
                        }
                        className="mt-2 w-full rounded-[1.25rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-3 py-2 text-sm text-[var(--mn-text)] outline-none"
                      />
                    </label>

                    <label className="text-xs text-[var(--mn-text-muted)]">
                      Y
                      <input
                        type="number"
                        value={Math.round(selectedElement.y)}
                        onChange={(event) =>
                          updateElement(selectedElement.id, {
                            y: Number(event.target.value),
                          })
                        }
                        className="mt-2 w-full rounded-[1.25rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-3 py-2 text-sm text-[var(--mn-text)] outline-none"
                      />
                    </label>

                    <label className="text-xs text-[var(--mn-text-muted)]">
                      Width
                      <input
                        type="number"
                        min="20"
                        value={Math.round(selectedElement.width)}
                        onChange={(event) =>
                          updateElement(selectedElement.id, {
                            width: Math.max(
                              20,
                              Number(event.target.value),
                            ),
                          })
                        }
                        className="mt-2 w-full rounded-[1.25rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-3 py-2 text-sm text-[var(--mn-text)] outline-none"
                      />
                    </label>

                    <label className="text-xs text-[var(--mn-text-muted)]">
                      Height
                      <input
                        type="number"
                        min="20"
                        value={Math.round(selectedElement.height)}
                        onChange={(event) =>
                          updateElement(selectedElement.id, {
                            height: Math.max(
                              20,
                              Number(event.target.value),
                            ),
                          })
                        }
                        className="mt-2 w-full rounded-[1.25rem] border border-[var(--mn-border)] bg-[var(--mn-control-bg)] px-3 py-2 text-sm text-[var(--mn-text)] outline-none"
                      />
                    </label>
                  </div>

                  <label className="mt-5 block text-xs text-[var(--mn-text-muted)]">
                    Rotation · {Math.round(selectedElement.rotation)}°
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedElement.rotation}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          rotation: Number(event.target.value),
                        })
                      }
                      className="mt-3 w-full"
                    />
                  </label>

                  <label className="mt-5 block text-xs text-[var(--mn-text-muted)]">
                    Opacity · {Math.round(selectedElement.opacity * 100)}%
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedElement.opacity}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          opacity: Number(event.target.value),
                        })
                      }
                      className="mt-3 w-full"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-[var(--mn-control-bg)] text-2xl">
                  ✦
                </div>

                <h2 className="text-lg font-semibold">
                  Build your cover
                </h2>

                <p className="mt-2 max-w-[230px] text-sm leading-6 text-[var(--mn-text-muted)]">
                  Select an element on the canvas or use a tool to start
                  designing.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setPanel("ai");
                    setTool("ai");
                  }}
                  className="mt-6 rounded-[1.25rem] border border-[var(--mn-border)] px-4 py-3 text-sm text-[var(--mn-text-secondary)] hover:border-[var(--mn-border-strong)] hover:text-[var(--mn-text)]"
                >
                  ✦ Open AI Assistant
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* PREVIEW */}
      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent/90 p-6 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className="absolute right-5 top-5 rounded-full border border-[var(--mn-border-strong)] px-4 py-2 text-sm text-[var(--mn-text-secondary)] hover:text-[var(--mn-text)]"
          >
            Close
          </button>

          <div
            className="relative overflow-hidden shadow-[var(--mn-shadow-lg)]"
            style={{
              width: 360,
              height: 456,
              background: design.background || "#ffffff",
            }}
          >
            {design.elements.map((element) => {
              const scale = 360 / CANVAS_WIDTH;

              const style: CSSProperties = {
                position: "absolute",
                left: element.x * scale,
                top: element.y * scale,
                width: element.width * scale,
                height: element.height * scale,
                transform: `rotate(${element.rotation}deg)`,
                opacity: element.opacity,
              };

              return (
                <div key={element.id} style={style}>
                  {element.type === "text" && (
                    <div
                      className="flex h-full w-full items-center justify-center break-words"
                      style={{
                        fontSize: (element.fontSize ?? 42) * scale,
                        fontWeight: element.fontWeight,
                        color: element.color,
                        textAlign: element.textAlign,
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
                      className="h-full w-full"
                      style={{
                        objectFit: element.objectFit ?? "contain",
                        borderRadius:
                          (element.borderRadius ?? 0) * scale,
                        transform: `translate(${
                          (element.imageOffsetX ?? 0) * scale
                        }px, ${
                          (element.imageOffsetY ?? 0) * scale
                        }px) scale(${element.imageScale ?? 1})`,
                        transformOrigin: "center center",
                      }}
                    />
                  )}

                  {element.type === "shape" && (
                    <div
                      className="h-full w-full"
                      style={{
                        background: element.fill,
                        borderRadius:
                          element.shape === "circle"
                            ? "50%"
                            : (element.borderRadius ?? 0) * scale,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
