export default function TrustBadges() {
  const trustPoints = [
    {
      eyebrow: "The feel",
      title: "Premium Paper",
      description:
        "Smooth pages crafted for comfortable everyday writing.",
    },
    {
      eyebrow: "The care",
      title: "Secure Packaging",
      description:
        "Every order is carefully packed before it begins its journey.",
    },
    {
      eyebrow: "The standard",
      title: "MineNote Quality",
      description:
        "Thoughtful designs made for creators, dreamers, and everyday ideas.",
    },
  ];

  return (
    <section className="border-b border-[var(--mn-border)] bg-[var(--mn-bg)]">
      <div className="mn-container-wide py-[clamp(5rem,8vw,7.5rem)] sm:py-[clamp(6rem,9vw,9rem)] lg:py-28">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-[var(--mn-accent)]"
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--mn-accent)]">
              Made with intention
            </p>
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[var(--mn-text)] sm:text-5xl lg:text-6xl">
            The MineNote standard.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--mn-text-secondary)] sm:text-base">
            Small details that make the experience feel as considered as the
            notebook itself.
          </p>
        </div>

        <div className="mt-10 grid overflow-hidden border border-[var(--mn-border)] md:grid-cols-3">
          {trustPoints.map((point, index) => (
            <article
              key={point.title}
              className={`group relative p-[var(--mn-space-card)] transition-colors duration-300 hover:bg-[var(--mn-surface-soft)] sm:p-8 ${
                index > 0 ? "border-t border-[var(--mn-border)] md:border-l md:border-t-0" : ""
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] text-[10px] font-semibold tracking-[0.08em] text-[var(--mn-accent)] transition-all duration-300 group-hover:border-[var(--mn-accent)] group-hover:bg-[var(--mn-accent-soft)]">
                0{index + 1}
              </div>

              <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--mn-text-muted)]">
                {point.eyebrow}
              </p>

              <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[var(--mn-text)]">
                {point.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[var(--mn-text-secondary)]">
                {point.description}
              </p>

              <div className="mt-7 h-px w-8 bg-[var(--mn-accent)] transition-all duration-500 group-hover:w-16" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
