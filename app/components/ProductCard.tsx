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
        border border-white/[0.10] bg-zinc-900/90
        shadow-[0_12px_40px_rgba(0,0,0,0.24)]
        transition-all duration-500
        hover:-translate-y-1.5
        hover:border-yellow-400/40
        hover:shadow-[0_20px_55px_rgba(0,0,0,0.38)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          />

          <div
            className="
              pointer-events-none absolute inset-0
              bg-gradient-to-t from-black/45 via-transparent to-transparent
            "
          />

          {bestseller && (
            <span
              className="
                absolute left-3.5 top-3.5 z-10
                rounded-full border border-yellow-300/30
                bg-yellow-400 px-4 min-h-10.5 py-2
                text-[11px] font-black tracking-wide text-black
                shadow-lg shadow-black/20
                backdrop-blur-sm
              "
            >
              🔥 BEST SELLER
            </span>
          )}
        </div>

        {/* Product information */}
        <div className="p-5 sm:p-6">
          {category && (
            <span
              className="
                inline-flex rounded-full
                border border-yellow-400/15
                bg-yellow-400/[0.07]
                px-4 min-h-10 py-1.5
                text-[11px] font-bold uppercase tracking-wide text-yellow-400
              "
            >
              {category}
            </span>
          )}

          <h3
            className="
              mt-4 line-clamp-2 min-h-[3.5rem]
              text-xl font-bold leading-tight text-white
              transition-colors duration-200
              group-hover:text-yellow-400
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {name}
          </h3>

          <div className="mt-3 flex min-h-6 items-center gap-2">
            <p className="text-yellow-400">
              ⭐ {rating ?? "—"}
            </p>

            {reviewCount > 0 && (
              <span className="text-sm text-zinc-500">
                ({reviewCount}{" "}
                {reviewCount === 1 ? "review" : "reviews"})
              </span>
            )}
          </div>

          <p className="mt-3 text-[1.65rem] font-black tracking-tight text-white">
            ₹{price}
          </p>

          {/* Visual CTA — parent Link handles navigation */}
          <span
            className="
              mt-6 flex w-full items-center justify-center
              rounded-2xl bg-yellow-400 py-3.5
              text-sm font-black text-black
              shadow-lg shadow-yellow-400/[0.08]
              transition-all duration-300
              group-hover:-translate-y-0.5
              group-hover:bg-yellow-300
              group-hover:shadow-xl
              group-hover:shadow-yellow-400/15
              active:translate-y-0
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
          border border-white/[0.12]
          bg-black/55 backdrop-blur-md
          text-lg
          shadow-lg shadow-black/20
          outline-none
          transition-all duration-200
          hover:scale-105
          hover:border-yellow-400/40
          hover:bg-black/75
          active:scale-95
          focus-visible:ring-2
          focus-visible:ring-yellow-400/70
        "
      >
        {liked ? "❤️" : "🤍"}
      </button>
    </article>
  );
}
