"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { stockImages } from "@/lib/stockImages";

const personas = [
  {
    label: "01 / Retreat",
    title: "Quiet Escape",
    tag: "Unplugged stillness",
    badge: "Restorative Retreat",
    heading: "Time to switch off completely",
    body: "For anyone who just needs distance from notifications and noise. Slow mornings, long walks, and a room with a view — the Nilgiri stillness does most of the work.",
    image: stockImages.personaReading,
  },
  {
    label: "02 / Romance",
    title: "Couple's Getaway",
    tag: "Slow mornings together",
    badge: "Shared Escape",
    heading: "A little more time together",
    body: "Misty mornings and quiet evenings, away from the usual routine. A simple, comfortable base for a couple who just want some unhurried time in the hills.",
    image: stockImages.escapeSquare,
  },
  {
    label: "03 / Together",
    title: "Family Holiday",
    tag: "Room to breathe",
    badge: "Family Sanctuary",
    heading: "Room to breathe, places to explore",
    body: "Space to relax at the resort and plenty within reach outside it — lakes, gardens, and the hill air itself. An easy base for a family trip to Ooty.",
    image: stockImages.rooms[2],
  },
  {
    label: "04 / Discovery",
    title: "Nilgiri Explorer",
    tag: "Toy train & summit hikes",
    badge: "Active Escape",
    heading: "Base camp for the Nilgiris",
    body: "For guests planning to see as much of the hills as possible — the mountain railway, Doddabetta, the tea estates. Come back each evening to rest and go again the next day.",
    image: stockImages.panoramic,
  },
];

export default function ChooseYourEscape() {
  const [active, setActive] = useState(0);
  const current = personas[active];

  return (
    <div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
        {personas.map((p, i) => (
          <button
            key={p.title}
            type="button"
            onClick={() => setActive(i)}
            className={`min-w-[70%] shrink-0 snap-start border-b-2 p-4 text-left transition-all sm:min-w-[45%] lg:min-w-0 lg:p-5 ${
              i === active
                ? "border-charcoal bg-petrol-50"
                : "border-transparent bg-white hover:bg-petrol-50/60"
            }`}
          >
            <span className="label-caps block text-petrol-500">{p.label}</span>
            <h4 className="mt-1 font-display text-base font-medium text-ink sm:text-lg">{p.title}</h4>
            <p className="mt-1 line-clamp-1 hidden text-sm font-light text-ink-soft/70 sm:block">
              {p.tag}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-4 bg-petrol-50 p-4 sm:p-6 lg:p-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="relative h-[220px] overflow-hidden sm:h-[280px] lg:col-span-6">
            <Image src={current.image} alt={current.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="space-y-4 lg:col-span-6">
            <span className="label-caps text-petrol-500">{current.badge}</span>
            <h3 className="font-display text-2xl font-normal text-ink">{current.heading}</h3>
            <p className="text-sm font-light leading-relaxed text-ink/70">{current.body}</p>
            <Link
              href="/rooms"
              className="label-caps inline-flex items-center gap-2 bg-charcoal px-6 py-3 text-stone transition hover:bg-charcoal-light"
            >
              Explore Rooms for This Escape
              <Icon name="north_east" className="text-sm" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
