"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-black text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 top-[-120px] h-[420px] w-[420px] rounded-full bg-yellow-400/[0.08] blur-[100px] sm:h-[520px] sm:w-[520px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-56 bottom-[-220px] h-[440px] w-[440px] rounded-full bg-yellow-500/[0.045] blur-[110px] sm:h-[500px] sm:w-[500px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
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

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-12 pt-10 sm:gap-10 sm:px-6 sm:pb-16 sm:pt-14 md:min-h-[calc(100vh-64px)] md:grid-cols-[1fr_1fr] md:gap-6 md:px-8 md:py-14 lg:gap-10 lg:px-10 lg:py-16">

        <div className="relative z-10 text-center md:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/[0.055] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.17em] text-yellow-300 sm:mb-6 sm:px-4 sm:text-[11px]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
            />
            Premium Personalized Notebooks
          </div>

          <h1 className="mx-auto max-w-3xl text-[2.8rem] font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl md:mx-0 md:text-[4.2rem] lg:text-[5rem] xl:text-[5.25rem]">
            <span className="block">Craft Ideas.</span>
            <span className="mt-2 block bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent sm:mt-3">
              Create Your Legacy.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-7 text-zinc-400 sm:mt-6 sm:text-base sm:leading-8 md:mx-0 md:text-lg">
            AuraNotes by MineNote transforms ordinary notebooks into premium
            creations designed for students, creators and dreamers who want
            every page to feel like their own.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href="/products"
              className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-yellow-400 px-7 text-sm font-extrabold text-black shadow-[0_12px_35px_rgba(250,204,21,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_16px_42px_rgba(250,204,21,0.24)] active:translate-y-0"
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
              className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.035] px-7 text-sm font-semibold text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow-400/35 hover:bg-yellow-400/[0.055] hover:text-white active:translate-y-0"
            >
              Our Story
              <span
                aria-hidden="true"
                className="text-zinc-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-yellow-400"
              >
                →
              </span>
            </Link>
          </div>

          <div className="mx-auto mt-7 grid max-w-lg grid-cols-3 divide-x divide-white/[0.09] rounded-2xl border border-white/[0.07] bg-white/[0.025] px-1.5 py-3.5 backdrop-blur-sm sm:mt-8 sm:px-2 sm:py-4 md:mx-0">
            <div className="px-2 text-center md:text-left sm:px-3">
              <p className="text-[13px] font-bold text-white sm:text-sm">Premium</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.13em] text-zinc-400 sm:text-[10px] sm:tracking-[0.14em]">
                Quality
              </p>
            </div>

            <div className="px-2 text-center md:text-left sm:px-3">
              <p className="text-[13px] font-bold text-white sm:text-sm">Personal</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.13em] text-zinc-400 sm:text-[10px] sm:tracking-[0.14em]">
                By Design
              </p>
            </div>

            <div className="px-2 text-center md:text-left sm:px-3">
              <p className="text-[13px] font-bold text-white sm:text-sm">Fast</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.13em] text-zinc-400 sm:text-[10px] sm:tracking-[0.14em]">
                Delivery
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[350px] items-center justify-center sm:min-h-[450px] md:min-h-[500px] lg:min-h-[550px]">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[245px] w-[245px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/[0.09] blur-[65px] sm:h-[360px] sm:w-[360px]"
          />

          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[245px] w-[245px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-400/[0.075] sm:h-[380px] sm:w-[380px]"
          />

          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[175px] w-[175px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.055] sm:h-[280px] sm:w-[280px]"
          />

          <div className="relative z-10 w-[72%] max-w-[400px] sm:w-[68%] md:w-[82%] lg:w-[78%]">
            <Image
              src="/images/hero-notebook.webp"
              alt="MineNote premium personalized notebook"
              width={550}
              height={700}
              priority
              className="h-auto w-full aspect-[11/14] object-contain drop-shadow-[0_25px_70px_rgba(0,0,0,0.65)] transition-transform duration-700 hover:scale-[1.035] hover:-rotate-1"
            />
          </div>

          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/[0.10] bg-zinc-950/80 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-300 shadow-xl shadow-black/30 backdrop-blur-xl sm:bottom-5 sm:px-4 sm:py-2.5 sm:text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
            Made to be yours
          </div>
        </div>
      </div>
    </section>
  );
}
