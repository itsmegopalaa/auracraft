"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();

  const total = cart.reduce((sum, item) => {
    return (
     sum +
item.price * item.quantity
    );
  }, 0);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold mb-10">
          Checkout
        </h1>

        <div className="grid md:grid-cols-2 gap-10">

          {/* Customer Form */}
          <div className="space-y-5">

            <input
              type="text"
              placeholder="Full Name"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-4"
            />

            <input
              type="text"
              placeholder="Phone Number"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-4"
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-4"
            />

            <textarea
              placeholder="Delivery Address"
              rows={5}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-4"
            />

          </div>

          {/* Order Summary */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

            <h2 className="text-3xl font-bold mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span>
                   ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}

            </div>

            <hr className="my-6 border-zinc-700" />

            <div className="flex justify-between text-2xl font-bold">
              <span>Total</span>
              <span className="text-yellow-400">
                ₹{total}
              </span>
            </div>

            <Link href="/success">
              <button className="mt-8 w-full rounded-full bg-yellow-400 py-4 font-bold text-black hover:scale-105 transition">
                Place Order
              </button>
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}