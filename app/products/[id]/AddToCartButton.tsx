"use client";

import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
};

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    addToCart({
      ...product,
      id: String(product.id),
    });

    toast.success(`${product.name} added to cart 🛒`);
  };

  const handleBuyNow = () => {
    // Buy Now must start a fresh purchase of exactly 1 unit.
    localStorage.setItem(
      "cart",
      JSON.stringify([
        {
          ...product,
          id: String(product.id),
          quantity: 1,
        },
      ])
    );

    router.push("/checkout");
  };

  return (
    <div className="flex flex-1 gap-3">
      <button
        onClick={handleAddToCart}
        className="
          flex-1
          rounded-full
          bg-yellow-400
          px-5
          py-4
          font-bold
          text-black
          transition
          hover:scale-[1.02]
          hover:bg-yellow-300
        "
      >
        Add to Cart 🛒
      </button>

      <button
        onClick={handleBuyNow}
        className="
          flex-1
          rounded-full
          border
          border-yellow-400
          px-5
          py-4
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
