"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "../context/WishlistContext";

type ProductCardProps = {
  id: number;
  name: string;
  image: string;
  price: string | number;
  category: string;
  rating: number;
  bestseller: boolean;
};

export default function ProductCard({
  id,
  name,
  image,
  price,
  category,
  rating,
  bestseller,
}: ProductCardProps) {

  const { toggleWishlist, isWishlisted } = useWishlist();

  const liked = isWishlisted(id);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-2 hover:border-yellow-400">

      {bestseller && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
          🔥 BEST SELLER
        </span>
      )}


      <button
        onClick={() =>
          toggleWishlist({
            id,
            name,
            price,
            image,
          })
        }
        className="absolute right-4 top-4 z-10 text-2xl transition hover:scale-110"
      >
        {liked ? "❤️" : "🤍"}
      </button>


      <Image
        src={image}
        alt={name}
        width={500}
        height={700}
        className="h-[360px] w-full object-cover transition-transform duration-500 hover:scale-105"
      />


      <div className="p-6">

        <div className="mb-3 inline-block rounded-full bg-zinc-800 px-3 py-1 text-sm text-yellow-400">
          {category}
        </div>


        <h3 className="text-xl font-bold">
          {name}
        </h3>


        <p className="mt-2 text-yellow-400">
          ⭐ {rating}
        </p>


        <p className="mt-2 text-lg font-semibold text-white">
          ₹{price}
        </p>


        <Link
          href={`/products/${id}`}
          className="mt-5 block w-full rounded-full bg-yellow-400 py-3 text-center font-semibold text-black transition hover:scale-105"
        >
          View Details →
        </Link>

      </div>

    </div>
  );
}