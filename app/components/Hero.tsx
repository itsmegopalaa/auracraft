"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-black text-white">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 top-[-120px] h-[520px] w-[520px] rounded-full bg-yellow-400/[0.08] blur-[110px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-56 bottom-[-220px] h-[500px] w-[500px] rounded-full bg-yellow-500/[0.045] blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-14 sm:pb-20 sm:pt-16 md:min-h-[calc(100vh-64px)] md:grid-cols-[1fr_1fr] md:gap-4 md:px-8 md:py-16 lg:px-10 lg:py-20">

        {/* LEFT — BRAND MESSAGE */}
        <div className="relative z-10 text-center md:text-left">

          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/[0.055] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-300 shadow-[0_8px_30px_rgba(250,204,21,0.06)]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
            />
            Premium Personalized Notebooks
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-3xl text-[3.15rem] font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl md:mx-0 md:text-7xl lg:text-[5.15rem]">
            <span className="block">Craft Ideas.</span>

            <span className="mt-3 block bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Create Your Legacy.
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-zinc-400 sm:text-base sm:leading-8 md:mx-0 md:text-lg">
            AuraNotes by MineNote transforms ordinary notebooks into
            premium creations designed for students, creators and dreamers
            who want every page to feel like their own.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">

            <Link
              href="/products"
              className="group inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full bg-yellow-400 px-7 text-sm font-extrabold text-black shadow-[0_12px_35px_rgba(250,204,21,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_16px_42px_rgba(250,204,21,0.24)] active:translate-y-0"
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
              href="/about"
              className="group inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.035] px-7 text-sm font-semibold text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow-400/35 hover:bg-yellow-400/[0.055] hover:text-white active:translate-y-0"
            >
              Our Story
              <span
                aria-hidden="true"
                className="text-zinc-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-yellow-400"
              >
                →
              </span>
            </Link>

          </div>

          {/* Trust indicators */}
          <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 divide-x divide-white/[0.09] rounded-2xl border border-white/[0.07] bg-white/[0.025] px-2 py-4 backdrop-blur-sm md:mx-0">

            <div className="px-3 text-center md:text-left">
              <p className="text-sm font-bold text-white">Premium</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                Quality
              </p>
            </div>

            <div className="px-3 text-center md:text-left">
              <p className="text-sm font-bold text-white">Personal</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                By Design
              </p>
            </div>

            <div className="px-3 text-center md:text-left">
              <p className="text-sm font-bold text-white">Fast</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                Delivery
              </p>
            </div>

          </div>

        </div>

        {/* RIGHT — PRODUCT */}
        <div className="relative flex min-h-[390px] items-center justify-center sm:min-h-[500px] md:min-h-[560px]">

          {/* Product halo */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/[0.09] blur-[70px] sm:h-[380px] sm:w-[380px]"
          />

          {/* Decorative ring */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-400/[0.075] sm:h-[390px] sm:w-[390px]"
          />

          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[205px] w-[205px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.055] sm:h-[290px] sm:w-[290px]"
          />

          {/* Product image */}
          <div className="relative z-10 w-[74%] max-w-[440px] sm:w-[70%] md:w-[84%] lg:w-[80%]">
            <Image
              src="/images/hero-notebook.webp"
              alt="MineNote premium personalized notebook"
              width={550}
              height={700}
              priority
              className="h-auto w-full drop-shadow-[0_25px_70px_rgba(0,0,0,0.65)] transition-transform duration-700 hover:scale-[1.035] hover:-rotate-1"
            />
          </div>

          {/* Floating product label */}
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/[0.10] bg-zinc-950/80 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-300 shadow-xl shadow-black/30 backdrop-blur-xl sm:bottom-7">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
            Made to be yours
          </div>

        </div>

      </div>
    </section>
  );
}
