export default function Newsletter() {
  return (
    <section className="relative overflow-hidden px-5 py-20 sm:px-6 sm:py-24 lg:py-28">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/[0.06] blur-3xl sm:h-80 sm:w-80"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-zinc-950 px-5 py-11 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:px-10 sm:py-14 md:px-16 md:py-16">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/[0.06] px-3.5 py-2 sm:px-4">
            <span
              className="h-1.5 w-1.5 rounded-full bg-yellow-400"
              aria-hidden="true"
            />
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-300 sm:text-[10px] sm:tracking-[0.2em]">
              Stay Inspired
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.03em] text-white sm:mt-6 sm:text-5xl">
            Join the <span className="text-yellow-400">MineNote</span> Family
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-zinc-300 sm:mt-5 sm:text-lg">
            Get new notebook launches, exclusive designs, special offers and
            creative inspiration directly in your inbox.
          </p>

          <form className="mx-auto mt-7 flex max-w-2xl flex-col gap-3 sm:mt-9 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>

            <input
              id="newsletter-email"
              type="email"
              placeholder="Enter your email address"
              className="min-h-14 w-full flex-1 rounded-full border border-white/[0.10] bg-black/60 px-5 text-sm text-white placeholder:text-zinc-600 shadow-inner shadow-black/20 outline-none transition-all duration-200 focus:border-yellow-400/60 focus:bg-black/80 focus:ring-2 focus:ring-yellow-400/10 sm:px-6"
            />

            <button
              type="submit"
              className="min-h-14 w-full rounded-full bg-yellow-400 px-8 text-sm font-bold text-black shadow-[0_8px_24px_rgba(250,204,21,0.14)] transition-all duration-200 hover:bg-yellow-300 hover:shadow-[0_10px_30px_rgba(250,204,21,0.20)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 sm:w-auto"
            >
              Subscribe <span className="ml-1">→</span>
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2.5 sm:mt-6 sm:gap-3">
            <span className="h-px w-6 bg-white/[0.08] sm:w-8" />

            <p className="text-[12px] font-medium uppercase tracking-[0.11em] text-zinc-400 sm:text-[13px] sm:tracking-[0.13em]">
              No spam · Just MineNote
            </p>

            <span className="h-px w-6 bg-white/[0.08] sm:w-8" />
          </div>
        </div>
      </div>
    </section>
  );
}
