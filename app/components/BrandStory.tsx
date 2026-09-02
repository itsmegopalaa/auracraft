export default function BrandStory() {
  const highlights = [
    { label: "Designed in India", icon: "🇮🇳" },
    { label: "Premium Quality Paper", icon: "📖" },
    { label: "Personalized Covers", icon: "✨" },
    { label: "Fast Delivery", icon: "🚚" },
  ];

  return (
    <section className="border-y border-white/[0.06] bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-y-1 px-4 py-4 sm:px-6 sm:py-5 md:gap-y-0 md:py-6">
        {highlights.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {index > 0 && (
              <span
                className="mx-2 hidden h-1 w-1 rounded-full bg-yellow-400/50 sm:mx-3 sm:block md:mx-4"
                aria-hidden="true"
              />
            )}

            <div className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2">
              <span className="text-sm opacity-90" aria-hidden="true">
                {item.icon}
              </span>

              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:text-[10px] sm:tracking-[0.16em] md:text-[11px]">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
