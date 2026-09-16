export default function Newsletter() {
  return (
    <section className="bg-[var(--mn-bg)]">
      <div className="mn-container-wide py-20 sm:py-24 lg:py-28">
        <div className="border border-[var(--mn-border)] bg-[var(--mn-surface)] px-5 py-12 sm:px-10 sm:py-14 md:px-16 md:py-16">
          <div className="grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-[var(--mn-accent)]"
                />
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--mn-accent)]">
                  Stay inspired
                </p>
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[var(--mn-text)] sm:text-5xl lg:text-6xl">
                Join the MineNote family.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--mn-text-secondary)] sm:text-base">
                New notebook launches, exclusive designs, special offers and
                creative inspiration — directly in your inbox.
              </p>
            </div>

            <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>

              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email address"
                className="min-h-13 min-w-0 flex-1 rounded-xl border border-[var(--mn-border-strong)] bg-[var(--mn-bg)] px-5 text-sm text-[var(--mn-text)] placeholder:text-[var(--mn-text-muted)] outline-none transition-all duration-300 hover:border-[var(--mn-accent)] focus:border-[var(--mn-focus)] focus:ring-2 focus:ring-[var(--mn-focus)]/10"
              />

              <button
                type="submit"
                className="group relative min-h-13 overflow-hidden rounded-xl bg-[var(--mn-accent)] px-7 text-sm font-semibold text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--mn-shadow-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)]"
              >
                <span className="relative">Subscribe</span>
                <span
                  aria-hidden="true"
                  className="relative ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </button>
            </form>
          </div>

          <div className="mt-7 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-5 bg-[var(--mn-border-strong)]"
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mn-text-muted)]">
              No spam · Just MineNote
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
