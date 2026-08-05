"use client";

import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart } = useCart();

  const total = cart.reduce((sum, item) => {
    return sum + Number(item.price.replace("₹", ""));
  }, 0);

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

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
              >

                <div className="flex items-center gap-6">

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


                <button
                  onClick={() => removeFromCart(item.id)}
                  className="rounded-full bg-red-500 px-5 py-3 font-semibold text-white hover:scale-105 transition"
                >
                  Remove
                </button>


              </div>
            ))}


            <div className="mt-12 rounded-3xl border border-yellow-400 p-6">

              <h2 className="text-3xl font-bold">
                Total:
                <span className="text-yellow-400">
                  ₹{total}
                </span>
              </h2>

            </div>


          </div>

        )}

      </div>

    </main>
  );
}