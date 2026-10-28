"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Room } from "@/lib/types";
import { formatInr } from "@/lib/format";
import Icon from "@/components/ui/Icon";
import { stockRoomImage } from "@/lib/stockImages";

export default function RoomShowcase({
  rooms,
  whatsappNumber,
}: {
  rooms: Room[];
  whatsappNumber: string;
}) {
  const [active, setActive] = useState<Room | null>(null);
  const activeIndex = active ? rooms.findIndex((r) => r.id === active.id) : -1;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  // Cards stack vertically on phones; from sm up they form a horizontal
  // snap-scroll strip whose edge arrows only appear when that side can scroll.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function update() {
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    }
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [rooms.length]);

  function scrollBy(dir: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex flex-col gap-8 sm:flex-row sm:snap-x sm:snap-mandatory sm:gap-6 sm:overflow-x-auto sm:pb-2 sm:[-ms-overflow-style:none] sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden"
        >
          {rooms.map((room, i) => (
            <div
              key={room.id}
              className="group flex w-full shrink-0 flex-col bg-stone-dark/40 transition hover:shadow-lg sm:w-[46%] sm:snap-start lg:w-[calc(33.333%-1rem)]"
            >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-petrol-100">
              <Image
                src={room.images[0] || stockRoomImage(i)}
                alt={room.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 46vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="label-caps absolute left-0 top-0 bg-charcoal/85 px-3 py-1.5 text-stone backdrop-blur-sm">
                {room.size_sqft > 0 ? `${room.size_sqft} sq ft` : `Up to ${room.max_guests} guests`}
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
              <div>
                <span className="label-caps text-petrol-500">
                  {formatInr(room.price_per_night)} / night
                </span>
                <h3 className="mt-2 font-display text-xl font-medium text-ink">{room.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm font-light leading-relaxed text-ink/70">
                  {room.summary}
                </p>
              </div>
              {/* Phones go straight to the room page; desktop gets the quick view */}
              <Link
                href={`/rooms/${room.slug}`}
                className="label-caps mt-6 flex min-h-11 items-center justify-center gap-2 bg-charcoal px-4 py-3 text-stone transition hover:bg-charcoal-light md:hidden"
              >
                Explore Room
                <Icon name="arrow_forward" className="text-sm" />
              </Link>
              <button
                type="button"
                onClick={() => setActive(room)}
                className="label-caps mt-6 hidden min-h-11 items-center justify-center gap-2 bg-charcoal px-4 py-3 text-stone transition hover:bg-charcoal-light md:flex"
              >
                Explore Room
                <Icon name="arrow_forward" className="text-sm" />
              </button>
            </div>
          </div>
        ))}
        </div>

        {/* Edge-centred scroll buttons — visible from sm up when the strip
            can actually scroll that way */}
        {rooms.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Scroll rooms left"
              onClick={() => scrollBy(-1)}
              className={`absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-lg transition hover:bg-white sm:flex ${
                canScrollLeft ? "" : "invisible"
              }`}
            >
              <Icon name="chevron_left" className="text-xl" />
            </button>
            <button
              type="button"
              aria-label="Scroll rooms right"
              onClick={() => scrollBy(1)}
              className={`absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-lg transition hover:bg-white sm:flex ${
                canScrollRight ? "" : "invisible"
              }`}
            >
              <Icon name="chevron_right" className="text-xl" />
            </button>
          </>
        )}
      </div>

      {/* Slide-over quick view */}
      <div
        className={`fixed inset-0 z-50 flex justify-end bg-charcoal/60 backdrop-blur-sm transition-opacity ${
          active ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setActive(null)}
      >
        <div
          className="flex h-full w-full max-w-xl flex-col justify-between overflow-y-auto bg-stone p-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] shadow-2xl sm:p-8 lg:p-12"
          onClick={(e) => e.stopPropagation()}
        >
          {active && (
            <>
              <div>
                <div className="flex items-center justify-between border-b border-line pb-6">
                  <span className="label-caps text-petrol-500">Suite Specifications</span>
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    aria-label="Close"
                    className="inline-flex min-h-11 min-w-11 items-center justify-center text-ink hover:text-petrol-600"
                  >
                    <Icon name="close" className="text-2xl" />
                  </button>
                </div>

                <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden bg-petrol-100">
                  <Image
                    src={active.images[0] || stockRoomImage(Math.max(activeIndex, 0))}
                    alt={active.name}
                    fill
                    sizes="576px"
                    className="object-cover"
                  />
                </div>

                <h3 className="mt-6 font-display text-2xl font-medium text-ink">{active.name}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-ink/70">{active.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-4 bg-petrol-50 p-4">
                  <div>
                    <span className="label-caps block text-ink-soft/60">Floor Area</span>
                    <span className="font-display text-lg text-ink">
                      {active.size_sqft > 0 ? `${active.size_sqft} sq ft` : "On request"}
                    </span>
                  </div>
                  <div>
                    <span className="label-caps block text-ink-soft/60">Bed Configuration</span>
                    <span className="font-display text-lg text-ink">{active.bed_type || "On request"}</span>
                  </div>
                </div>

                {active.amenities.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="label-caps text-ink">Amenities</h4>
                    <ul className="grid grid-cols-1 gap-2 text-sm font-light text-ink/80 sm:grid-cols-2">
                      {active.amenities.map((a) => (
                        <li key={a} className="flex items-center gap-2">
                          <Icon name="check" className="text-sm text-petrol-500" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-3 border-t border-line pt-6">
                <span className="font-display text-lg text-petrol-600">
                  {formatInr(active.price_per_night)}{" "}
                  <span className="label-caps text-ink/50">/ night</span>
                </span>
                <Link
                  href={`/rooms/${active.slug}`}
                  className="label-caps flex w-full items-center justify-center bg-charcoal px-6 py-4 text-stone transition hover:bg-charcoal-light"
                >
                  View Full Details &amp; Book
                </Link>
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hi, I'd like to enquire about the ${active.name} at Mapple View Resort.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label-caps flex w-full items-center justify-center gap-2 border border-ink/20 px-6 py-4 text-ink transition hover:bg-petrol-50"
                  >
                    <Icon name="chat" className="text-base" />
                    Enquire via WhatsApp
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
