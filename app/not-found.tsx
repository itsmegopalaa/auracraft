import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">

      <h1 className="text-8xl font-extrabold text-yellow-400">
        404
      </h1>

      <h2 className="mt-6 text-3xl font-bold">
        Page Not Found
      </h2>

      <p className="mt-4 max-w-xl text-lg leading-8 text-gray-400">
        Oops! The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Let&apos;s get you back to exploring MineNote.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">

        <Link
          href="/"
          className="rounded-full bg-yellow-400 px-8 py-3 font-semibold text-black transition hover:scale-105"
        >
          Back Home
        </Link>

        <Link
          href="/products"
          className="rounded-full border border-yellow-400 px-8 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
        >
          Explore Products
        </Link>

      </div>

    </main>
  );
}