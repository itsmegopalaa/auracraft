"use client";

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
  };
  pagePrices: PagePrice[];
};

export default function AddToCartButton({
  product,
  pagePrices,
}: Props) {
  const { addToCart } = useCart();
  const router = useRouter();

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

  const selectedPrice = selectedVariant?.price ?? product.price;

  const cartProduct = {
    ...product,
    id: String(product.id),
    price: selectedPrice,
    pages: selectedVariant?.pages ?? selectedPages,
  };

  const handleAddToCart = () => {
    addToCart(cartProduct);

    toast.success(`${product.name} added to cart 🛒`);
  };

  const handleBuyNow = () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([
        {
          ...cartProduct,
          quantity: 1,
        },
      ]),
    );

    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-5">
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
