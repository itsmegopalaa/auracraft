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
    <main className="min-h-screen bg-black text-white">

      {/* Navbar */}

      {/* Hero */}
      <Hero />


      {/* Featured Products */}
      <FeaturedNotebooks />

      {/* Why AuraCraft */}
      <WhyAuraCraft />

      {/* Notebook Showcase */}
      <section className="relative overflow-hidden border-y border-white/[0.06]">
        <div
          className="pointer-events-none absolute -left-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-yellow-400/[0.035] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-6 sm:py-24 md:grid-cols-[1.05fr_0.95fr] md:gap-12 lg:gap-16 lg:py-28 xl:py-32">

          {/* Copy */}
          <div className="max-w-2xl">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-400/80">
              More than a notebook
            </p>

            <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Your Notebook.
              <br />
              <span className="text-yellow-400">Your Identity.</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:mt-7 sm:text-lg sm:leading-8">
              AuraNotes turns an everyday notebook into something that feels
              personal. Choose a design that reflects your personality,
              creativity, and the ideas you want to bring to life.
            </p>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:mt-8 sm:gap-x-6 sm:text-[11px] sm:tracking-[0.18em]">
              <span>Personal</span>
              <span className="text-yellow-400/60">•</span>
              <span>Premium</span>
              <span className="text-yellow-400/60">•</span>
              <span>Made for Ideas</span>
            </div>

            <Link
              href="/products"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-yellow-400 px-7 py-3.5 text-sm font-bold sm:mt-10 text-black shadow-[0_10px_30px_rgba(250,204,21,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_14px_36px_rgba(250,204,21,0.2)] active:scale-[0.98]"
            >
              Explore Collection
              <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Product showcase */}
          <div className="relative flex min-h-[340px] items-center justify-center sm:min-h-[450px] md:min-h-[500px]">

            <div
              className="absolute h-72 w-72 rounded-full bg-yellow-400/[0.06] blur-3xl sm:h-96 sm:w-96"
              aria-hidden="true"
            />

            <div className="relative max-w-[88%] rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:max-w-none sm:rounded-[2rem] sm:p-7">
              <div className="absolute inset-3 rounded-[1.5rem] border border-yellow-400/[0.08]" aria-hidden="true" />

              <Image
                src="/images/notebook.png"
                alt="AuraNotes Premium Notebook"
                width={450}
                height={600}
                className="relative z-10 h-auto max-h-[380px] w-auto max-w-full object-contain sm:max-h-[500px] drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-[1.025]"
              />
            </div>

            <div className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/[0.10] bg-black/70 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.18em] sm:px-4 sm:tracking-[0.22em] text-zinc-300 shadow-xl backdrop-blur-md sm:bottom-7">
              Crafted for your journey
            </div>
          </div>

        </div>
      </section>

      {/* New Arrivals */}
      <NewArrivals />
<BrandStory />

<TrustBadges />

<Testimonials />

<Newsletter />


      {/* Footer */}
      <Footer />

    </main>
  );
}