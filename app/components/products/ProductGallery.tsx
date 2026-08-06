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

  const images = [
    image,
  ];

  return (
    <div className="space-y-5">

      {/* Main Image */}
      <div className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900
      ">
        <Image
          src={activeImage}
          alt={name}
          width={700}
          height={900}
          className="
            h-[500px]
            w-full
            object-cover
            transition
            duration-500
            hover:scale-105
          "
        />
      </div>


      {/* Thumbnails */}
      <div className="flex gap-4">

        {images.map((img) => (

          <button
            key={img}
            onClick={() => setActiveImage(img)}
            className="
              overflow-hidden
              rounded-xl
              border
              border-yellow-400
            "
          >

            <Image
              src={img}
              alt={name}
              width={100}
              height={120}
              className="h-24 w-20 object-cover"
            />

          </button>

        ))}

      </div>


    </div>
  );
}