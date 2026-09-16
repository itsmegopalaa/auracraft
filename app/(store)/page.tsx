import type { Metadata } from "next";
import Link from "next/link";
import FeaturedNotebooks from "@/app/components/FeaturedNotebooks";
import NewArrivals from "@/app/components/NewArrivals";
import Image from "next/image";
import Hero from "@/app/components/Hero";
import WhyAuraCraft from "@/app/components/WhyAuraCraft";
import Footer from "@/app/components/Footer";
import BrandStory from "@/app/components/BrandStory";
import Testimonials from "@/app/components/Testimonials";
import Newsletter from "@/app/components/Newsletter";
import TrustBadges from "@/app/components/TrustBadges";

export const metadata: Metadata = {
  title: "Premium Personalized Notebooks",
  description:
    "Discover premium MineNote notebooks designed for students, creators and dreamers. Find a notebook that matches your ideas, creativity and identity.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MineNote | Premium Personalized Notebooks",
    description:
      "Premium notebooks designed for students, creators and dreamers.",
    url: "/",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--mn-bg)] text-[var(--mn-text)]">

      {/* Hero */}
      <Hero />

      {/* Featured Products */}
      <FeaturedNotebooks />

      {/* Why MineNote */}
      <WhyAuraCraft />

      {/* Notebook Showcase */}
      <section className="relative overflow-hidden border-y border-[var(--mn-border)] bg-[var(--mn-surface)]">
        <div
          className="pointer-events-none absolute -left-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[var(--mn-accent)]/[0.035] blur-3xl"
          aria-hidden="true"
        />

        <div className="mn-container-wide relative grid items-center gap-12 py-[clamp(5rem,8vw,7.5rem)] sm:py-[clamp(6rem,9vw,9rem)] md:grid-cols-[1fr_0.9fr] md:gap-12 lg:gap-20 lg:py-28 xl:py-32">

          {/* Copy */}
          <div className="mn-reading max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--mn-accent)]"
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--mn-accent)]">
                More than a notebook
              </p>
            </div>

            <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--mn-text)] sm:text-6xl lg:text-[clamp(3.5rem,5.5vw,5.5rem)]">
              Your notebook.
              <br />
              <span className="text-[var(--mn-text-secondary)]">
                Your identity.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--mn-text-secondary)] sm:mt-7 sm:text-base sm:leading-8 lg:text-lg">
              AuraNotes turns an everyday notebook into something that feels
              personal. Choose a design that reflects your personality,
              creativity, and the ideas you want to bring to life.
            </p>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--mn-text-muted)] sm:mt-8 sm:text-[11px]">
              <span>Personal</span>
              <span aria-hidden="true">•</span>
              <span>Premium</span>
              <span aria-hidden="true">•</span>
              <span>Designed for Ideas</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
              <Link
                href="/products"
                className="group relative inline-flex min-h-13 items-center justify-center gap-3 overflow-hidden rounded-xl bg-[var(--mn-accent)] px-7 text-sm font-semibold text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--mn-shadow-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] active:translate-y-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0"
                />
                <span className="relative">Explore Collection</span>
                <span
                  aria-hidden="true"
                  className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-[currentColor]/25 transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>

              <Link
                href="/custom-cover"
                className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-7 text-sm font-semibold text-[var(--mn-text)] shadow-[var(--mn-shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--mn-accent)] hover:bg-[var(--mn-accent-soft)] hover:shadow-[var(--mn-shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] active:translate-y-0"
              >
                <span>Create Your Own</span>
                <span
                  aria-hidden="true"
                  className="text-[var(--mn-accent)] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                >
                  ✦
                </span>
              </Link>
            </div>
          </div>

          {/* Product showcase */}
          <div className="relative flex min-h-[380px] items-center justify-center sm:min-h-[460px] md:min-h-[500px] lg:min-h-[560px]">

            <div
              className="absolute h-64 w-64 rounded-full bg-[var(--mn-accent)]/[0.055] blur-3xl transition-transform duration-700 group-hover:scale-110 sm:h-80 sm:w-80 lg:h-96 lg:w-96"
              aria-hidden="true"
            />

            <div className="group relative max-w-[88%] border border-[var(--mn-border-strong)] bg-[var(--mn-bg)] p-4 shadow-[var(--mn-shadow-lg)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--mn-shadow-image)] sm:max-w-none sm:p-7">
              <div
                className="absolute inset-3 border border-[var(--mn-border)]"
                aria-hidden="true"
              />

              <Image
                src="/images/notebook.png"
                alt="AuraNotes Premium Notebook"
                width={450}
                height={600}
                className="relative z-10 h-auto max-h-[370px] w-auto max-w-full object-contain drop-shadow-[var(--mn-shadow-hero)] transition-transform duration-700 group-hover:scale-[1.025] sm:max-h-[480px] lg:max-h-[530px]"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-transparent via-white/[0.025] to-white/[0.06] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            </div>

            <div className="absolute bottom-1 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--mn-text-secondary)] shadow-[var(--mn-shadow-sm)] transition-transform duration-300 hover:-translate-y-0.5 sm:bottom-5 sm:px-5 sm:tracking-[0.22em]">
              Crafted for your journey
            </div>
          </div>

        </div>
      </section>

      {/* New Arrivals */}
      <NewArrivals />

      {/* Brand Story */}
      <BrandStory />

      {/* Trust */}
      <TrustBadges />

      {/* Testimonials */}
      <Testimonials />

      {/* Newsletter */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </main>
  );
}
