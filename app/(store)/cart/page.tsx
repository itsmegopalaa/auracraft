"use client";

import { useState } from "react";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
export default function CartPage() {
const [removeId, setRemoveId] = useState<string | null>(null);
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
  <>

    <main className="min-h-screen overflow-x-hidden bg-black px-4 py-16 text-white sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl">


        <h1 className="mb-8 text-4xl font-black tracking-tight sm:mb-12 sm:text-5xl">
          Your <span className="text-yellow-400">Cart</span>
        </h1>


        {cart.length === 0 ? (

  <div className="rounded-[2rem] border border-white/[0.08] bg-zinc-950 p-8 text-center shadow-2xl shadow-black/20 sm:p-12">

    <div className="mb-5 text-5xl sm:mb-6 sm:text-6xl">
      🛒
    </div>

    <h2 className="text-2xl font-black sm:text-3xl">
      Your cart is empty
    </h2>

    <p className="mt-4 text-gray-400">
      Looks like you haven&apos;t added anything yet.
    </p>

    <Link
      href="/products"
      className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-yellow-400 px-8 py-4 font-black text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      Explore Products →
    </Link>

  </div>

) : (
          <div className="space-y-6">


            {cart.map((item) => (

              <div
                key={item.id}
              className="
flex
flex-col
gap-5
rounded-[2rem]
border
border-white/[0.08]
bg-zinc-950
p-4
shadow-xl
shadow-black/10
transition-all
duration-300
hover:border-yellow-400/25
sm:p-6
md:flex-row
md:items-center
md:justify-between
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >


                <div className="flex min-w-0 items-center gap-4 sm:gap-6">

                 <Link href={`/products/${item.id}`}>
  <Image
    src={item.image ?? "/images/notebooks/placeholder.png"}
    alt={item.name}
    width={120}
    height={160}
    className="h-28 w-20 shrink-0 rounded-2xl object-cover transition duration-300 hover:scale-[1.03] sm:h-32 sm:w-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
  />
</Link>


                  <div>

                   <Link href={`/products/${item.id}`}>
  <h2 className="text-lg font-black leading-tight transition hover:text-yellow-400 sm:text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
    {item.name}
  </h2>
</Link>


                    <p className="mt-2 text-lg font-bold text-yellow-400 sm:text-xl">
                     ₹{item.price}
                    </p>


                    <div className="mt-4 flex items-center gap-3 sm:gap-4">

                     <button
  onClick={() =>
    decreaseQuantity(item.id)
  }
  className="
    flex h-10 w-10 items-center justify-center rounded-full
    bg-zinc-800
    text-xl font-bold
    transition-all duration-200
    hover:bg-zinc-700
    active:scale-95
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
  className="
    flex h-10 w-10 items-center justify-center rounded-full
    bg-yellow-400
    text-xl font-black text-black
    transition-all duration-200
    hover:bg-yellow-300
    active:scale-95
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
>
  +
</button>


                    </div>


                  </div>

                </div>


                <button
                  onClick={() =>
                   setRemoveId(item.id)
                  }
                 className="
  w-full rounded-2xl
  border border-red-500/30
  px-5 py-3
  text-sm font-bold
  text-red-400
  transition-all duration-200
  hover:border-red-500
  hover:bg-red-500
  hover:text-white
  active:scale-[0.98]
  md:w-auto
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Remove
                </button>


              </div>

            ))}



           <div className="mt-8 rounded-[2rem] border border-yellow-400/15 bg-zinc-950 p-6 shadow-2xl shadow-black/20 sm:mt-10 sm:p-8">

  <h2 className="text-2xl font-black sm:text-3xl">
    Order Summary
  </h2>

  <div className="mt-6 flex justify-between text-gray-400">
    <span>Subtotal</span>
    <span>₹{total}</span>
  </div>
<div className="mt-4 flex justify-between text-gray-400">
  <span>Delivery</span>
  <span className="text-green-400">
    FREE
  </span>
</div>

<div className="mt-4 flex justify-between text-gray-400">
  <span>Premium Packaging</span>
  <span className="text-green-400">
    FREE
  </span>
</div>
  <div className="my-6 border-t border-zinc-700"></div>

  <div className="flex items-end justify-between gap-4 text-2xl font-black">
    <span>Total</span>
    <span className="text-yellow-400">
      ₹{total}
    </span>
  </div>

 <Link href="/checkout">
  <button className="mt-8 flex w-full items-center justify-center rounded-2xl bg-yellow-400 py-4 font-black text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
    Proceed to Checkout →
  </button>
</Link>

<Link
  href="/products"
  className="mt-3 block w-full rounded-2xl border border-yellow-400/50 py-4 text-center font-bold text-yellow-400 transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black sm:mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
>
  ← Continue Shopping
</Link>

</div>


          </div>

        )}


      </div>

     </main>
<ConfirmModal
  open={removeId !== null}
  title="Remove item?"
  message="Are you sure you want to remove this notebook from your cart?"
  confirmText="Remove"
  onCancel={() => setRemoveId(null)}
  onConfirm={() => {
    if (removeId !== null) {
      removeFromCart(removeId);
      setRemoveId(null);
    }
  }}
/>
    <Footer />
  </>
); 
}