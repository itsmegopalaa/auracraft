"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
};

type Props = {
  product: Product | null;
  products: Product[];
  createYourOwn?: boolean;
};

type CreationMethod = "ai" | "upload" | "template";

const creativeDirections = [
  {
    category: "Anime",
    icon: "🌸",
    description: "Anime, manga and fantasy-inspired worlds.",
    themes: ["Dark Anime", "Manga", "Fantasy"],
  },
  {
    category: "Aesthetic",
    icon: "✨",
    description: "Clean, atmospheric and expressive styles.",
    themes: ["Minimal", "Moody", "Pastel"],
  },
  {
    category: "Adventure",
    icon: "🏔️",
    description: "Travel, mountains and exploration.",
    themes: ["Mountains", "Travel", "Explorer"],
  },
  {
    category: "Gaming",
    icon: "🎮",
    description: "Bold gaming and competitive energy.",
    themes: ["Cyber", "Battle", "Esports"],
  },
  {
    category: "Premium",
    icon: "👑",
    description: "Elegant and luxury-inspired direction.",
    themes: ["Luxury", "Elegant", "Dark Premium"],
  },
  {
    category: "Original",
    icon: "🪄",
    description: "Start completely blank. No fixed visual direction.",
    themes: ["Blank"],
  },
] as const;

const templates = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, premium and simple.",
    icon: "◻️",
  },
  {
    id: "anime",
    name: "Anime",
    description: "Expressive anime-inspired style.",
    icon: "🌸",
  },
  {
    id: "aesthetic",
    name: "Aesthetic",
    description: "Modern visual compositions.",
    icon: "✨",
  },
  {
    id: "adventure",
    name: "Adventure",
    description: "Bold exploration-inspired style.",
    icon: "🏔️",
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Energetic gaming-inspired style.",
    icon: "🎮",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Refined luxury-inspired layout.",
    icon: "👑",
  },
];

export default function CustomCoverBuilder({
  product,
  products,
  createYourOwn = false,
}: Props) {
  const router = useRouter();

  const [selectedProductId, setSelectedProductId] =
    useState(product?.id ?? "");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [selectedTheme, setSelectedTheme] =
    useState("");

  const [method, setMethod] =
    useState<CreationMethod | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerText, setCustomerText] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [creating, setCreating] = useState(false);

  const selectedProduct =
    product ??
    products.find((item) => item.id === selectedProductId) ??
    null;

  const selectedDirection = useMemo(
    () =>
      creativeDirections.find(
        (item) => item.category === selectedCategory
      ),
    [selectedCategory]
  );

  const chooseCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedTheme("");
  };

  const createCustomization = async () => {
    if (!selectedProduct) {
      toast.error("Choose a notebook first.");
      return;
    }

    if (!selectedCategory || !selectedTheme) {
      toast.error("Choose a category and theme first.");
      return;
    }

    if (!method) {
      toast.error("Choose how you want to create your cover.");
      return;
    }

    if (method === "template" && !templateId) {
      toast.error("Choose a template first.");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/custom-cover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: selectedProduct.id,
          creationMethod: method,
          category: selectedCategory,
          theme: selectedTheme,
          customerName:
            customerName.trim() || undefined,
          customerText:
            customerText.trim() || undefined,
          templateId:
            method === "template"
              ? templateId
              : undefined,
        }),
      });

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        toast.error("Please sign in first.");

        router.push(
          `/login?redirect=${encodeURIComponent(
            createYourOwn
              ? "/custom-cover"
              : `/custom-cover?productId=${selectedProduct.id}`
          )}`
        );

        return;
      }

      if (!response.ok) {
        toast.error(
          typeof data?.error === "string"
            ? data.error
            : "Unable to start customization."
        );

        return;
      }

      const customizationId =
        data?.customization?.id;

      if (!customizationId) {
        toast.error(
          "Customization was created but no ID was returned."
        );

        return;
      }

      toast.success("Your creation is ready ✨");

      router.push(
        `/custom-cover/${customizationId}`
      );
    } catch (error) {
      console.error(
        "CUSTOM COVER CREATION FAILED:",
        error
      );

      toast.error(
        "Something went wrong. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* ================================================== */}
      {/* STEP 1 — PHYSICAL NOTEBOOK */}
      {/* ================================================== */}

      {createYourOwn && (
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
              Step 1
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Choose your notebook
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              First choose the physical notebook you want us to
              print your creation on. This is your actual product.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((item) => {
              const selected =
                selectedProductId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSelectedProductId(item.id)
                  }
                  className={`overflow-hidden rounded-2xl border text-left transition ${
                    selected
                      ? "border-yellow-400 bg-yellow-400/[0.08]"
                      : "border-white/[0.08] bg-black/20 hover:border-white/20"
                  }`}
                >
                  <div className="aspect-[4/5] bg-zinc-950">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        📓
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="font-bold text-white">
                      {item.name}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      ₹{item.price}
                    </p>

                    {selected && (
                      <p className="mt-3 text-xs font-black uppercase tracking-wider text-yellow-400">
                        ✓ Selected
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* STEP 2 — CATEGORY + THEME */}
      {/* ================================================== */}

      <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
            Step 2
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Choose your creative direction
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Pick a category to guide the visual style, then choose
            a theme. Or select Original if you want a completely
            blank starting point.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {creativeDirections.map((direction) => {
            const selected =
              selectedCategory === direction.category;

            return (
              <button
                key={direction.category}
                type="button"
                onClick={() =>
                  chooseCategory(direction.category)
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  selected
                    ? "border-yellow-400 bg-yellow-400/[0.08]"
                    : "border-white/[0.08] bg-black/20 hover:border-yellow-400/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">
                    {direction.icon}
                  </span>

                  <div>
                    <p className="font-black text-white">
                      {direction.category}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      {direction.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedDirection && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              Choose a theme
            </p>

            <div className="flex flex-wrap gap-3">
              {selectedDirection.themes.map((theme) => {
                const selected =
                  selectedTheme === theme;

                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() =>
                      setSelectedTheme(theme)
                    }
                    className={`rounded-full border px-5 py-3 text-sm font-bold transition ${
                      selected
                        ? "border-yellow-400 bg-yellow-400 text-black"
                        : "border-white/[0.1] bg-white/[0.03] text-zinc-300 hover:border-yellow-400/40"
                    }`}
                  >
                    {theme}
                  </button>
                );
              })}
            </div>

            {selectedCategory === "Original" && (
              <p className="mt-4 text-xs leading-5 text-zinc-500">
                Original / Blank means there is no fixed theme.
                You decide everything inside the editor.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ================================================== */}
      {/* STEP 3 — CREATION METHOD */}
      {/* ================================================== */}

      <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
            Step 3
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            How do you want to create it?
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Your notebook and creative direction are locked first.
            Now choose how you want to make the artwork.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setMethod("ai")}
            className={`rounded-2xl border p-5 text-left transition ${
              method === "ai"
                ? "border-yellow-400 bg-yellow-400/[0.08]"
                : "border-white/[0.08] bg-black/20 hover:border-yellow-400/30"
            }`}
          >
            <span className="text-2xl">🤖</span>
            <p className="mt-4 font-black text-white">
              Create with AI
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Describe your idea and generate artwork inside
              the cover editor.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMethod("upload")}
            className={`rounded-2xl border p-5 text-left transition ${
              method === "upload"
                ? "border-yellow-400 bg-yellow-400/[0.08]"
                : "border-white/[0.08] bg-black/20 hover:border-yellow-400/30"
            }`}
          >
            <span className="text-2xl">🖼️</span>
            <p className="mt-4 font-black text-white">
              Upload Your Own Design
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Upload your own front and back artwork. You can
              replace either side later in the editor.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMethod("template")}
            className={`rounded-2xl border p-5 text-left transition ${
              method === "template"
                ? "border-yellow-400 bg-yellow-400/[0.08]"
                : "border-white/[0.08] bg-black/20 hover:border-yellow-400/30"
            }`}
          >
            <span className="text-2xl">🎨</span>
            <p className="mt-4 font-black text-white">
              Start from a Template
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Start with a ready-made visual layout and make it
              your own.
            </p>
          </button>
        </div>

        {method === "ai" && (
          <div className="mt-6 rounded-2xl border border-yellow-400/10 bg-yellow-400/[0.04] p-5">
            <p className="font-bold text-yellow-400">
              AI creation 🤖
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Your selected category and theme will guide your
              creative direction. The actual AI generation happens
              inside the private cover editor.
            </p>
          </div>
        )}

        {method === "upload" && (
          <div className="mt-6 rounded-2xl border border-yellow-400/10 bg-yellow-400/[0.04] p-5">
            <p className="font-bold text-yellow-400">
              Upload mode 🖼️
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Continue to the editor, then upload your front and
              back artwork. You can replace an uploaded side before
              approving the final notebook.
            </p>
          </div>
        )}

        {method === "template" && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              Choose a template
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => {
                const selected =
                  templateId === template.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() =>
                      setTemplateId(template.id)
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-yellow-400 bg-yellow-400/[0.08]"
                        : "border-white/[0.08] bg-white/[0.025] hover:border-yellow-400/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {template.icon}
                      </span>

                      <div>
                        <p className="font-bold text-white">
                          {template.name}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ================================================== */}
      {/* STEP 4 — PERSONALISATION */}
      {/* ================================================== */}

      <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
            Step 4
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Add your personal touch
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Optional details that can be refined later in the
            cover editor.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">
              Your name
            </span>

            <input
              value={customerName}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
              maxLength={120}
              placeholder="e.g. Gopalaa"
              className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-400/50"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold text-zinc-400">
              Text / quote
            </span>

            <input
              value={customerText}
              onChange={(event) =>
                setCustomerText(event.target.value)
              }
              maxLength={120}
              placeholder="Your quote or idea..."
              className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-400/50"
            />
          </label>
        </div>
      </section>

      {/* ================================================== */}
      {/* SUMMARY + CONTINUE */}
      {/* ================================================== */}

      <section className="rounded-3xl border border-yellow-400/10 bg-yellow-400/[0.035] p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-500">
              Notebook
            </p>
            <p className="mt-1 font-bold text-white">
              {selectedProduct?.name ?? "Not selected"}
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">
              Direction
            </p>
            <p className="mt-1 font-bold text-white">
              {selectedCategory
                ? `${selectedCategory} · ${selectedTheme || "Choose theme"}`
                : "Not selected"}
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">
              Creation method
            </p>
            <p className="mt-1 font-bold text-white">
              {method === "ai"
                ? "AI"
                : method === "upload"
                  ? "Your own design"
                  : method === "template"
                    ? "Template"
                    : "Not selected"}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={
            creating ||
            !selectedProduct ||
            !selectedCategory ||
            !selectedTheme ||
            !method ||
            (method === "template" && !templateId)
          }
          onClick={createCustomization}
          className="mt-8 w-full rounded-full bg-yellow-400 px-6 py-4 font-black text-black transition hover:scale-[1.01] hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {creating
            ? "Creating your cover..."
            : "Continue to Cover Editor →"}
        </button>

        <p className="mt-4 text-center text-xs text-zinc-600">
          🔒 Your custom creation remains private by default.
        </p>
      </section>
    </div>
  );
}
