"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
export default function CartPage() {

  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();


  const total = cart.reduce((sum, item) => {
    return (
      sum +
item.price *
item.quantity
    );
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
                     ₹{item.price}
                    </p>


                    <div className="flex items-center gap-4 mt-4">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                        className="bg-zinc-700 px-4 py-2 rounded-full"
                      >
                        -
                      </button>


                      <span className="text-xl font-bold">
                        {item.quantity}
                      </span>


                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                        className="bg-yellow-400 text-black px-4 py-2 rounded-full"
                      >
                        +
                      </button>


                    </div>


                  </div>

                </div>


                <button
                  onClick={() =>
                    removeFromCart(item.id)
                  }
                  className="bg-red-500 px-5 py-3 rounded-full font-semibold"
                >
                  Remove
                </button>


              </div>

            ))}



           <div className="border border-yellow-400 rounded-3xl p-6 mt-10">

  <h2 className="text-3xl font-bold">
    Total:
    <span className="text-yellow-400">
      ₹{total}
    </span>
  </h2>

  <Link href="/checkout">
    <button className="mt-8 w-full rounded-full bg-yellow-400 py-4 font-bold text-black hover:scale-105 transition">
      Proceed to Checkout →
    </button>
  </Link>

</div>


          </div>

        )}


      </div>

    </main>
  );
}