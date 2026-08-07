export default function BrandStory() {
  const highlights = [
    "🇮🇳 Designed in India",
    "📖 Premium Quality Paper",
    "✨ Personalized Covers",
    "🚚 Fast Delivery",
  ];

  return (
    <section className="border-y border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-6 py-5 text-center">

        {highlights.map((item) => (
          <div
            key={item}
            className="rounded-full border border-zinc-800 bg-black px-5 py-3 text-sm font-medium text-gray-300 transition hover:border-yellow-400 hover:text-yellow-400"
          >
            {item}
          </div>
        ))}

      </div>
    </section>
  );
}