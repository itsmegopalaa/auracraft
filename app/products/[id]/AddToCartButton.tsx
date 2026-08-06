"use client";

import { useRouter } from "next/navigation";
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
const router = useRouter();
  return (
  <div className="mt-8 flex flex-wrap gap-4">

    <button
      onClick={() => {
        addToCart({
          ...product,
          quantity: 1,
        });

        toast.success(`${product.name} added to cart 🛒`);
      }}
      className="
        rounded-full
        bg-yellow-400
        px-10 py-4
        font-bold
        text-black
        transition
        hover:scale-105
      "
    >
      Add to Cart 🛒
    </button>


    <button
      onClick={() => {
        addToCart({
          ...product,
          quantity: 1,
        });

        router.push("/checkout");
      }}
      className="
        rounded-full
        border
        border-yellow-400
        px-10 py-4
        font-bold
        text-yellow-400
        transition
        hover:bg-yellow-400
        hover:text-black
      "
    >
      Buy Now ⚡
    </button>

  </div>
);
}