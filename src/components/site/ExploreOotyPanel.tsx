"use client";

import { useState } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { attractions } from "@/lib/ooty";

export default function ExploreOotyPanel({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const current = attractions[active];
  const image = images[active] ?? current.image;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-2 lg:col-span-5">
        {attractions.map((a, i) => {
          const isActive = i === active;
          return (
            <button
              key={a.title}
              type="button"
              onClick={() => setActive(i)}
              className={`flex items-center gap-4 border-l-2 px-4 py-3 text-left transition-colors ${
                isActive
                  ? "border-petrol-300 bg-stone text-ink"
                  : "border-transparent text-stone/80 hover:bg-stone/10 hover:text-stone"
              }`}
            >
              <Icon
                name={a.icon}
                className={`text-xl ${isActive ? "text-petrol-500" : "text-petrol-300"}`}
              />
              <span className="font-display text-base font-medium">{a.title}</span>
            </button>
          );
        })}
      </div>
      <div className="relative min-h-[320px] overflow-hidden border border-stone/15 bg-charcoal-light sm:min-h-[400px] lg:col-span-7">
        <div
          key={active}
          className="absolute inset-0 motion-safe:animate-[fade-in_0.6s_ease-out]"
        >
          <Image
            src={image}
            alt={current.title}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/35 to-transparent" />
        <div className="relative flex h-full min-h-[320px] flex-col justify-end p-6 sm:min-h-[400px] sm:p-8 lg:p-10">
          <span className="label-caps text-petrol-300">{current.proximity}</span>
          <h3 className="mt-3 font-display text-2xl font-normal text-stone sm:text-3xl">
            {current.title}
          </h3>
          <p className="mt-3 max-w-lg text-sm font-normal leading-relaxed text-stone/85">
            {current.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
