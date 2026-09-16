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

    <main className="min-h-screen overflow-x-hidden bg-[var(--mn-bg)] px-4 py-16 text-[var(--mn-text)] sm:px-6 sm:py-20 lg:py-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto max-w-5xl">


        <h1 className="mb-8 text-4xl font-black tracking-tight sm:mb-12 sm:text-5xl">
          Your <span className="text-[var(--mn-accent)]">Cart</span>
        </h1>


        {cart.length === 0 ? (

  <div className="rounded-[2rem] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-8 text-center shadow-[var(--mn-shadow-lg)] sm:p-10 lg:p-12">

    <div className="mb-5 text-5xl sm:mb-6 sm:text-6xl">
      🛒
    </div>

    <h2 className="mn-h3">
      Your cart is empty
    </h2>

    <p className="mt-4 text-[var(--mn-text-secondary)]">
      Looks like you haven&apos;t added anything yet.
    </p>

    <Link
      href="/products"
      className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--mn-accent)] px-8 py-4 font-black text-[var(--mn-accent-contrast)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--mn-accent-hover)] sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
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
border-[var(--mn-border)]
bg-[var(--mn-surface)]
p-4
shadow-[var(--mn-shadow-sm)]
shadow-[var(--mn-shadow-sm)]
transition-all
duration-300
hover:border-[var(--mn-border-strong)]
sm:p-6
md:flex-row
md:items-center
md:justify-between
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
              >


                <div className="flex min-w-0 items-center gap-4 sm:gap-5 md:gap-6">

                 <Link href={`/products/${item.id}`}>
  <Image
    src={item.image ?? "/images/notebooks/placeholder.png"}
    alt={item.name}
    width={120}
    height={160}
    className="h-28 w-20 shrink-0 rounded-2xl object-cover transition duration-300 hover:scale-[1.03] sm:h-32 sm:w-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
  />
</Link>


                  <div>

                   <Link href={`/products/${item.id}`}>
  <h2 className="text-lg font-black leading-tight transition hover:text-[var(--mn-accent)] sm:text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]">
    {item.name}
  </h2>
</Link>


                    <p className="mt-2 text-lg font-bold text-[var(--mn-accent)] sm:text-xl">
                     ₹{item.price}
                    </p>


                    <div className="mt-4 flex items-center gap-3 sm:gap-4 md:gap-5">
                      {item.customCoverId ? (
                        <>
                          <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--mn-text-muted)]">
                            Quantity
                          </span>
                          <span className="min-w-10 rounded-full border border-[var(--mn-border)] px-3 py-1.5 text-center text-lg font-bold">
                            {item.quantity}
                          </span>
                          <span className="text-xs text-[var(--mn-text-muted)]">
                            Fixed for this custom cover
                          </span>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="
                              flex h-10 w-10 items-center justify-center rounded-full
                              bg-[var(--mn-control-bg)]
                              text-xl font-bold
                              transition-all duration-200
                              hover:bg-[var(--mn-control-hover)]
                              active:scale-95
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                          >
                            -
                          </button>

                          <span className="text-xl font-bold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="
                              flex h-10 w-10 items-center justify-center rounded-full
                              bg-[var(--mn-accent)]
                              text-xl font-black text-[var(--mn-accent-contrast)]
                              transition-all duration-200
                              hover:bg-[var(--mn-accent-hover)]
                              active:scale-95
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                          >
                            +
                          </button>
                        </>
                      )}


                    </div>


                  </div>

                </div>


                <button
                  onClick={() =>
                   setRemoveId(item.id)
                  }
                 className="
  w-full rounded-2xl
  border border-[color-mix(in_srgb,var(--mn-danger)_30%,transparent)]
  px-5 py-3
  text-sm font-bold
  text-[var(--mn-danger)]
  transition-all duration-200
  hover:border-[var(--mn-danger)]
  hover:bg-[var(--mn-danger)]
  hover:text-[var(--mn-text)]
  active:scale-[0.98]
  md:w-auto
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
                >
                  Remove
                </button>


              </div>

            ))}



           <div className="mt-8 rounded-[1.5rem] border border-[var(--mn-accent)] bg-[var(--mn-surface)] p-6 shadow-[var(--mn-shadow-lg)] sm:mt-10 sm:p-8">

  <h2 className="mn-h3">
    Order Summary
  </h2>

  <div className="mt-6 flex justify-between text-[var(--mn-text-secondary)]">
    <span>Subtotal</span>
    <span>₹{total}</span>
  </div>
<div className="mt-4 flex justify-between text-[var(--mn-text-secondary)]">
  <span>Delivery</span>
  <span className="text-green-400">
    FREE
  </span>
</div>

<div className="mt-4 flex justify-between text-[var(--mn-text-secondary)]">
  <span>Premium packaging</span>
  <span className="text-green-400">
    FREE
  </span>
</div>
  <div className="my-6 border-t border-[var(--mn-border-strong)]"></div>

  <div className="flex items-end justify-between gap-4 text-2xl font-black">
    <span>Total</span>
    <span className="text-[var(--mn-accent)]">
      ₹{total}
    </span>
  </div>

 <Link href="/checkout">
  <button className="mt-8 flex w-full items-center justify-center rounded-2xl bg-[var(--mn-accent)] py-4 font-black text-[var(--mn-accent-contrast)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--mn-accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]">
    Proceed to Checkout →
  </button>
</Link>

<Link
  href="/products"
  className="mt-3 block w-full rounded-2xl border border-[var(--mn-accent)] py-4 text-center font-bold text-[var(--mn-accent)] transition-all duration-300 hover:border-[var(--mn-accent)] hover:bg-[var(--mn-accent)] hover:text-[var(--mn-accent-contrast)] sm:mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
>
  ← Continue Exploring
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