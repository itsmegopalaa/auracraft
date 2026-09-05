"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useCart } from "@/app/context/CartContext";
import type { CoverSide } from "@/app/lib/customization";


type TemplateId =
  | "minimal"
  | "anime"
  | "aesthetic"
  | "adventure"
  | "gaming"
  | "premium";

type Customization = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  creationMethod: "ai" | "upload" | "template";
  status: string;
  templateId: string | null;
  customerName: string | null;
  customerText: string | null;
  design: Record<string, unknown>;
  aiBudget: {
    total: number;
    used: number;
    remaining: number;
  };
};

type UploadedAsset = {
  id: string;
  side: CoverSide;
  kind: "original";
  storagePath: string;
  width: number;
  height: number;
  mimeType: string;
  fileSize: number | null;
  previewUrl: string | null;
};

type Props = {
  customization: Customization;
};

const templates: Record<
  TemplateId,
  {
    label: string;
    emoji: string;
    front: string;
    insideFront: string;
    back: string;
    insideBack: string;
    accent: string;
  }
> = {
  minimal: {
    label: "Minimal",
    emoji: "◻️",
    front: "linear-gradient(145deg,#18181b,#27272a)",
    insideFront: "linear-gradient(145deg,#27272a,#3f3f46)",
    back: "linear-gradient(145deg,#09090b,#18181b)",
    insideBack: "linear-gradient(145deg,#18181b,#27272a)",
    accent: "#f4f4f5",
  },
  anime: {
    label: "Anime",
    emoji: "🌸",
    front: "linear-gradient(145deg,#312e81,#be185d,#f472b6)",
    insideFront: "linear-gradient(145deg,#4338ca,#9d174d)",
    back: "linear-gradient(145deg,#1e1b4b,#831843)",
    insideBack: "linear-gradient(145deg,#312e81,#701a75)",
    accent: "#f9a8d4",
  },
  aesthetic: {
    label: "Aesthetic",
    emoji: "✨",
    front: "linear-gradient(145deg,#292524,#78716c,#d6d3d1)",
    insideFront: "linear-gradient(145deg,#44403c,#57534e)",
    back: "linear-gradient(145deg,#1c1917,#44403c)",
    insideBack: "linear-gradient(145deg,#292524,#57534e)",
    accent: "#e7e5e4",
  },
  adventure: {
    label: "Adventure",
    emoji: "🏔️",
    front: "linear-gradient(145deg,#14532d,#166534,#a16207)",
    insideFront: "linear-gradient(145deg,#166534,#365314)",
    back: "linear-gradient(145deg,#052e16,#365314)",
    insideBack: "linear-gradient(145deg,#14532d,#365314)",
    accent: "#bef264",
  },
  gaming: {
    label: "Gaming",
    emoji: "🎮",
    front: "linear-gradient(145deg,#020617,#312e81,#7c3aed)",
    insideFront: "linear-gradient(145deg,#1e1b4b,#4338ca)",
    back: "linear-gradient(145deg,#020617,#1e1b4b)",
    insideBack: "linear-gradient(145deg,#020617,#312e81)",
    accent: "#a78bfa",
  },
  premium: {
    label: "Premium",
    emoji: "👑",
    front: "linear-gradient(145deg,#18181b,#3f3f46,#71717a)",
    insideFront: "linear-gradient(145deg,#27272a,#52525b)",
    back: "linear-gradient(145deg,#09090b,#27272a)",
    insideBack: "linear-gradient(145deg,#18181b,#3f3f46)",
    accent: "#facc15",
  },
};

function getCoverSideLabel(side: CoverSide): string {
  switch (side) {
    case "front":
      return "Front Cover";
    case "insideFront":
      return "Inside Front";
    case "back":
      return "Back Cover";
    case "insideBack":
      return "Inside Back";
  }
}

function getTemplateId(value: string | null): TemplateId {
  if (value && value in templates) {
    return value as TemplateId;
  }

  return "minimal";
}

function readDesignBackground(
  design: Record<string, unknown>,
  side: CoverSide
): string | undefined {
  const sideDesign = design[side];

  if (
    typeof sideDesign === "object" &&
    sideDesign !== null &&
    "background" in sideDesign
  ) {
    const background = (sideDesign as { background?: unknown }).background;

    if (typeof background === "string" && background.trim()) {
      return background;
    }
  }

  return undefined;
}

export default function CustomCoverEditor({
  customization,
}: Props) {
  const { addCustomCoverToCart } = useCart();

  const initialTemplate = getTemplateId(customization.templateId);

  const [side, setSide] = useState<CoverSide>("front");
  const [templateId, setTemplateId] =
    useState<TemplateId>(initialTemplate);

  const [customerName, setCustomerName] = useState(
    customization.customerName ?? ""
  );

  const [customerText, setCustomerText] = useState(
    customization.customerText ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [message, setMessage] = useState("");
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [uploadingSide, setUploadingSide] = useState<CoverSide | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetSide, setUploadTargetSide] =
    useState<CoverSide>("front");

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiNegativePrompt, setAiNegativePrompt] = useState("");
  const [aiTargetSides, setAiTargetSides] =
    useState<CoverSide | "all">("front");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [generationMessage, setGenerationMessage] =
    useState("");
  const [generationNumber, setGenerationNumber] =
    useState<number | null>(null);

  const template = templates[templateId];

  const existingDesign = useMemo(
    () =>
      customization.design &&
      typeof customization.design === "object"
        ? customization.design
        : {},
    [customization.design]
  );

  const storedBackground = readDesignBackground(
    existingDesign,
    side
  );

  const previewBackground =
    storedBackground ??
    template[side];

  useEffect(() => {
    let cancelled = false;

    async function loadAssets() {
      try {
        const response = await fetch(
          `/api/custom-cover/${customization.id}/assets`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!cancelled && Array.isArray(data.assets)) {
          setAssets(data.assets);
        }
      } catch {
        // Preview loading is non-blocking.
      }
    }

    void loadAssets();

    return () => {
      cancelled = true;
    };
  }, [customization.id]);

  const uploadedAssetForSide = assets.find(
    (asset) => asset.side === side
  );

  function openUpload(sideToUpload: CoverSide) {
    setUploadTargetSide(sideToUpload);
    setUploadMessage("");
    fileInputRef.current?.click();
  }

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingSide(uploadTargetSide);
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("side", uploadTargetSide);
      formData.append("file", file);

      const response = await fetch(
        `/api/custom-cover/${customization.id}/assets`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Unable to upload your artwork."
        );
      }

      const uploaded = data?.asset as UploadedAsset | undefined;

      if (!uploaded) {
        throw new Error("Upload completed without an asset.");
      }

      setAssets((current) => [
        ...current.filter(
          (asset) => asset.side !== uploaded.side
        ),
        uploaded,
      ]);

      setSide(uploaded.side);
      setUploadMessage(
        `${getCoverSideLabel(uploadTargetSide)} artwork uploaded ✓`
      );
    } catch (error) {
      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload your artwork."
      );
    } finally {
      setUploadingSide(null);
    }
  }

  async function generateWithAi() {
    const prompt = aiPrompt.trim();

    if (!prompt) {
      setGenerationMessage(
        "Describe the cover you want before generating."
      );
      return;
    }

    setGeneratingAi(true);
    setGenerationMessage("");

    try {
      const sides =
        aiTargetSides === "all"
          ? ["front", "insideFront", "back", "insideBack"]
          : [aiTargetSides];

      const response = await fetch(
        "/api/custom-cover/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customizationId: customization.id,
            prompt,
            negativePrompt:
              aiNegativePrompt.trim() || undefined,
            sides,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Unable to generate your custom cover."
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error ??
            "AI generation did not complete."
        );
      }

      if (
        typeof data.generationNumber === "number"
      ) {
        setGenerationNumber(data.generationNumber);
      }

      const assetsResponse = await fetch(
        `/api/custom-cover/${customization.id}/assets`,
        {
          cache: "no-store",
        }
      );

      if (assetsResponse.ok) {
        const assetsData =
          await assetsResponse.json().catch(() => null);

        if (Array.isArray(assetsData?.assets)) {
          setAssets(assetsData.assets);
        }
      }

      setGenerationMessage(
        `AI generation ${data.generationNumber ?? ""} completed ✓`
      );
    } catch (error) {
      setGenerationMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate your custom cover."
      );
    } finally {
      setGeneratingAi(false);
    }
  }

  async function saveDraft() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/custom-cover/${customization.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName,
            customerText,
            design: {
              ...existingDesign,
              front: {
                ...((existingDesign.front ?? {}) as Record<
                  string,
                  unknown
                >),
                background:
                  ((existingDesign.front ?? {}) as Record<
                    string,
                    unknown
                  >).background ?? template.front,
              },
              insideFront: {
                ...((existingDesign.insideFront ?? {}) as Record<
                  string,
                  unknown
                >),
                background:
                  ((existingDesign.insideFront ?? {}) as Record<
                    string,
                    unknown
                  >).background ?? template.insideFront,
              },
              back: {
                ...((existingDesign.back ?? {}) as Record<
                  string,
                  unknown
                >),
                background:
                  ((existingDesign.back ?? {}) as Record<
                    string,
                    unknown
                  >).background ?? template.back,
              },
              insideBack: {
                ...((existingDesign.insideBack ?? {}) as Record<
                  string,
                  unknown
                >),
                background:
                  ((existingDesign.insideBack ?? {}) as Record<
                    string,
                    unknown
                  >).background ?? template.insideBack,
              },
              branding: {
                ...((existingDesign.branding ?? {}) as Record<
                  string,
                  unknown
                >),
                mineNote: true,
                auraCraft: false,
                logoVariant:
                  ((existingDesign.branding ?? {}) as Record<
                    string,
                    unknown
                  >).logoVariant ?? "default",
              },
              ...(existingDesign.creativeDirection
                ? {
                    creativeDirection:
                      existingDesign.creativeDirection,
                  }
                : {}),
            },
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error ?? "Unable to save your draft."
        );
      }

      setMessage("Draft saved ✓");
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your draft."
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function approveAndAddToCart() {
    if (saving || approving || generatingAi) return;

    setApproving(true);
    setMessage("");

    try {
      const saved = await saveDraft();

      if (!saved) {
        return;
      }

      const response = await fetch(
        `/api/custom-cover/${customization.id}/approve`,
        {
          method: "POST",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Unable to approve your custom cover."
        );
      }

      addCustomCoverToCart(
        {
          id: data.product.id,
          name: data.product.name,
          price: data.product.price,
          image: customization.productImage,
        },
        data.customization.id
      );

      window.location.href = "/checkout";
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to approve your custom cover."
      );
    } finally {
      setApproving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      {/* PREVIEW */}
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
              Live Preview
            </p>

            <h2 className="mt-1 text-xl font-black tracking-tight">
              {customization.productName}
            </h2>
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-zinc-400">
            {template.emoji} {template.label}
          </span>
        </div>

        <div className="flex min-h-[560px] items-center justify-center rounded-2xl border border-white/5 bg-black/60 p-6 sm:p-10">
          <div className="w-full max-w-[360px]">
            <div
              className="relative mx-auto aspect-[216/279] w-full overflow-hidden rounded-[14px] border border-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
              style={{
                background: previewBackground,
              }}
            >
              {uploadedAssetForSide?.previewUrl ? (
                <img
                  src={uploadedAssetForSide.previewUrl}
                  alt={`${side} custom artwork`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}

              {/* subtle cover texture */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,.12),transparent_25%),linear-gradient(135deg,rgba(255,255,255,.05),transparent_45%,rgba(0,0,0,.18))]" />

              {/* safe-zone guide */}
              <div className="pointer-events-none absolute inset-[5%] rounded-[8px] border border-dashed border-white/10" />

              {side === "front" ? (
                <div className="relative flex h-full flex-col items-center justify-between p-[9%] text-center">
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70 sm:text-[10px]">
                    MineNote
                  </div>

                  <div className="flex max-w-[90%] flex-1 flex-col items-center justify-center">
                    <div className="mb-5 h-px w-12 bg-white/30" />

                    <h3
                      className="break-words text-2xl font-black leading-tight tracking-[-0.04em] text-white drop-shadow-lg sm:text-3xl"
                      style={{
                        textShadow:
                          "0 3px 20px rgba(0,0,0,.45)",
                      }}
                    >
                      {customerName || "Your Name"}
                    </h3>

                    <p className="mt-4 max-w-[95%] break-words text-xs font-medium leading-5 text-white/75 sm:text-sm">
                      {customerText || "Your story starts here."}
                    </p>

                    <div
                      className="mt-6 h-1 w-10 rounded-full"
                      style={{
                        backgroundColor: template.accent,
                      }}
                    />
                  </div>

                  <div className="text-[8px] font-bold uppercase tracking-[0.22em] text-white/45">
                    Personal Edition
                  </div>
                </div>
              ) : (
                <div className="relative flex h-full flex-col items-center justify-between p-[9%] text-center">
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 sm:text-[10px]">
                    MineNote
                  </div>

                  <div className="flex flex-1 flex-col items-center justify-center">
                    <div className="mb-5 text-3xl opacity-30">
                      ✦
                    </div>

                    <p className="max-w-[80%] text-xs font-medium leading-5 text-white/55 sm:text-sm">
                      Made for your story.
                    </p>
                  </div>

                  <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/35">
                    MineNote · Personal Edition
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">
              4-surface preview · Print proportions
            </p>
          </div>
        </div>

        {/* 4-SURFACE NAVIGATION */}
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1 sm:grid-cols-4">
          {(
            [
              ["front", "Front Cover"],
              ["insideFront", "Inside Front"],
              ["back", "Back Cover"],
              ["insideBack", "Inside Back"],
            ] as const
          ).map(([surface, label]) => (
            <button
              key={surface}
              type="button"
              onClick={() => setSide(surface)}
              className={`rounded-xl px-3 py-3 text-xs font-black transition sm:text-sm ${
                side === surface
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* EDITOR */}
      <section className="rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-7">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
            Cover Editor
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight">
            Make it personal.
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Your changes are saved to this customization draft.
            MineNote branding stays controlled by the system.
          </p>
        </div>

        <div className="space-y-7">
          {/* NAME */}
          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Your name
              </span>

              <span className="text-[10px] text-zinc-600">
                {customerName.length}/120
              </span>
            </div>

            <input
              value={customerName}
              maxLength={120}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
              placeholder="Enter your name"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-400/50"
            />
          </label>

          {/* QUOTE */}
          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Text / quote
              </span>

              <span className="text-[10px] text-zinc-600">
                {customerText.length}/120
              </span>
            </div>

            <textarea
              value={customerText}
              maxLength={120}
              rows={4}
              onChange={(event) =>
                setCustomerText(event.target.value)
              }
              placeholder="Write something meaningful..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-400/50"
            />
          </label>

          {/* AI GENERATION */}
          {customization.creationMethod === "ai" ? (
            <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.025] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-yellow-300">
                    Create with AI
                  </div>

                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    Describe the visual style, mood, subject, and
                    atmosphere you want on your notebook cover.
                  </p>
                </div>

                <span className="rounded-full border border-yellow-400/20 bg-yellow-400/[0.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-yellow-300">
                  {customization.aiBudget.remaining} generations remaining
                </span>
              </div>

              <div className="mt-4">
                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                      Describe your cover
                    </span>

                    <span className="text-[10px] text-zinc-600">
                      {aiPrompt.length}/1000
                    </span>
                  </div>

                  <textarea
                    value={aiPrompt}
                    maxLength={1000}
                    rows={5}
                    onChange={(event) =>
                      setAiPrompt(event.target.value)
                    }
                    placeholder="Example: A dark anime swordsman standing beneath a red moon, dramatic cinematic lighting, deep shadows, premium notebook artwork..."
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-400/50"
                  />
                </label>
              </div>

              <div className="mt-4">
                <label className="block">
                  <div className="mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                      Avoid
                    </span>
                  </div>

                  <input
                    value={aiNegativePrompt}
                    maxLength={1000}
                    onChange={(event) =>
                      setAiNegativePrompt(event.target.value)
                    }
                    placeholder="Optional: blurry, low quality, distorted..."
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-400/50"
                  />
                </label>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-black uppercase tracking-wider text-zinc-300">
                  Generate for
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {(
                    [
                      ["front", "Front Cover"],
                      ["insideFront", "Inside Front"],
                      ["back", "Back Cover"],
                      ["insideBack", "Inside Back"],
                      ["all", "All 4"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setAiTargetSides(value)
                      }
                      disabled={generatingAi}
                      className={`rounded-xl border px-3 py-3 text-xs font-black transition ${
                        aiTargetSides === value
                          ? "border-yellow-400/60 bg-yellow-400/[0.10] text-yellow-300"
                          : "border-white/10 bg-white/[0.025] text-zinc-500 hover:border-white/20 hover:text-white"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={generateWithAi}
                disabled={
                  generatingAi ||
                  !aiPrompt.trim()
                }
                className="mt-4 w-full rounded-2xl bg-yellow-400 px-5 py-4 text-sm font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingAi
                  ? "Creating your cover..."
                  : generationNumber === 2
                    ? "Generate Again ✨"
                    : "Generate with AI ✨"}
              </button>

              {generationMessage ? (
                <p
                  className={`mt-3 text-center text-[10px] font-bold ${
                    generationMessage.includes("✓")
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {generationMessage}
                </p>
              ) : null}

              <div className="mt-3 flex items-center justify-between text-[9px] leading-4 text-zinc-700">
                <span>
                  {generationNumber
                    ? `Generation ${generationNumber}/7 used`
                    : "Up to 7 AI generations included"}
                </span>

                <span>
                  AI artwork contains no system branding.
                </span>
              </div>
            </div>
          ) : null}

          {/* UPLOAD ARTWORK */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Your artwork
                </div>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Upload your own artwork to any of the four cover surfaces.
                </p>
              </div>

              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-500">
                PNG · JPG · WEBP
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleUpload}
            />

            <div className="mt-4 grid grid-cols-2 gap-2">
              {(
                [
                  ["front", "Front Cover"],
                  ["insideFront", "Inside Front"],
                  ["back", "Back Cover"],
                  ["insideBack", "Inside Back"],
                ] as const
              ).map(([surface, label]) => (
                <button
                  key={surface}
                  type="button"
                  onClick={() => openUpload(surface)}
                  disabled={uploadingSide !== null}
                  className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-black text-white transition hover:border-yellow-400/40 disabled:opacity-50"
                >
                  {uploadingSide === surface
                    ? "Uploading..."
                    : assets.some((asset) => asset.side === surface)
                      ? `Replace ${label}`
                      : `Upload ${label}`}
                </button>
              ))}
            </div>

            {uploadedAssetForSide ? (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-3 py-2.5">
                <div className="text-[10px] font-bold text-emerald-400">
                  {side === "front" ? "Front" : "Back"} artwork active ✓
                </div>

                <div className="text-[9px] text-zinc-600">
                  {uploadedAssetForSide.width}×{uploadedAssetForSide.height}
                </div>
              </div>
            ) : null}

            {uploadMessage ? (
              <p
                className={`mt-3 text-center text-[10px] font-bold ${
                  uploadMessage.includes("✓")
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {uploadMessage}
              </p>
            ) : null}

            <p className="mt-3 text-[9px] leading-4 text-zinc-700">
              Maximum 15 MB · Minimum 600×800 px · Your artwork remains private.
            </p>
          </div>

          {/* TEMPLATE */}
          <div>
            <div className="mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Choose template
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(
                Object.entries(templates) as [
                  TemplateId,
                  (typeof templates)[TemplateId]
                ][]
              ).map(([id, item]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTemplateId(id)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    templateId === id
                      ? "border-yellow-400/60 bg-yellow-400/[0.08]"
                      : "border-white/10 bg-white/[0.025] hover:border-white/20"
                  }`}
                >
                  <div className="text-lg">{item.emoji}</div>

                  <div className="mt-2 text-xs font-black text-white">
                    {item.label}
                  </div>

                  <div className="mt-1 text-[10px] leading-4 text-zinc-600">
                    Template style
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* BRANDING */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <div className="text-xs font-black uppercase tracking-wider text-zinc-300">
              System branding
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">
                  MineNote
                </div>

                <div className="mt-1 text-xs text-zinc-600">
                  Applied automatically to your cover.
                </div>
              </div>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Locked ✓
              </span>
            </div>
          </div>

          {/* CREATION METHOD */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <div className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
              Creation method
            </div>

            <div className="mt-2 text-sm font-bold capitalize text-white">
              {customization.creationMethod}
            </div>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Template styling is active in this editor foundation.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="grid gap-2">
            <button
              type="button"
              disabled={saving || approving || generatingAi}
              onClick={saveDraft}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-black text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Draft ✨"}
            </button>

            <button
              type="button"
              disabled={saving || approving || generatingAi}
              onClick={approveAndAddToCart}
              className="w-full rounded-2xl bg-yellow-400 px-5 py-4 text-sm font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {approving ? "Approving..." : "Approve & Add to Cart →"}
            </button>
          </div>

          {message ? (
            <p
              className={`text-center text-xs font-bold ${
                message.includes("saved")
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </p>
          ) : null}

          <div className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700">
            Status · {approving ? "Approving..." : customization.status}
          </div>
        </div>
      </section>
    </div>
  );
}
