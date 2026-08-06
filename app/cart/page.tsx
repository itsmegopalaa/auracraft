"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";
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
  <>
    <Navbar />

    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-5xl mx-auto">


        <h1 className="text-5xl font-bold mb-12">
          Your <span className="text-yellow-400">Cart</span>
        </h1>


        {cart.length === 0 ? (

  <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center">

    <div className="text-6xl mb-6">
      🛒
    </div>

    <h2 className="text-3xl font-bold">
      Your cart is empty
    </h2>

    <p className="mt-4 text-gray-400">
      Looks like you haven't added anything yet.
    </p>

    <Link
      href="/products"
      className="inline-block mt-8 rounded-full bg-yellow-400 px-8 py-4 font-bold text-black transition hover:scale-105"
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
gap-6
rounded-3xl
border
border-zinc-800
bg-zinc-900
p-6
transition-all
duration-300
hover:-translate-y-1
hover:border-yellow-400
md:flex-row
md:items-center
md:justify-between
"
              >


                <div className="flex items-center gap-6">

                 <Link href={`/products/${item.id}`}>
  <Image
    src={item.image}
    alt={item.name}
    width={120}
    height={160}
    className="h-32 w-24 rounded-xl object-cover transition hover:scale-105"
  />
</Link>


                  <div>

                   <Link href={`/products/${item.id}`}>
  <h2 className="text-2xl font-bold transition hover:text-yellow-400">
    {item.name}
  </h2>
</Link>


                    <p className="mt-2 text-yellow-400 text-xl">
                     ₹{item.price}
                    </p>


                    <div className="mt-4 flex items-center gap-4">

                     <button
  onClick={() =>
    decreaseQuantity(item.id)
  }
  className="
    h-10 w-10 rounded-full
    bg-zinc-700
    text-xl font-bold
    transition hover:bg-zinc-600
  "
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
    h-10 w-10 rounded-full
    bg-yellow-400
    text-xl font-bold text-black
    transition hover:scale-110
  "
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
                 className="
  rounded-full
  border border-red-500
  px-6 py-3
  font-semibold
  text-red-400
  transition
  hover:bg-red-500
  hover:text-white
  hover:scale-105
"
                >
                  Remove
                </button>


              </div>

            ))}



           <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

  <h2 className="text-3xl font-bold">
    Order Summary
  </h2>

  <div className="mt-6 flex justify-between text-gray-400">
    <span>Subtotal</span>
    <span>₹{total}</span>
  </div>

  <div className="my-6 border-t border-zinc-700"></div>

  <div className="flex justify-between text-2xl font-bold">
    <span>Total</span>
    <span className="text-yellow-400">
      ₹{total}
    </span>
  </div>

 <Link href="/checkout">
  <button className="mt-8 w-full rounded-full bg-yellow-400 py-4 font-bold text-black transition hover:scale-105">
    Proceed to Checkout →
  </button>
</Link>

<Link
  href="/products"
  className="mt-4 block w-full rounded-full border border-yellow-400 py-4 text-center font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
>
  ← Continue Shopping
</Link>

</div>


          </div>

        )}


      </div>

     </main>

    <Footer />
  </>
); 
}