"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";

export type GalleryItem = {
  id: string;
  category: "rooms" | "views";
  src: string;
  caption: string;
  span?: "wide" | "tall" | "normal";
};

const categories = [
  { key: "all", label: "All" },
  { key: "rooms", label: "Rooms" },
  { key: "views", label: "Mountain Views" },
] as const;

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<(typeof categories)[number]["key"]>("all");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setFilter(c.key)}
            className={`label-caps shrink-0 px-4 py-2.5 transition-colors ${
              filter === c.key ? "bg-charcoal text-stone" : "bg-petrol-50 text-ink-soft hover:bg-petrol-100"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {visible.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLightbox(item)}
            className={`group relative overflow-hidden bg-petrol-100 ${
              item.span === "wide"
                ? "col-span-2 aspect-[16/9]"
                : item.span === "tall"
                  ? "aspect-square md:row-span-2 md:aspect-[3/4]"
                  : "aspect-square"
            }`}
          >
            <Image
              src={item.src}
              alt={item.caption}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100" />
            <span className="label-caps absolute bottom-3 left-3 text-stone opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
              {item.caption}
            </span>
          </button>
        ))}
      </div>

      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-charcoal/95 p-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-opacity sm:p-6 ${
          lightbox ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setLightbox(null)}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => setLightbox(null)}
          className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex min-h-11 min-w-11 items-center justify-center text-stone hover:text-petrol-300 sm:right-6"
        >
          <Icon name="close" className="text-3xl" />
        </button>
        {lightbox && (
          <>
            <div
              className="relative max-h-[70vh] w-full max-w-4xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.src}
                alt={lightbox.caption}
                width={1200}
                height={800}
                className="h-auto max-h-[70vh] w-full object-contain"
              />
            </div>
            <span className="px-2 text-center font-display text-base font-normal text-stone sm:text-lg">
              {lightbox.caption}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
