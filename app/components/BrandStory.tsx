export default function BrandStory() {
  const highlights = [
    {
      label: "Designed in India",
      icon: "🇮🇳",
    },
    {
      label: "Premium Quality Paper",
      icon: "📖",
    },
    {
      label: "Personalized Covers",
      icon: "✨",
    },
    {
      label: "Fast Delivery",
      icon: "🚚",
    },
  ];

  return (
    <section className="border-y border-white/[0.06] bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center px-5 py-6 sm:px-6 sm:py-7">
        {highlights.map((item, index) => (
          <div
            key={item.label}
            className="flex items-center"
          >
            {index > 0 && (
              <span
                className="mx-4 hidden h-1 w-1 rounded-full bg-yellow-400/50 sm:block"
                aria-hidden="true"
              />
            )}

            <div className="flex items-center gap-2.5 px-3 py-2 text-center">
              <span
                className="text-sm opacity-90"
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 sm:text-[11px]">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
