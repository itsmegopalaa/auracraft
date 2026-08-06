import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SuccessPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-24">

        <div className="
          max-w-xl
          w-full
          text-center
          rounded-3xl
          border
          border-yellow-400/30
          bg-zinc-900
          p-12
          shadow-2xl
        ">

          <div className="
            mx-auto
            flex
            h-28
            w-28
            items-center
            justify-center
            rounded-full
            bg-yellow-400
            text-6xl
            text-black
          ">
            ✓
          </div>


          <h1 className="mt-8 text-5xl font-extrabold">
            Order Confirmed 🎉
          </h1>


          <p className="mt-5 text-lg text-gray-400 leading-relaxed">
            Thank you for choosing{" "}
            <span className="font-bold text-yellow-400">
              AuraCraft
            </span>.
            <br />
            Your premium notebook order is being prepared.
          </p>


          <div className="
            mt-8
            rounded-2xl
            border
            border-zinc-700
            bg-black
            p-6
            text-left
          ">

            <p className="text-gray-300">
              🧾 Order ID: <span className="text-yellow-400 font-bold">
                AC2026-001
              </span>
            </p>

            <p className="mt-3 text-gray-300">
              🚚 Estimated Delivery: <span className="font-bold">
                3-5 Working Days
              </span>
            </p>

            <p className="mt-3 text-gray-300">
              🔒 Secure Payment Confirmed
            </p>

          </div>


          <div className="mt-8 grid gap-3 text-left">

            <div className="rounded-xl bg-zinc-800 p-4">
              ✨ Premium Quality Notebook
            </div>

            <div className="rounded-xl bg-zinc-800 p-4">
              📦 Carefully Packed With Love
            </div>

            <div className="rounded-xl bg-zinc-800 p-4">
              🚀 Ready For Dispatch
            </div>

          </div>


          <Link href="/products">

            <button className="
              mt-10
              w-full
              rounded-full
              bg-yellow-400
              py-4
              font-bold
              text-black
              transition
              hover:scale-105
            ">
              Explore More Designs →
            </button>

          </Link>


        </div>

      </main>

      <Footer />
    </>
  );
}