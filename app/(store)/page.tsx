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

        <div className="mn-container-wide relative grid items-center gap-12 py-[clamp(4rem,7vw,6rem)] sm:py-[clamp(5rem,8vw,7.5rem)] md:grid-cols-[1fr_0.9fr] md:gap-12 lg:gap-20 lg:py-28 xl:py-32">

          {/* Copy */}
          <div className="mn-reading max-w-2xl">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--mn-accent)]">
              More than a notebook
            </p>

            <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--mn-text)] sm:mn-display">
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

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--mn-text-muted)] sm:mt-8">
              <span>Personal</span>
              <span aria-hidden="true">•</span>
              <span>Premium</span>
              <span aria-hidden="true">•</span>
              <span>Designed for Ideas</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
              <Link
                href="/products"
                className="mn-transition inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--mn-accent)] px-7 py-3.5 text-sm font-semibold text-[var(--mn-accent-contrast)] shadow-[var(--mn-shadow-sm)] hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] active:translate-y-0"
              >
                Explore Collection
                <span className="ml-2" aria-hidden="true">
                  →
                </span>
              </Link>

              <Link
                href="/custom-cover"
                className="mn-transition inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[var(--mn-border-strong)] bg-transparent px-6 py-3.5 text-sm font-semibold text-[var(--mn-text)] hover:-translate-y-0.5 hover:border-[var(--mn-text)] hover:bg-[var(--mn-bg)] active:translate-y-0"
              >
                Create Your Own
                <span aria-hidden="true">✨</span>
              </Link>
            </div>
          </div>

          {/* Product showcase */}
          <div className="relative flex min-h-[360px] items-center justify-center sm:min-h-[440px] md:min-h-[500px] lg:min-h-[560px]">

            <div
              className="absolute h-64 w-64 rounded-full bg-[var(--mn-accent)]/[0.055] blur-3xl sm:h-80 sm:w-80 lg:h-96 lg:w-96"
              aria-hidden="true"
            />

            <div className="relative max-w-[88%] border border-[var(--mn-border)] bg-[var(--mn-bg)] p-[var(--mn-space-card)] shadow-[var(--mn-shadow-lg)] sm:max-w-none sm:p-7">
              <div
                className="absolute inset-3 border border-[var(--mn-border)]"
                aria-hidden="true"
              />

              <Image
                src="/images/notebook.png"
                alt="AuraNotes Premium Notebook"
                width={450}
                height={600}
                className="relative z-10 h-auto max-h-[360px] w-auto max-w-full object-contain drop-shadow-[var(--mn-shadow-hero)] transition-transform duration-500 hover:scale-[1.02] sm:max-h-[470px] lg:max-h-[520px]"
              />
            </div>

            <div className="absolute bottom-1 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap border border-[var(--mn-border)] bg-[var(--mn-surface)] px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--mn-text-secondary)] shadow-[var(--mn-shadow-sm)] sm:bottom-5 sm:px-4 sm:tracking-[0.22em]">
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
