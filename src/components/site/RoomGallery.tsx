"use client";

import { useState } from "react";
import Image from "next/image";

export default function RoomGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-petrol-100">
        <div
          key={active}
          className="absolute inset-0 motion-safe:animate-[fade-in_0.4s_ease-out]"
        >
          <Image
            src={images[active]}
            alt={name}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${name}`}
              aria-pressed={i === active}
              className={`relative aspect-square overflow-hidden rounded-lg bg-petrol-100 transition ${
                i === active
                  ? "ring-2 ring-petrol-500 ring-offset-2 ring-offset-stone"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${name} photo ${i + 1}`}
                fill
                sizes="150px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
