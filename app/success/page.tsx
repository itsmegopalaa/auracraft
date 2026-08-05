import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="text-center max-w-xl">

        <h1 className="text-6xl mb-6">
          🎉
        </h1>

        <h2 className="text-5xl font-bold">
          Order Placed Successfully!
        </h2>

        <p className="mt-6 text-gray-400 text-xl">
          Thank you for choosing AuraCraft.
          <br />
          Your order has been received.
        </p>

        <Link href="/">
          <button className="mt-10 rounded-full bg-yellow-400 px-10 py-4 font-bold text-black hover:scale-105 transition">
            Continue Shopping
          </button>
        </Link>

      </div>

    </main>
  );
}