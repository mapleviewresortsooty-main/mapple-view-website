import Link from "next/link";
import { listActiveRooms } from "@/lib/rooms";
import { getSettings } from "@/lib/settings";
import { RoomCard } from "@/components/room-card";

const FEATURES = [
  {
    title: "Valley-facing rooms",
    description: "Every room looks out over pine ridges and open sky — no two views quite the same.",
  },
  {
    title: "Home-style dining",
    description: "Meals cooked fresh with produce from the hills, served the way our family eats.",
  },
  {
    title: "Easy booking",
    description: "Reserve online, pay by UPI, and get confirmation straight from us on WhatsApp.",
  },
];

export default function HomePage() {
  const rooms = listActiveRooms().slice(0, 3);
  const settings = getSettings();

  return (
    <div>
      <section className="relative overflow-hidden bg-forest text-cream">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(201,154,62,0.25),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-24 sm:px-8 sm:py-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">{settings.tagline}</p>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-6xl">
            {settings.hotel_name}
          </h1>
          <p className="max-w-xl text-lg text-cream/80">
            A quiet hillside stay with valley views, home-cooked meals, and rooms built for slowing down.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              href="/rooms"
              className="rounded-full bg-terracotta px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark"
            >
              View Rooms &amp; Book
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-cream/30 px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
            >
              About the Resort
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-forest/10 bg-white p-7">
              <h3 className="font-display text-lg font-semibold text-forest">{feature.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {rooms.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">Stay With Us</p>
              <h2 className="font-display text-3xl font-semibold text-forest">Popular Rooms</h2>
            </div>
            <Link href="/rooms" className="hidden text-sm font-semibold text-forest hover:underline sm:block">
              See all rooms →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
