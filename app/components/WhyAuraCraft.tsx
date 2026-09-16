export default function WhyAuraCraft() {
  const features = [
    {
      number: "01",
      title: "Premium Design",
      description:
        "Thoughtfully designed covers with a refined look that feels personal, distinctive, and made to last.",
    },
    {
      number: "02",
      title: "Made Personal",
      description:
        "Choose designs that reflect your personality, interests, and the way you want your notebook to feel.",
    },
    {
      number: "03",
      title: "Made to Inspire",
      description:
        "A notebook should invite you to write, plan, create, and keep coming back to the next page.",
    },
  ];

  return (
    <section
      id="why"
      className="border-b border-[var(--mn-border)] bg-[var(--mn-surface-soft)]"
    >
      <div className="mn-container-wide py-[clamp(5rem,8vw,7.5rem)] sm:py-[clamp(6rem,9vw,9rem)] lg:py-28">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-[var(--mn-accent)]"
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--mn-accent)]">
              The MineNote difference
            </p>
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[var(--mn-text)] sm:text-5xl lg:text-6xl">
            Why MineNote?
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--mn-text-secondary)] sm:text-base sm:leading-8">
            Your notebook should feel like more than something you write in.
            It should reflect your ideas, your personality, and the things
            you want to create.
          </p>
        </div>

        <div className="mt-10 grid border border-[var(--mn-border)] md:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.number}
              className={`group relative p-7 transition-colors duration-300 hover:bg-[var(--mn-surface)] sm:p-8 ${
                index > 0
                  ? "border-t border-[var(--mn-border)] md:border-l md:border-t-0"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--mn-border-strong)] text-[10px] font-semibold tracking-[0.08em] text-[var(--mn-accent)] transition-all duration-300 group-hover:border-[var(--mn-accent)] group-hover:bg-[var(--mn-accent-soft)]">
                  {feature.number}
                </span>

                <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
                  MineNote
                </span>
              </div>

              <h3 className="mt-9 text-xl font-semibold tracking-[-0.025em] text-[var(--mn-text)] transition-colors duration-300 group-hover:text-[var(--mn-accent)]">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[var(--mn-text-secondary)]">
                {feature.description}
              </p>

              <div className="mt-7 h-px w-8 bg-[var(--mn-accent)] transition-all duration-500 group-hover:w-16" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
