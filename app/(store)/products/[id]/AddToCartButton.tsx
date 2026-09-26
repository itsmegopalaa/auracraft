"use client";

import ProductPhysicalOptions from "./ProductPhysicalOptions";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";

type PagePrice = {
  pages: 100 | 150 | 200;
  price: number;
};

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    paper?: string | null;
    size?: "A4" | "A5" | null;
    orientation?: "portrait" | "landscape" | null;
  };
  pagePrices: PagePrice[];
};

export default function AddToCartButton({
  product,
  pagePrices,
}: Props) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [selectedSize, setSelectedSize] = useState<"A4" | "A5">(
    product.size === "A5" ? "A5" : "A4",
  );

  const [selectedOrientation, setSelectedOrientation] =
    useState<"portrait" | "landscape">(
      product.orientation === "landscape"
        ? "landscape"
        : "portrait",
    );

  const [selectedPaper, setSelectedPaper] =
    useState<"plain" | "ruled" | "dotGrid">(
      product.paper === "ruled"
        ? "ruled"
        : product.paper === "dotGrid"
          ? "dotGrid"
          : "plain",
    );


  const availablePages = pagePrices.filter(
    (item) =>
      item.pages === 100 ||
      item.pages === 150 ||
      item.pages === 200,
  );

  const defaultPage =
    availablePages.find((item) => item.pages === 200) ??
    availablePages[availablePages.length - 1];

  const [selectedPages, setSelectedPages] = useState<100 | 150 | 200>(
    defaultPage?.pages ?? 200,
  );

  const selectedVariant =
    availablePages.find((item) => item.pages === selectedPages) ??
    defaultPage;

  if (!selectedVariant) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Pricing is temporarily unavailable for this notebook.
      </div>
    );
  }

  const selectedPrice = selectedVariant.price;

  const cartProduct = {
    ...product,
    id: String(product.id),
    price: selectedPrice,
    pages: selectedVariant.pages,
    paper: selectedPaper,
    paperGsm: 80,
    size: selectedSize,
    orientation: selectedOrientation,
  };

  const handleAddToCart = () => {
    addToCart(cartProduct);

    toast.success(`${product.name} added to cart 🛒`);
  };

  const handleBuyNow = () => {
    localStorage.setItem(
      "minenote_buy_now",
      JSON.stringify({
        ...cartProduct,
        quantity: 1,
      }),
    );

    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Physical configuration */}
      <ProductPhysicalOptions
        size={selectedSize}
        setSize={setSelectedSize}
        orientation={selectedOrientation}
        setOrientation={setSelectedOrientation}
        paper={selectedPaper}
        setPaper={setSelectedPaper}
      />

      {/* Page selector */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--mn-text-secondary)]">
            Pages
          </p>

          <p className="text-sm font-semibold text-[var(--mn-text)]">
            {selectedPages} pages
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[100, 150, 200].map((pages) => {
            const variant = availablePages.find(
              (item) => item.pages === pages,
            );

            if (!variant) return null;

            const selected = selectedPages === pages;

            return (
              <button
                key={pages}
                type="button"
                onClick={() =>
                  setSelectedPages(pages as 100 | 150 | 200)
                }
                className={[
                  "rounded-2xl px-3 py-3 text-sm font-bold transition",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[var(--mn-focus)]",
                  selected
                    ? "border-2 border-[var(--mn-accent)] bg-[var(--mn-accent)]/[0.08] text-[var(--mn-accent)]"
                    : "border border-[var(--mn-border)] bg-[var(--mn-surface-soft)] text-[var(--mn-text)] hover:border-[var(--mn-accent)] hover:bg-[var(--mn-accent)]/[0.03]",
                ].join(" ")}
              >
                <span className="block">{pages}</span>
                <span className="mt-0.5 block text-xs font-semibold opacity-80">
                  ₹{variant.price}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected price */}
      <div className="flex items-end justify-between border-y border-[var(--mn-border)] py-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--mn-text-muted)]">
            Selected price
          </p>
          <p className="mt-1 text-3xl font-black tracking-tight text-[var(--mn-accent)]">
            ₹{selectedPrice}
          </p>
        </div>

        <p className="pb-1 text-xs font-semibold text-[var(--mn-text-secondary)]">
          {selectedPages} pages
        </p>
      </div>

      {/* Shopping actions */}
      <div className="flex flex-1 gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="
            flex-1
            rounded-full
            bg-[var(--mn-accent)]
            px-5
            py-4
            font-bold
            text-[var(--mn-accent-contrast)]
            transition
            hover:scale-[1.02]
            hover:bg-[var(--mn-accent-hover)]
          "
        >
          Add to Cart 🛒
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          className="
            flex-1
            rounded-full
            border
            border-[var(--mn-accent)]
            px-5
            py-4
            font-bold
            text-[var(--mn-accent)]
            transition
            hover:bg-[var(--mn-accent)]
            hover:text-[var(--mn-accent-contrast)]
          "
        >
          Buy Now ⚡
        </button>
      </div>
    </div>
  );
}
