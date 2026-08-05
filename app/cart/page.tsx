"use client";

import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart } = useCart();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold mb-12">
          Your <span className="text-yellow-400">Cart</span>
        </h1>


        {cart.length === 0 ? (
          <p className="text-gray-400 text-xl">
            Your cart is empty 🛒
          </p>
        ) : (

          <div className="space-y-6">

            {cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
              >

                <img
                  src={item.image}
                  alt={item.name}
                  className="h-32 w-24 rounded-xl object-cover"
                />


                <div>
                  <h2 className="text-2xl font-bold">
                    {item.name}
                  </h2>

                  <p className="mt-2 text-yellow-400 text-xl">
                    {item.price}
                  </p>
                </div>

              </div>
            ))}

          </div>

        )}

      </div>

    </main>
  );
}