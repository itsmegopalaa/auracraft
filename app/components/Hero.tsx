export default function Hero() {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl md:text-8xl font-extrabold leading-tight">
        Create Your
        <span className="block bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
          AuraCraft 🚀
        </span>
      </h1>

      <p className="mt-8 max-w-2xl text-xl md:text-2xl text-gray-300">
        Premium personalized notebooks designed to reflect your personality,
        ambition and creativity.
      </p>

      <div className="mt-10 flex gap-5">
        <button className="bg-yellow-400 text-black px-8 py-4 rounded-full font-semibold shadow-xl shadow-yellow-500/40 hover:scale-110 transition-all duration-300">
          Explore AuraNotes →
        </button>

        <button className="border border-zinc-600 px-8 py-4 rounded-full hover:border-yellow-400 hover:bg-yellow-400/10 transition-all duration-300">
          Our Story
        </button>
      </div>
    </section>
  );
}