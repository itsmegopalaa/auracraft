export default function BrandStory() {
  const highlights = [
    {
      label: "Designed in India",
      detail: "Thoughtfully created",
    },
    {
      label: "Premium Paper",
      detail: "Made for everyday use",
    },
    {
      label: "Personalized Covers",
      detail: "Make it unmistakably yours",
    },
    {
      label: "Fast Delivery",
      detail: "Packed with care",
    },
  ];

  return (
    <section className="border-b border-[var(--mn-border)] bg-[var(--mn-surface)]">
      <div className="mn-container-wide">
        <div className="grid grid-cols-2 divide-x divide-y divide-[var(--mn-border)] md:grid-cols-4 md:divide-y-0">
          {highlights.map((item, index) => (
            <div
              key={item.label}
              className="group relative flex min-h-[92px] items-center gap-3 px-4 py-5 transition-colors duration-300 hover:bg-[var(--mn-surface-soft)] sm:px-6"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--mn-border-strong)] text-[10px] font-semibold text-[var(--mn-accent)] transition-all duration-300 group-hover:border-[var(--mn-accent)] group-hover:bg-[var(--mn-accent-soft)]"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--mn-text)] sm:text-[11px]">
                  {item.label}
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[var(--mn-text-muted)]">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
