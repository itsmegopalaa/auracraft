"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-[var(--mn-border)] bg-[var(--mn-bg)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[var(--mn-accent-soft)] blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-[var(--mn-accent-soft)] blur-[110px]"
      />

      <div className="mn-container-wide relative grid min-h-[calc(100svh-64px)] items-center gap-12 py-10 sm:py-14 md:grid-cols-[0.92fr_1.08fr] md:gap-8 md:py-16 lg:min-h-[calc(100vh-76px)] lg:gap-14 lg:py-20">
        <div className="relative z-10 text-center md:text-left">
          <div className="mb-6 inline-flex items-center gap-2 border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--mn-text-secondary)] shadow-[var(--mn-shadow-sm)]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[var(--mn-accent)]"
            />
            Premium personalized notebooks
          </div>

          <h1 className="mx-auto max-w-3xl text-[3.15rem] font-semibold leading-[0.94] tracking-[-0.065em] text-[var(--mn-text)] sm:text-6xl md:mx-0 md:text-[4.5rem] lg:text-[5.35rem] xl:text-[5.8rem]">
            Your ideas
            <span className="block text-[var(--mn-text-muted)]">
              deserve a place
            </span>
            <span className="mt-2 block text-[var(--mn-accent)]">
              that feels yours.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[15px] leading-7 text-[var(--mn-text-secondary)] sm:text-base sm:leading-8 md:mx-0 md:text-lg">
            Thoughtfully designed notebooks for ideas, stories, plans and
            everything you want to make your own.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href="/products"
              className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-xl bg-[var(--mn-accent)] px-7 text-sm font-semibold text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)]"
            >
              Shop Collection
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>

            <Link
              href="/custom-cover"
              className="inline-flex min-h-13 items-center justify-center gap-3 rounded-xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-7 text-sm font-semibold text-[var(--mn-text)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--mn-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)]"
            >
              Create Your Own
              <span aria-hidden="true">✦</span>
            </Link>

            <Link
              href="/about"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-[var(--mn-text-secondary)] transition-colors hover:text-[var(--mn-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)]"
            >
              Our Story
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-9 grid max-w-xl grid-cols-3 border-y border-[var(--mn-border)] py-4">
            <div className="px-3 text-center md:text-left">
              <p className="text-sm font-semibold text-[var(--mn-text)]">
                Premium
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--mn-text-muted)]">
                Quality
              </p>
            </div>

            <div className="border-x border-[var(--mn-border)] px-3 text-center md:text-left">
              <p className="text-sm font-semibold text-[var(--mn-text)]">
                Personal
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--mn-text-muted)]">
                By design
              </p>
            </div>

            <div className="px-3 text-center md:text-left">
              <p className="text-sm font-semibold text-[var(--mn-text)]">
                Made in India
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--mn-text-muted)]">
                With care
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[360px] items-center justify-center sm:min-h-[460px] md:min-h-[520px] lg:min-h-[600px]">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--mn-border)] sm:h-[390px] sm:w-[390px]"
          />

          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[215px] w-[215px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--mn-accent-soft)] blur-3xl sm:h-[310px] sm:w-[310px]"
          />

          <div className="relative z-10 w-[76%] max-w-[440px] sm:w-[68%] md:w-[82%] lg:w-[78%]">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 border border-[var(--mn-border)] sm:-inset-6"
              />

              <Image
                src="/images/hero-notebook.webp"
                alt="MineNote premium personalized notebook"
                width={550}
                height={700}
                priority
                className="relative h-auto w-full object-contain drop-shadow-[var(--mn-shadow-image)] transition-transform duration-700 hover:scale-[1.025] hover:-rotate-1"
              />
            </div>
          </div>

          <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap border border-[var(--mn-border)] bg-[var(--mn-surface)] px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--mn-text-secondary)] shadow-[var(--mn-shadow-sm)] sm:bottom-5 sm:px-4 sm:py-2.5">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[var(--mn-accent)]"
            />
            Made to be yours
          </div>
        </div>
      </div>
    </section>
  );
}
