"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  image: string;
  name: string;
};

export default function ProductGallery({
  image,
  name,
}: Props) {
  const [activeImage, setActiveImage] = useState(image);

  const images = [image];

  return (
    <div className="space-y-5">
      {/* Main product showcase */}
      <div className="group relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-zinc-950 shadow-2xl shadow-black/30">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.07),transparent_55%)]"
          aria-hidden="true"
        />

        <div className="relative flex min-h-[360px] items-center justify-center p-4 sm:min-h-[500px] sm:p-8 lg:min-h-[560px] lg:p-10">
          <Image
            src={activeImage}
            alt={name}
            width={700}
            height={900}
            priority
            className="relative z-10 h-auto max-h-[400px] w-auto max-w-[88%] object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-[1.02] sm:max-h-[480px] sm:max-w-full lg:max-h-[520px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-x-6 bottom-5 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Gallery thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img) => {
            const isActive = activeImage === img;

            return (
              <button
                key={img}
                type="button"
                onClick={() => setActiveImage(img)}
                aria-label={`View ${name}`}
                aria-pressed={isActive}
                className={`shrink-0 overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? "border-yellow-400 shadow-lg shadow-yellow-400/10"
                    : "border-white/[0.08] opacity-60 hover:border-yellow-400/40 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  width={100}
                  height={120}
                  className="h-20 w-16 object-cover sm:h-24 sm:w-20"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
