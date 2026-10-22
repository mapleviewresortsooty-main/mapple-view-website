"use client";

import { useState } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { stockImages } from "@/lib/stockImages";

const moments = [
  {
    time: "06:30 AM",
    label: "First Light",
    title: "Mist Over the Nilgiris",
    desc: "The world wakes gently at over 2,200 metres. Cloud drifts through the valley below as the first light reaches the hills. Step onto your verandah wrapped against the cold for a quiet look at the morning.",
  },
  {
    time: "08:00 AM",
    label: "Morning",
    title: "A Slow Breakfast",
    desc: "No rush to be anywhere. Mornings here are unhurried, with the cool mountain air still lingering outside the window.",
  },
  {
    time: "11:00 AM",
    label: "Midday",
    title: "Out Into Ooty",
    desc: "Lakes, gardens, tea estates, and the old mountain railway are all within reach. Come and go as you please through the day.",
  },
  {
    time: "03:30 PM",
    label: "Afternoon",
    title: "Tea Among the Hills",
    desc: "The Nilgiris are tea country. An afternoon spent slowly, with a hot cup and a view, is very much in keeping with the place.",
  },
  {
    time: "06:30 PM",
    label: "Golden Hour",
    title: "Return to the Resort",
    desc: "Evenings cool quickly at this elevation. As the light turns gold over the ridgeline, it's a good time to head back and settle in.",
  },
  {
    time: "09:00 PM",
    label: "Night",
    title: "Warm Lights, Quiet Evenings",
    desc: "Little to do after dark except enjoy the stillness — a warm room, a hot drink, and the kind of quiet that's hard to find outside the hills.",
  },
];

export default function WakeUpHereTimeline() {
  const [active, setActive] = useState(0);
  const current = moments[active];
  const image = stockImages.timeline[active % stockImages.timeline.length];

  return (
    <div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto border-b border-line px-4 pb-4 sm:mx-0 sm:px-0">
        {moments.map((m, i) => (
          <button
            key={m.time}
            type="button"
            onClick={() => setActive(i)}
            className={`label-caps snap-start whitespace-nowrap px-4 py-3 transition-all ${
              i === active ? "bg-charcoal text-stone" : "bg-petrol-50 text-ink-soft hover:bg-petrol-100"
            }`}
          >
            {m.time} &middot; {m.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 items-center gap-8 bg-white p-4 sm:p-6 lg:grid-cols-12 lg:p-10">
        <div className="relative h-[240px] overflow-hidden sm:h-[320px] lg:col-span-7 lg:h-[420px]">
          <Image src={image} alt={current.title} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <div className="label-caps inline-flex items-center gap-2 bg-petrol-50 px-3 py-1.5 text-ink">
            <Icon name="schedule" className="text-base text-petrol-500" />
            {current.time} &middot; {current.label}
          </div>
          <h3 className="font-display text-2xl font-normal leading-tight text-ink lg:text-3xl">
            {current.title}
          </h3>
          <p className="text-sm font-light leading-relaxed text-ink/70">{current.desc}</p>
        </div>
      </div>
    </div>
  );
}
