"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "../context/WishlistContext";
import toast from "react-hot-toast";

type ProductCardProps = {
  id: string | number;
  name: string;
  image: string;
  price: string | number;
  category?: string;
  rating?: number;
  reviewCount?: number;
  bestseller: boolean;
};

export default function ProductCard({
  id,
  name,
  image,
  price,
  category,
  rating,
  reviewCount = 0,
  bestseller,
}: ProductCardProps) {
  const { toggleWishlist, isWishlisted } = useWishlist();

  const liked = isWishlisted(String(id));

  const handleWishlist = () => {
    const wasLiked = liked;

    toggleWishlist({
      id: String(id),
      name,
      price,
      image,
    });

    if (wasLiked) {
      toast("Removed from Wishlist 💔", {
        icon: "🗑️",
      });
    } else {
      toast.success("Added to Wishlist ❤️");
    }
  };

  return (
    <article
      className="
        group relative overflow-hidden rounded-[1.75rem]
        border border-[var(--mn-border)] bg-[var(--mn-surface)]
        shadow-[var(--mn-shadow-lg)]
        transition-all duration-500
        hover:-translate-y-1.5
        hover:border-[var(--mn-border-strong)]
        hover:shadow-[var(--mn-shadow-lg)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
    >
      {/* Everything inside this surface opens the product */}
      <Link
        href={`/products/${id}`}
        aria-label={`View ${name}`}
        className="block outline-none"
      >
        {/* Product image */}
        <div className="relative overflow-hidden">
          <Image
            src={image}
            alt={name}
            width={500}
            height={700}
            className="
              h-[330px] w-full object-cover
              transition duration-700
              group-hover:scale-[1.035]
              sm:h-[360px]
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
          />

          <div
            className="
              pointer-events-none absolute inset-0
              bg-gradient-to-t from-[var(--mn-overlay)] via-transparent to-transparent
            "
          />

          {bestseller && (
            <span
              className="
                absolute left-3.5 top-3.5 z-10
                rounded-full border border-[var(--mn-accent)]
                bg-[var(--mn-accent)] px-4 min-h-10.5 py-2
                text-[11px] font-black tracking-wide text-[var(--mn-accent-contrast)]
                shadow-[var(--mn-shadow-sm)]
                backdrop-blur-sm
              "
            >
              🔥 BEST SELLER
            </span>
          )}
        </div>

        {/* Product information */}
        <div className="p-[var(--mn-space-card)] sm:p-[var(--mn-space-card)]">
          {category && (
            <span
              className="
                inline-flex rounded-full
                border border-[var(--mn-accent)]
                bg-[var(--mn-accent-soft)]
                px-4 min-h-10 py-1.5
                text-[11px] font-bold uppercase tracking-wide text-[var(--mn-accent)]
              "
            >
              {category}
            </span>
          )}

          <h3
            className="
              mt-4 line-clamp-2 min-h-[3.5rem]
              text-xl font-bold leading-tight text-[var(--mn-text)]
              transition-colors duration-200
              group-hover:text-[var(--mn-accent)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
          >
            {name}
          </h3>

          <div className="mt-3 flex min-h-6 items-center gap-2">
            <p className="text-[var(--mn-accent)]">
              ⭐ {rating ?? "—"}
            </p>

            {reviewCount > 0 && (
              <span className="text-sm leading-6 text-[var(--mn-text-muted)]">
                ({reviewCount}{" "}
                {reviewCount === 1 ? "review" : "reviews"})
              </span>
            )}
          </div>

          <p className="mt-3 text-[1.65rem] font-black tracking-tight text-[var(--mn-text)]">
            ₹{price}
          </p>

          {/* Visual CTA — parent Link handles navigation */}
          <span
            className="
              mt-6 flex w-full items-center justify-center
              rounded-2xl bg-[var(--mn-accent)] py-3.5
              text-sm font-black text-[var(--mn-accent-contrast)]
              shadow-[var(--mn-shadow-sm)]
              transition-all duration-300
              group-hover:-translate-y-0.5
              group-hover:bg-[var(--mn-accent-hover)]
              group-hover:shadow-[var(--mn-shadow-lg)]
              group-hover:shadow-[var(--mn-shadow-sm)]
              active:translate-y-0
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
          >
            Explore Notebook →
          </span>
        </div>
      </Link>

      {/* Wishlist is intentionally outside the product Link */}
      <button
        type="button"
        aria-label={
          liked
            ? `Remove ${name} from wishlist`
            : `Add ${name} to wishlist`
        }
        onClick={handleWishlist}
        className="
          absolute right-3.5 top-3.5 z-30
          flex h-11 w-11 items-center justify-center
          rounded-full
          border border-[var(--mn-border)]
          bg-[var(--mn-control-bg)] backdrop-blur-md
          text-lg
          shadow-[var(--mn-shadow-sm)]
          outline-none
          transition-all duration-200
          hover:scale-105
          hover:border-[var(--mn-border-strong)]
          hover:bg-[var(--mn-control-hover)]
          active:scale-95
          focus-visible:ring-2
          focus-visible:ring-[var(--mn-focus)]/70
        "
      >
        {liked ? "❤️" : "🤍"}
      </button>
    </article>
  );
}
