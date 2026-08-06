"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [address, setAddress] = useState("");
const [city, setCity] = useState("");
const [state, setState] = useState("");
const [pin, setPin] = useState("");
  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  const handlePlaceOrder = () => {
  if (
    !name.trim() ||
    !phone.trim() ||
    !email.trim() ||
    !address.trim() ||
    !city.trim() ||
    !state.trim() ||
    !pin.trim()
  ) {
   toast.error("Please fill all required fields.");
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    toast.error("Please enter a valid 10-digit phone number.");
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    toast.error("Please enter a valid email address.");
    return;
  }

  if (!/^\d{6}$/.test(pin)) {
   toast.error("Please enter a valid 6-digit PIN code.");
    return;
  }

  if (cart.length === 0) {
   toast.error("Your cart is empty.");
    return;
  }
toast.success("Order placed successfully!");
  router.push("/success");
};
if (cart.length === 0) {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">

          <div className="mb-6 text-6xl">🛒</div>

          <h1 className="text-3xl font-bold">
            Your cart is empty
          </h1>

          <p className="mt-4 text-gray-400">
            Add some premium notebooks before proceeding to checkout.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-yellow-400 px-8 py-4 font-bold text-black transition hover:scale-105"
          >
            Explore Products →
          </Link>

        </div>
      </main>

      <Footer />
    </>
  );
}
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
                value={name}
onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-2xl bg-black border border-zinc-700 p-4 outline-none focus:border-yellow-400"
              />


              <input
                type="text"
                value={phone}
onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full rounded-2xl bg-black border border-zinc-700 p-4 outline-none focus:border-yellow-400"
              />


              <input
                type="email"
                value={email}
onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full rounded-2xl bg-black border border-zinc-700 p-4 outline-none focus:border-yellow-400"
              />


              <textarea
                placeholder="Complete Delivery Address"
                rows={5}
                value={address}
onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-2xl bg-black border border-zinc-700 p-4 outline-none focus:border-yellow-400"
              /><div className="grid grid-cols-1 gap-5 md:grid-cols-2">

  <input
    type="text"
    value={city}
onChange={(e) => setCity(e.target.value)}
    placeholder="City"
    className="w-full rounded-2xl bg-black border border-zinc-700 p-4 outline-none focus:border-yellow-400"
  />

  <input
    type="text"
    value={state}
onChange={(e) => setState(e.target.value)}
    placeholder="State"
    className="w-full rounded-2xl bg-black border border-zinc-700 p-4 outline-none focus:border-yellow-400"
  />

</div>

<input
  type="text"
  value={pin}
onChange={(e) => setPin(e.target.value)}
  placeholder="PIN Code"
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

{/* Payment Method */}

<div className="mt-8">

  <h3 className="mb-5 text-2xl font-bold">
    Payment Method
  </h3>

  <div className="space-y-4">

    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-yellow-400 bg-black p-4">
      <input
        type="radio"
        name="payment"
        defaultChecked
      />
      <span>💵 Cash on Delivery (Recommended)</span>
    </label>

    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-700 bg-black p-4 hover:border-yellow-400">
      <input
        type="radio"
        name="payment"
      />
      <span>📱 UPI Payment</span>
    </label>

    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-700 bg-black p-4 hover:border-yellow-400">
      <input
        type="radio"
        name="payment"
      />
      <span>💳 Credit / Debit Card</span>
    </label>

  </div>

</div>
            <div className="mt-8 rounded-2xl bg-black p-4 text-sm text-gray-400">
              🔒 Secure checkout • Premium quality guarantee
            </div>


           <button
  onClick={handlePlaceOrder}
  className="mt-8 w-full rounded-full bg-yellow-400 py-4 font-bold text-black transition hover:scale-105"
>
  Place Order →
</button>


          </div>


        </div>

      </div>

    </main>

    <Footer />
  </>
);
}