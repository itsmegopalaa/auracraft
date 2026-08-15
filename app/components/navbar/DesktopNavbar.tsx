"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import SearchBox from "../search/SearchBox";

export default function DesktopNavbar() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
   <div className="hidden items-center justify-between gap-6 md:flex">

     <div className="flex-1 max-w-xl">
  <SearchBox />
</div>

      <Link
        href="/wishlist"
        className="text-2xl transition hover:scale-110"
      >
        ❤️
        {wishlist.length > 0 && (
          <span className="ml-1 text-sm text-yellow-400">
            {wishlist.length}
          </span>
        )}
      </Link>

      <Link
        href="/cart"
        className="rounded-full border border-yellow-400 px-5 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
      >
        🛒 {totalItems}
      </Link>

      <Link
        href="/track-order"
        className="rounded-full border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
      >
        🔎 Track Order
      </Link>

      <Link
        href="/products"
        className="rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black transition hover:scale-105"
      >
        Shop Now
      </Link>

    </div>
  );
}