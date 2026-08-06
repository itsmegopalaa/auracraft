"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
  <>
    <Navbar />

    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold mb-12">
          Your <span className="text-yellow-400">Wishlist ❤️</span>
        </h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">

            <p className="text-gray-400 text-xl">
              Your wishlist is empty 💔
            </p>

            <Link
              href="/products"
              className="inline-block mt-8 rounded-full bg-yellow-400 px-8 py-4 font-bold text-black"
            >
              Explore Products →
            </Link>

          </div>
        ) : (

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {wishlist.map((product) => (

              <div
                key={product.id}
                className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-5 transition hover:-translate-y-2 hover:border-yellow-400"
              >

                <Image
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={700}
                  className="h-72 w-full rounded-2xl object-cover transition group-hover:scale-105"
                />

                <h2 className="mt-5 text-xl font-bold">
                  {product.name}
                </h2>

                <p className="mt-3 text-yellow-400 font-bold text-lg">
                  ₹{product.price}
                </p>

                <button
                  onClick={() =>
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: Number(
                        String(product.price).replace("₹", "")
                      ),
                      image: product.image,
                      quantity: 1,
                    })
                  }
                  className="mt-5 w-full rounded-full bg-yellow-400 py-3 font-bold text-black transition hover:scale-105"
                >
                  Add To Cart 🛒
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className="mt-3 w-full rounded-full border border-red-500 py-3 text-red-400 transition hover:bg-red-500 hover:text-white"
                >
                  Remove ❤️
                </button>

              </div>

            ))}

          </div>

        )}

      </div>
      </main>

    <Footer />
  </>
);
}