import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "About | Mapple View Resort" };

export default function AboutPage() {
  const settings = getSettings();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">About Us</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-forest">{settings.hotel_name}</h1>
      <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-ink-soft">{settings.about_text}</p>

      <div className="mt-10 rounded-2xl border border-forest/10 bg-white p-6">
        <p className="text-xs uppercase tracking-wide text-ink-soft">Find Us</p>
        <p className="mt-1 font-medium text-ink">{settings.address}</p>
      </div>
    </div>
  );
}
