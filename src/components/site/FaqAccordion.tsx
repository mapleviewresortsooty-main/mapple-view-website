"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="bg-white p-6">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between text-left"
            >
              <h4 className="font-display text-lg font-normal text-ink">{item.q}</h4>
              <Icon
                name={isOpen ? "remove" : "add"}
                className={`shrink-0 text-petrol-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <p className="mt-4 border-t border-line pt-4 text-sm font-light leading-relaxed text-ink/70">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
