export default function BrandStory() {
  const highlights = [
    { label: "Designed in India", icon: "✦" },
    { label: "Premium Quality Paper", icon: "◌" },
    { label: "Personalized Covers", icon: "□" },
    { label: "Fast Delivery", icon: "→" },
  ];

  return (
    <section className="border-b border-[var(--mn-border)] bg-[var(--mn-surface)]">
      <div className="mn-container-wide flex flex-wrap items-center justify-center divide-x divide-[var(--mn-border)] py-3 sm:py-4">
        {highlights.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 px-3 py-2 sm:px-5"
          >
            <span
              className="text-sm text-[var(--mn-accent)]"
              aria-hidden="true"
            >
              {item.icon}
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--mn-text-secondary)] sm:text-[11px]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
