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
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-zinc-950/70 px-5 py-20 sm:px-6 sm:py-24 lg:py-28">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-400/[0.06] blur-3xl sm:h-72 sm:w-72"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-yellow-400/20 bg-yellow-400/[0.06] px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-yellow-300 sm:px-4 sm:text-[10px] sm:tracking-[0.2em]">
            Real words
          </span>

          <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-white sm:mt-5 sm:text-5xl">
            What People{" "}
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Say
            </span>
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-zinc-300 sm:mt-5 sm:text-base">
            Why MineNote feels different from an ordinary notebook.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 md:gap-5">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className="group relative rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/25 hover:bg-white/[0.04] sm:p-8"
            >
              <div
                className="text-4xl font-serif leading-none text-yellow-400/50 transition-colors duration-300 group-hover:text-yellow-400/70"
                aria-hidden="true"
              >
                “
              </div>

              <p className="mt-3 text-[15px] leading-7 text-zinc-300 sm:text-lg sm:leading-8">
                {testimonial.quote}
              </p>

              <div className="mt-6 flex items-center gap-3 sm:mt-7">
                <div
                  className="h-8 w-8 shrink-0 rounded-full border border-yellow-400/20 bg-yellow-400/10"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-semibold text-white">
                    {testimonial.name}
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    {index === 0
                      ? "Customer experience"
                      : "MineNote community"}
                  </p>
                </div>
              </div>

              <div
                className="mt-6 h-px w-8 bg-yellow-400/30 transition-all duration-300 group-hover:w-14 group-hover:bg-yellow-400/60 sm:mt-7"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl text-center sm:mt-12">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-yellow-400/20 sm:w-10" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-600 sm:text-[10px] sm:tracking-[0.18em]">
              Made for ideas
            </span>
            <span className="h-px w-8 bg-yellow-400/20 sm:w-10" />
          </div>

          <p className="mt-4 text-[15px] leading-7 text-zinc-300 sm:mt-5">
            Every page is a place for something worth remembering.
          </p>
        </div>
      </div>
    </section>
  );
}
