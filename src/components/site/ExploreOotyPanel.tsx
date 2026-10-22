"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { attractions } from "@/lib/ooty";

export default function ExploreOotyPanel() {
  const [active, setActive] = useState(0);
  const current = attractions[active];

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
      <div className="flex flex-col justify-center border border-stone/15 bg-charcoal-light p-8 text-stone lg:col-span-7 lg:p-10">
        <span className="label-caps text-petrol-300">{current.proximity}</span>
        <h3 className="mt-3 font-display text-2xl font-normal">{current.title}</h3>
        <p className="mt-3 max-w-lg text-sm font-normal leading-relaxed text-stone/85">
          {current.desc}
        </p>
      </div>
    </div>
  );
}
