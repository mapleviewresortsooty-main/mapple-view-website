import Link from "next/link";
import type { Room } from "@/lib/rooms";
import { formatInr } from "@/lib/format";

export function RoomCard({ room }: { room: Room }) {
  return (
    <Link
      href={`/rooms/${room.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-moss/30 to-forest/20">
        {room.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={room.image_url}
            alt={room.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-2xl italic text-forest/40">{room.name}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-display text-xl font-semibold text-forest">{room.name}</h3>
        <p className="line-clamp-2 text-sm text-ink-soft">{room.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm text-ink-soft">Up to {room.capacity} guests</span>
          <span className="font-display text-lg font-semibold text-terracotta">
            {formatInr(room.price_per_night)}
            <span className="text-xs font-normal text-ink-soft"> /night</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
