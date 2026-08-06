"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

 return (
  <>
    <Navbar />

    <main className="min-h-screen bg-black text-white px-6 py-24">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          Complete Your <span className="text-yellow-400">Order</span>
        </h1>

        <p className="text-gray-400 mb-12 text-lg">
          Premium notebooks delivered to your doorstep ✨
        </p>


        <div className="grid md:grid-cols-2 gap-10">


          {/* Customer Details */}

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

            <h2 className="text-3xl font-bold mb-8">
              Delivery Details 📦
            </h2>


            <div className="space-y-5">

              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-2xl bg-black border border-zinc-700 p-4 outline-none focus:border-yellow-400"
              />


              <input
                type="text"
                placeholder="Phone Number"
                className="w-full rounded-2xl bg-black border border-zinc-700 p-4 outline-none focus:border-yellow-400"
              />


              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-2xl bg-black border border-zinc-700 p-4 outline-none focus:border-yellow-400"
              />


              <textarea
                placeholder="Complete Delivery Address"
                rows={5}
                className="w-full rounded-2xl bg-black border border-zinc-700 p-4 outline-none focus:border-yellow-400"
              />

            </div>

          </div>



          {/* Order Summary */}

          <div className="rounded-3xl border border-yellow-400/30 bg-zinc-900 p-8">


            <h2 className="text-3xl font-bold mb-8">
              Order Summary 🛒
            </h2>


            <div className="space-y-5">

              {cart.map((item) => (

                <div
                  key={item.id}
                  className="flex justify-between text-gray-300"
                >

                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span className="text-white font-semibold">
                    ₹{item.price * item.quantity}
                  </span>

                </div>

              ))}

            </div>


            <div className="my-8 border-t border-zinc-700"></div>


            <div className="flex justify-between text-3xl font-bold">

              <span>
                Total
              </span>

              <span className="text-yellow-400">
                ₹{total}
              </span>

            </div>


            <div className="mt-8 rounded-2xl bg-black p-4 text-sm text-gray-400">
              🔒 Secure checkout • Premium quality guarantee
            </div>


            <Link href="/success">

              <button className="mt-8 w-full rounded-full bg-yellow-400 py-4 font-bold text-black transition hover:scale-105">
                Place Order →
              </button>

            </Link>


          </div>


        </div>

      </div>

    </main>

    <Footer />
  </>
);
}