"use client";

import { useCart } from "../../context/CartContext";

type Props = {
  product: {
    id: number;
    name: string;
    price: string;
    image: string;
  };
};

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      className="mt-8 rounded-full bg-yellow-400 px-10 py-4 font-bold text-black hover:scale-105 transition"
    >
      Add to Cart 🛒
    </button>
  );
}