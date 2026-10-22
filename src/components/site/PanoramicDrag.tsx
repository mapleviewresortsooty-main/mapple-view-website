"use client";

import { useState } from "react";
import Image from "next/image";
import { stockImages } from "@/lib/stockImages";

export default function PanoramicDrag() {
  const [pan, setPan] = useState(0);

  return (
    <div className="relative h-[320px] w-full overflow-hidden bg-charcoal shadow-2xl sm:h-[420px] lg:h-[550px]">
      <div
        className="absolute inset-0 h-full w-[170%] transition-[left] duration-100"
        style={{ left: `-${pan}%` }}
      >
        <Image
          src={stockImages.panoramic}
          alt="Panoramic view of the Nilgiri hills"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:p-6">
        <div className="text-stone">
          <span className="label-caps block text-petrol-300">The Nilgiris</span>
          <h4 className="font-display text-xl font-normal sm:text-2xl">
            Some views don&apos;t need a filter.
          </h4>
        </div>

        <div className="flex w-full items-center gap-3 bg-stone/90 px-4 py-3 backdrop-blur-md sm:w-auto">
          <span className="label-caps shrink-0 text-ink">Pan Horizon</span>
          <input
            type="range"
            min={0}
            max={70}
            value={pan}
            onChange={(e) => setPan(Number(e.target.value))}
            className="min-h-11 w-full cursor-pointer accent-charcoal sm:w-32"
            aria-label="Pan across the panoramic view"
          />
        </div>
      </div>
    </div>
  );
}
