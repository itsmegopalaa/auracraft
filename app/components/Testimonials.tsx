export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "MineNote feels different from ordinary notebooks. The cover design is elegant and inspiring.",
      name: "MineNote Customer",
      label: "Customer experience",
    },
    {
      quote:
        "Thousands of creators trust MineNote to capture ideas, dreams, plans, and memories.",
      name: "MineNote Community",
      label: "MineNote community",
    },
  ];

  return (
    <section className="border-b border-[var(--mn-border)] bg-[var(--mn-surface-soft)]">
      <div className="mn-container-wide py-[clamp(5rem,8vw,7.5rem)] sm:py-[clamp(6rem,9vw,9rem)] lg:py-28">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-[var(--mn-accent)]"
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--mn-accent)]">
              Real words
            </p>
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[var(--mn-text)] sm:text-5xl lg:text-6xl">
            What people say
          </h2>

          <p className="mt-4 text-sm leading-7 text-[var(--mn-text-secondary)] sm:text-base">
            Why MineNote feels different from an ordinary notebook.
          </p>
        </div>

        <div className="mt-10 grid gap-[var(--mn-space-card)] md:mt-12 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="group relative overflow-hidden rounded-[1.5rem] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-7 shadow-[var(--mn-shadow-sm)] transition-all duration-500 hover:-translate-y-1 hover:border-[var(--mn-border-strong)] hover:shadow-[var(--mn-shadow-lg)] sm:p-9"
            >
              <span
                className="font-serif text-6xl leading-none text-[var(--mn-accent)] transition-transform duration-500 group-hover:-translate-y-1"
                aria-hidden="true"
              >
                “
              </span>

              <p className="mt-3 text-lg leading-8 tracking-[-0.01em] text-[var(--mn-text)]">
                {testimonial.quote}
              </p>

              <div className="mt-8 border-t border-[var(--mn-border)] pt-5">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[var(--mn-accent)]"
                  />
                  <p className="text-sm font-semibold text-[var(--mn-text)]">
                  {testimonial.name}
                  </p>
                </div>

                <p className="mt-1 text-xs text-[var(--mn-text-muted)]">
                  {testimonial.label}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
