export default function Newsletter() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">

        <p className="text-yellow-400 font-semibold tracking-wide">
          Stay Inspired
        </p>

        <h2 className="mt-4 text-4xl font-extrabold md:text-5xl">
          Join the <span className="text-yellow-400">AuraCraft</span> Family
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
          Get new notebook launches, exclusive designs, special offers and
          creative inspiration directly in your inbox.
        </p>

        <form className="mx-auto mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 rounded-full border border-zinc-700 bg-black px-6 py-4 text-white outline-none focus:border-yellow-400"
          />

          <button
            type="submit"
            className="rounded-full bg-yellow-400 px-8 py-4 font-bold text-black transition hover:scale-105 hover:bg-yellow-300"
          >
            Subscribe →
          </button>
        </form>

        <p className="mt-5 text-xs text-gray-600">
          No spam. Just AuraCraft updates and inspiration.
        </p>

      </div>
    </section>
  );
}