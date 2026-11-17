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
        {/* All photos stay mounted so thumbnail switches are instant —
            only the first preloads; the rest fetch with the page. */}
        {images.map((img, i) => (
          <Image
            key={`${img}-${i}`}
            src={img}
            alt={i === active ? name : ""}
            aria-hidden={i !== active}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className={`object-cover transition-opacity duration-300 motion-reduce:transition-none ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
            priority={i === 0}
          />
        ))}
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
