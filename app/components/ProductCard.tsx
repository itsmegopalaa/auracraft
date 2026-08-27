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


  return (
    <div className="
      group relative overflow-hidden rounded-3xl 
      border border-zinc-800 bg-zinc-900 
      transition-all duration-500
      hover:-translate-y-3
      hover:border-yellow-400
      hover:shadow-2xl
    ">


      {bestseller && (
        <span className="
          absolute left-4 top-4 z-20 
          rounded-full bg-yellow-400 
          px-4 py-2 text-xs font-bold text-black
        ">
          🔥 BEST SELLER
        </span>
      )}


      <button
        onClick={() => {
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
}}
        className="
          absolute right-4 top-4 z-20
          rounded-full bg-black/50
          p-3 backdrop-blur-md
          transition hover:scale-110
        "
      >
        {liked ? "❤️" : "🤍"}
      </button>


      <div className="relative overflow-hidden">

        <Image
          src={image}
          alt={name}
          width={500}
          height={700}
          className="
            h-[360px] w-full object-cover
            transition duration-700
            group-hover:scale-110
          "
        />

        <div className="
          absolute inset-0 
          bg-gradient-to-t 
          from-black/40 
          to-transparent
        "/>

      </div>


      <div className="p-6">


        <span className="
          inline-block rounded-full 
          bg-zinc-800 px-4 py-1
          text-sm text-yellow-400
        ">
          {category}
        </span>


        <h3 className="
          mt-4 text-xl font-bold
          group-hover:text-yellow-400
          transition
        ">
          {name}
        </h3>


        <div className="mt-3 flex items-center gap-2">
          <p className="text-yellow-400">
            ⭐ {rating ?? "—"}
          </p>

          {reviewCount > 0 && (
            <span className="text-sm text-gray-500">
              ({reviewCount}{" "}
              {reviewCount === 1 ? "review" : "reviews"})
            </span>
          )}
        </div>


        <p className="
          mt-3 text-2xl font-extrabold
        ">
          ₹{price}
        </p>


        <Link
          href={`/products/${id}`}
          className="
            mt-6 block w-full rounded-full
            bg-yellow-400 py-3
            text-center font-bold text-black
            transition hover:scale-105
          "
        >
          Explore Notebook →
        </Link>


      </div>

    </div>
  );
}