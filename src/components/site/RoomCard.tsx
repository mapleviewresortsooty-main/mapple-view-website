import Image from "next/image";
import Link from "next/link";
import type { Room } from "@/lib/types";
import { formatInr } from "@/lib/format";
import { stockRoomImage } from "@/lib/stockImages";

export default function RoomCard({
  room,
  index = 0,
  available = true,
  unavailableReason = null,
  href,
}: {
  room: Room;
  index?: number;
  available?: boolean;
  unavailableReason?: "dates" | "guest_limit" | null;
  href?: string;
}) {
  const image = room.images[0] || stockRoomImage(index);
  const link = href ?? `/rooms/${room.slug}`;

  return (
    <div
      className={`group flex flex-col bg-stone-dark/40 transition hover:shadow-lg ${
        !available ? "opacity-80" : ""
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-petrol-100">
        <Image
          src={image}
          alt={room.name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="label-caps absolute left-0 top-0 bg-charcoal/85 px-3 py-1.5 text-stone backdrop-blur-sm">
          {formatInr(room.price_per_night)} / night
        </div>
        {!available && (
          <div className="label-caps absolute right-0 top-0 bg-red-700/90 px-3 py-1.5 text-stone">
            {unavailableReason === "guest_limit" ? "Too few beds" : "Unavailable"}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-medium text-ink">{room.name}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm font-light text-ink/70">
          {room.summary}
        </p>
        <div className="label-caps mt-4 flex items-center justify-between text-ink-soft/70">
          <span>Up to {room.max_guests} guests</span>
          {room.bed_type && <span>{room.bed_type}</span>}
        </div>
        {available ? (
          <Link
            href={link}
            className="label-caps mt-4 inline-flex items-center justify-center bg-ink px-4 py-3 text-stone transition hover:bg-charcoal-light"
          >
            View &amp; Book
          </Link>
        ) : (
          <span className="label-caps mt-4 inline-flex items-center justify-center border border-line px-4 py-3 text-ink/50">
            Not available for these dates
          </span>
        )}
      </div>
    </div>
  );
}
