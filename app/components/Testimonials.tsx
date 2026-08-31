export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "MineNote feels different from ordinary notebooks. The cover design is elegant and inspiring.",
      name: "MineNote Customer",
    },
    {
      quote:
        "Thousands of creators trust MineNote to capture ideas, dreams, plans, and memories.",
      name: "MineNote Community",
    },
  ];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-zinc-950/70 px-6 py-24 sm:py-28">
      {/* Subtle atmosphere */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-yellow-400/[0.06] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-300">
            Real words
          </span>

          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            What People{" "}
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Say
            </span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-zinc-400 sm:text-base">
            Why MineNote feels different from an ordinary notebook.
          </p>
        </div>

        {/* Testimonials */}
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className="group relative rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 shadow-[0_18px_50px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/25 hover:bg-white/[0.04] sm:p-8"
            >
              {/* Quote mark */}
              <div
                className="text-4xl font-serif leading-none text-yellow-400/50 transition-colors duration-300 group-hover:text-yellow-400/70"
                aria-hidden="true"
              >
                “
              </div>

              <p className="mt-3 text-base leading-8 text-zinc-300 sm:text-lg">
                {testimonial.quote}
              </p>

              <div className="mt-7 flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-full border border-yellow-400/20 bg-yellow-400/10"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-semibold text-white">
                    {testimonial.name}
                  </p>

                  {index === 0 && (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Customer experience
                    </p>
                  )}

                  {index === 1 && (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      MineNote community
                    </p>
                  )}
                </div>
              </div>

              <div
                className="mt-7 h-px w-8 bg-yellow-400/30 transition-all duration-300 group-hover:w-14 group-hover:bg-yellow-400/60"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>

        {/* Community statement */}
        <div className="mx-auto mt-12 max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-yellow-400/20" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Made for ideas
            </span>
            <span className="h-px w-10 bg-yellow-400/20" />
          </div>

          <p className="mt-5 text-sm leading-7 text-zinc-500">
            Every page is a place for something worth remembering.
          </p>
        </div>
      </div>
    </section>
  );
}
