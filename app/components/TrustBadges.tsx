export default function TrustBadges() {
  const trustPoints = [
    {
      icon: "📖",
      eyebrow: "The feel",
      title: "Premium Paper",
      description:
        "Smooth pages crafted for comfortable everyday writing.",
    },
    {
      icon: "📦",
      eyebrow: "The care",
      title: "Secure Packaging",
      description:
        "Every order is carefully packed before it begins its journey.",
    },
    {
      icon: "✨",
      eyebrow: "The standard",
      title: "MineNote Quality",
      description:
        "Thoughtful designs made for creators, dreamers, and everyday ideas.",
    },
  ];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-zinc-950">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-yellow-400/[0.025] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-400/80">
            Made with intention
          </p>

          <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl">
            The MineNote <span className="text-yellow-400">standard.</span>
          </h2>

          <p className="mt-4 text-sm leading-7 text-zinc-500 sm:text-base">
            Small details that make the experience feel as considered as the
            notebook itself.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
          {trustPoints.map((point) => (
            <article
              key={point.title}
              className="group bg-zinc-950 p-7 transition-colors duration-300 hover:bg-zinc-900/90 sm:p-8"
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-lg shadow-[0_8px_25px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover:border-yellow-400/25 group-hover:bg-yellow-400/[0.05]"
                  aria-hidden="true"
                >
                  {point.icon}
                </span>

                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                  {point.eyebrow}
                </span>
              </div>

              <h3 className="mt-7 text-lg font-bold text-white transition-colors duration-300 group-hover:text-yellow-400">
                {point.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-zinc-500">
                {point.description}
              </p>

              <div
                className="mt-7 h-px w-8 bg-yellow-400/30 transition-all duration-300 group-hover:w-12 group-hover:bg-yellow-400/60"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
