"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {rooms.map((room, i) => (
          <div key={room.id} className="group flex flex-col bg-stone-dark/40 transition hover:shadow-lg">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-petrol-100">
              <Image
                src={room.images[0] || stockRoomImage(i)}
                alt={room.name}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
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
              <button
                type="button"
                onClick={() => setActive(room)}
                className="label-caps mt-6 flex min-h-11 items-center justify-center gap-2 bg-charcoal px-4 py-3 text-stone transition hover:bg-charcoal-light"
              >
                Explore Suite
                <Icon name="arrow_forward" className="text-sm" />
              </button>
            </div>
          </div>
        ))}
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
