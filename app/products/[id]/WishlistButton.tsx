"use client";

import { useWishlist } from "../../context/WishlistContext";

type Props = {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
};

export default function WishlistButton({ product }: Props) {
  const {
    toggleWishlist,
    isWishlisted,
  } = useWishlist();

  const saved = isWishlisted(product.id);

  return (
    <button
      onClick={() => toggleWishlist(product)}
      className="
        rounded-full
        border
        border-yellow-400
        px-10
        py-4
        font-bold
        text-yellow-400
        transition
        hover:bg-yellow-400
        hover:text-black
      "
    >
      {saved ? "❤️ Added to Wishlist" : "♡ Add to Wishlist"}
    </button>
  );
}