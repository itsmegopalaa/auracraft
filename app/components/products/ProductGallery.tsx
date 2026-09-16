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
      <div className="group relative overflow-hidden rounded-[2rem] border border-[var(--mn-border)] bg-[var(--mn-surface)] shadow-[var(--mn-shadow-lg)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--mn-product-glow),transparent_55%)]"
          aria-hidden="true"
        />

        <div className="relative flex min-h-[360px] items-center justify-center p-4 sm:min-h-[500px] sm:p-8 lg:min-h-[560px] lg:p-10">
          <Image
            src={activeImage}
            alt={name}
            width={700}
            height={900}
            priority
            className="relative z-10 h-auto max-h-[400px] w-auto max-w-[88%] object-contain drop-shadow-[var(--mn-shadow-gallery)] transition-transform duration-500 group-hover:scale-[1.02] sm:max-h-[480px] sm:max-w-full lg:max-h-[520px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mn-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mn-bg)]"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-x-6 bottom-5 h-px bg-gradient-to-r from-transparent via-[var(--mn-accent)]/20 to-transparent"
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
                    ? "border-[var(--mn-accent)] shadow-[var(--mn-shadow-sm)]"
                    : "border-[var(--mn-border)] opacity-60 hover:border-[var(--mn-accent)] hover:opacity-100"
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
