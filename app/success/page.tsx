import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
export default function SuccessPage() {
  return (
  <>
    <Navbar />

    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-24">

      <div className="max-w-xl text-center rounded-3xl border border-zinc-800 bg-zinc-900 p-12 shadow-xl">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400 text-5xl">
          ✓
        </div>


        <h1 className="mt-8 text-5xl font-extrabold">
          Order Confirmed
        </h1>


        <p className="mt-5 text-xl text-gray-400 leading-relaxed">
          Thank you for choosing
          <span className="text-yellow-400 font-bold">
            {" "}AuraCraft
          </span>.
          <br />
          Your premium notebook order has been received.
        </p>


        <div className="mt-8 rounded-2xl border border-zinc-700 bg-black p-5 text-left">

          <p className="text-gray-400">
            ✨ Premium Quality
          </p>

          <p className="mt-2 text-gray-400">
            📦 Carefully Packed
          </p>

          <p className="mt-2 text-gray-400">
            🚚 Ready For Delivery
          </p>

        </div>


        <Link href="/">
          <button className="mt-10 w-full rounded-full bg-yellow-400 py-4 font-bold text-black transition hover:scale-105">
            Continue Shopping →
          </button>
        </Link>


      </div>

    </main>

    <Footer />
  </>
);
}