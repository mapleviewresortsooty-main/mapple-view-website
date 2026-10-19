import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRoomBySlug } from "@/lib/rooms";
import { formatInr } from "@/lib/format";
import { BookingForm } from "@/components/booking-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  return { title: room ? `${room.name} | Mapple View Resort` : "Room Not Found" };
}

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room || !room.is_active) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-moss/30 to-forest/20 sm:h-96">
            {room.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={room.image_url} alt={room.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-3xl italic text-forest/40">{room.name}</span>
              </div>
            )}
          </div>

          <h1 className="mt-8 font-display text-3xl font-semibold text-forest sm:text-4xl">{room.name}</h1>
          <p className="mt-3 text-ink-soft">{room.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {room.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-forest/5 px-4 py-1.5 text-sm font-medium text-forest"
              >
                {amenity}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-6 rounded-2xl border border-forest/10 bg-white p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-soft">Rate</p>
              <p className="font-display text-2xl font-semibold text-terracotta">
                {formatInr(room.price_per_night)} <span className="text-sm font-normal text-ink-soft">/night</span>
              </p>
            </div>
            <div className="h-10 w-px bg-forest/10" />
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-soft">Capacity</p>
              <p className="font-display text-2xl font-semibold text-forest">{room.capacity} guests</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-xl font-semibold text-forest">Book this room</h2>
          <BookingForm roomId={room.id} capacity={room.capacity} />
        </div>
      </div>
    </div>
  );
}
