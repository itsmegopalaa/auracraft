"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#facc1530,transparent_60%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col-reverse items-center gap-16 px-6 py-20 md:flex-row">

        {/* Left Side */}
        <div className="flex-1 text-center md:text-left">

          <p className="mb-4 inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300">
            ✨ Premium Personalized Notebooks
          </p>

          <h1 className="text-5xl font-extrabold leading-tight md:text-7xl">
            Craft Ideas.
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Create Your Legacy.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-gray-400">
            AuraNotes by AuraCraft transforms ordinary notebooks into premium
            creations designed for students, creators and dreamers who want
            every page to inspire their next big idea.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">

            <Link
              href="/products"
              className="rounded-full bg-yellow-400 px-8 py-4 text-center font-bold text-black transition duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/30"
            >
              Shop Collection →
            </Link>

            <button className="rounded-full border border-zinc-700 px-8 py-4 transition duration-300 hover:border-yellow-400 hover:bg-yellow-400/10">
              Our Story
            </button>

          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-gray-400 md:justify-start">

            <span>⭐ 4.9/5 Rating</span>

            <span className="h-2 w-2 rounded-full bg-yellow-400" />

            <span>Premium Quality</span>

            <span className="h-2 w-2 rounded-full bg-yellow-400" />

            <span>Fast Delivery</span>

          </div>

        </div>

        {/* Right Side */}

        <div className="flex flex-1 justify-center">

          <Image
            src="/images/hero-notebook.webp"
            alt="AuraNotes Premium Notebook"
            width={550}
            height={700}
            priority
            className="drop-shadow-[0_0_60px_rgba(250,204,21,0.25)] transition duration-500 hover:scale-105"
          />

        </div>

      </div>

    </section>
  );
}