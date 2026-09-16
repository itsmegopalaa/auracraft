"use client";
import { useState } from "react";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/app/context/WishlistContext";
import { useCart } from "@/app/context/CartContext";

export default function WishlistPage() {
    const [removeId, setRemoveId] = useState<string | null>(null);
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
  <>

    <main className="min-h-screen bg-[var(--mn-bg)] px-4 py-[clamp(4rem,8vw,7rem)] text-[var(--mn-text)] sm:px-6">
      <div className="mx-auto max-w-7xl">

        <h1 className="mn-h1 mb-10 sm:mb-12">
          Your <span className="text-[var(--mn-accent)]">Wishlist ❤️</span>
        </h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-[clamp(5rem,8vw,7.5rem)]">

            <p className="mn-body text-[var(--mn-text-muted)]">
              Your wishlist is empty 💔
            </p>

            <Link
              href="/products"
              className="mn-transition mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--mn-accent)] px-7 py-3.5 text-sm font-semibold text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)] hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)]"
            >
              Explore Products →
            </Link>

          </div>
        ) : (

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">

            {wishlist.map((product) => (

              <div
                key={product.id}
                className="mn-transition group rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-[var(--mn-shadow-sm)] hover:-translate-y-1 hover:border-[var(--mn-accent)] sm:p-6"
              >

               <Link href={`/products/${product.id}`}>
  <Image
    src={product.image}
    alt={product.name}
    width={500}
    height={700}
    className="h-72 w-full rounded-[1.25rem] object-cover transition-transform duration-300 group-hover:scale-105"
  />
</Link>

<Link href={`/products/${product.id}`}>
  <h2 className="mn-h3 mt-5 transition-colors hover:text-[var(--mn-accent)]">
    {product.name}
  </h2>
</Link>

                <p className="mt-3 text-lg font-bold text-[var(--mn-accent)]">
                  ₹{product.price}
                </p>

                <button
                  onClick={() =>
                    addToCart({
                      id: String(product.id),
                      name: product.name,
                      price: Number(
                        String(product.price).replace("₹", "")
                      ),
                      image: product.image,
                    })
                  }
                  className="mn-transition mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--mn-accent)] px-4 py-3 text-sm font-semibold text-[var(--mn-accent-contrast)] hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)]"
                >
                  Add To Cart 🛒
                </button>

                <button
                  onClick={() => setRemoveId(product.id)}
                  className="mn-transition mt-3 flex min-h-12 w-full items-center justify-center rounded-xl border border-[var(--mn-danger)] px-4 py-3 text-sm font-semibold text-[var(--mn-danger)] hover:bg-[var(--mn-danger)] hover:text-[var(--mn-text-inverse)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-danger)]"
                >
                  Remove ❤️
                </button>

              </div>

            ))}

          </div>

        )}

      </div>
      </main>
<ConfirmModal
  open={removeId !== null}
  title="Remove from wishlist?"
  message="Are you sure you want to remove this notebook from your wishlist?"
  confirmText="Remove"
  onCancel={() => setRemoveId(null)}
  onConfirm={() => {
    const product = wishlist.find(
      (item) => item.id === removeId
    );

    if (product) {
      toggleWishlist(product);
    }

    setRemoveId(null);
  }}
/>
    <Footer />
  </>
);
}