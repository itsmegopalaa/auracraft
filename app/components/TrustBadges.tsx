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
        className="pointer-events-none absolute left-1/2 top-0 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-yellow-400/[0.025] blur-3xl sm:h-64 sm:w-[32rem]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-18 sm:px-6 sm:py-22 lg:py-28">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12 md:mb-14">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-400/80 sm:mb-4 sm:tracking-[0.3em]">
            Made with intention
          </p>

          <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl">
            The MineNote <span className="text-yellow-400">standard.</span>
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-zinc-300 sm:text-base">
            Small details that make the experience feel as considered as the
            notebook itself.
          </p>
        </div>

        <div className="grid gap-4 overflow-hidden rounded-3xl border border-white/[0.12] md:grid-cols-3 md:gap-px md:bg-white/[0.08]">
          {trustPoints.map((point) => (
            <article
              key={point.title}
              className="group rounded-3xl border border-white/[0.06] bg-zinc-950 p-6 transition-colors duration-300 hover:bg-zinc-900/90 sm:p-8 md:rounded-none md:border-0"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.035] text-lg shadow-[0_8px_25px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover:border-yellow-400/25 group-hover:bg-yellow-400/[0.05]"
                  aria-hidden="true"
                >
                  {point.icon}
                </span>

                <span className="pt-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
                  {point.eyebrow}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-bold text-white transition-colors duration-300 group-hover:text-yellow-400 sm:mt-7">
                {point.title}
              </h3>

              <p className="mt-3 text-[15px] leading-7 text-zinc-300">
                {point.description}
              </p>

              <div
                className="mt-6 h-px w-8 bg-yellow-400/30 transition-all duration-300 group-hover:w-12 group-hover:bg-yellow-400/60 sm:mt-7"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
