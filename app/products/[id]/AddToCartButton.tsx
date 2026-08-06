"use client";

import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

type Props = {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
};

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => {
        addToCart({
          ...product,
          quantity: 1,
        });

        toast.success(`${product.name} added to cart 🛒`);
      }}
      className="mt-8 rounded-full bg-yellow-400 px-10 py-4 font-bold text-black transition hover:scale-105"
    >
      Add to Cart 🛒
    </button>
  );
}