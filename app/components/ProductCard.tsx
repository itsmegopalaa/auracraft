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
        border border-[var(--mn-border)]
        bg-[var(--mn-surface)]
        shadow-[var(--mn-shadow-sm)]
        transition-all duration-500
        hover:-translate-y-1
        hover:border-[var(--mn-border-strong)]
        hover:shadow-[var(--mn-shadow-lg)]
        focus-within:ring-2
        focus-within:ring-[var(--mn-focus)]
      "
    >
      <Link
        href={`/products/${id}`}
        aria-label={`View ${name}`}
        className="block outline-none"
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-[var(--mn-surface-soft)]">
          <Image
            src={image}
            alt={name}
            width={500}
            height={700}
            className="
              h-[330px] w-full object-cover
              transition-transform duration-700
              group-hover:scale-[1.025]
              sm:h-[360px]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0
              bg-gradient-to-t
              from-[var(--mn-overlay)]
              via-transparent
              to-transparent
              opacity-70
            "
          />

          {bestseller && (
            <span
              className="
                absolute left-4 top-4 z-10
                inline-flex min-h-9 items-center
                rounded-full
                border border-[var(--mn-accent)]
                bg-[var(--mn-accent)]
                px-3.5
                text-[9px] font-bold uppercase
                tracking-[0.14em]
                text-[var(--mn-accent-contrast)]
                shadow-[var(--mn-shadow-sm)]
              "
            >
              Bestseller
            </span>
          )}

          <span
            aria-hidden="true"
            className="
              absolute bottom-4 left-4
              text-[9px] font-semibold uppercase
              tracking-[0.18em]
              text-white/75
              transition-opacity duration-300
              group-hover:text-white
            "
          >
            MineNote
          </span>
        </div>

        {/* Information */}
        <div className="p-5 sm:p-6">
          <div className="flex min-h-5 items-center justify-between gap-3">
            {category ? (
              <span
                className="
                  text-[9px] font-bold uppercase
                  tracking-[0.16em]
                  text-[var(--mn-accent)]
                "
              >
                {category}
              </span>
            ) : (
              <span />
            )}

            {rating !== undefined && (
              <span
                className="
                  inline-flex items-center gap-1
                  text-[10px] font-semibold
                  text-[var(--mn-text-secondary)]
                "
              >
                <span aria-hidden="true" className="text-[var(--mn-accent)]">
                  ★
                </span>
                {rating}
                {reviewCount > 0 && (
                  <span className="text-[var(--mn-text-muted)]">
                    ({reviewCount})
                  </span>
                )}
              </span>
            )}
          </div>

          <h3
            className="
              mt-3 line-clamp-2 min-h-[3.4rem]
              text-lg font-semibold leading-[1.15]
              tracking-[-0.025em]
              text-[var(--mn-text)]
              transition-colors duration-300
              group-hover:text-[var(--mn-accent)]
            "
          >
            {name}
          </h3>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
                From
              </p>
              <p className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[var(--mn-text)]">
                ₹{price}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="
                inline-flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-full
                border border-[var(--mn-border-strong)]
                text-[var(--mn-text-secondary)]
                transition-all duration-300
                group-hover:border-[var(--mn-accent)]
                group-hover:bg-[var(--mn-accent)]
                group-hover:text-[var(--mn-accent-contrast)]
                group-hover:translate-x-0.5
              "
            >
              →
            </span>
          </div>

          <div
            aria-hidden="true"
            className="
              mt-5 h-px w-full
              bg-[var(--mn-border)]
              transition-colors duration-300
              group-hover:bg-[var(--mn-accent)]
            "
          />
        </div>
      </Link>

      {/* Wishlist */}
      <button
        type="button"
        aria-label={
          liked
            ? `Remove ${name} from wishlist`
            : `Add ${name} to wishlist`
        }
        onClick={handleWishlist}
        className="
          absolute right-4 top-4 z-30
          flex h-10 w-10 items-center justify-center
          rounded-full
          border border-white/20
          bg-black/20
          text-base
          shadow-[var(--mn-shadow-sm)]
          backdrop-blur-md
          outline-none
          transition-all duration-300
          hover:scale-105
          hover:bg-black/30
          active:scale-95
          focus-visible:ring-2
          focus-visible:ring-[var(--mn-focus)]
        "
      >
        {liked ? "❤️" : "♡"}
      </button>
    </article>
  );
}
