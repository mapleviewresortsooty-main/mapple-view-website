import type { Metadata } from "next";
import RoomCard from "@/components/site/RoomCard";
import SectionLabel from "@/components/site/SectionLabel";
import { RoomModel } from "@/lib/models";
import { getActiveRooms } from "@/lib/site-data";
import { format, parseISO, isValid } from "date-fns";

export const metadata: Metadata = {
  title: "Rooms & Suites | Mapple View Resort",
};

function validDate(v: unknown): string | undefined {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return undefined;
  const d = parseISO(v);
  return isValid(d) ? v : undefined;
}

export default async function RoomsPage({
  searchParams,
}: PageProps<"/rooms">) {
  const sp = await searchParams;
  const checkIn = validDate(sp.checkIn);
  const checkOut = validDate(sp.checkOut);
  const guestsRaw = typeof sp.guests === "string" ? Number(sp.guests) : undefined;
  const guests = guestsRaw && guestsRaw > 0 ? guestsRaw : undefined;
  const hasRange = Boolean(checkIn && checkOut && checkIn < checkOut);

  const rooms = await getActiveRooms();

  const availability = await Promise.all(
    rooms.map(async (room) => {
      if (guests && room.max_guests < guests) {
        return { room, available: false, reason: "guest_limit" as const };
      }
      if (!hasRange || !checkIn || !checkOut) {
        return { room, available: true as const, reason: null };
      }
      const available = await RoomModel.isAvailable(room.id, checkIn, checkOut);
      return {
        room,
        available,
        reason: available ? null : ("dates" as const),
      };
    })
  );

  const querySuffix =
    hasRange && checkIn && checkOut
      ? `?checkIn=${checkIn}&checkOut=${checkOut}${guests ? `&guests=${guests}` : ""}`
      : guests
        ? `?guests=${guests}`
        : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <SectionLabel eyebrow="Accommodation Portfolio" className="justify-center" />
        <h1 className="mt-5 font-display text-4xl font-normal leading-[1.05] text-ink">
          Rooms &amp; Suites
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-light text-ink/70">
          Choose from our range of comfortable rooms, each designed for a relaxing mountain stay.
        </p>
        {hasRange && checkIn && checkOut && (
          <p className="mx-auto mt-3 text-sm font-medium text-petrol-600">
            Showing availability for {format(parseISO(checkIn), "d MMM yyyy")} →{" "}
            {format(parseISO(checkOut), "d MMM yyyy")}
            {guests ? ` · ${guests} guest${guests === 1 ? "" : "s"}` : ""}
          </p>
        )}
      </div>

      {rooms.length === 0 ? (
        <p className="mt-14 text-center text-ink/60">
          No rooms available right now. Please check back soon.
        </p>
      ) : (
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {availability.map(({ room, available, reason }, i) => (
            <RoomCard
              key={room.id}
              room={room}
              index={i}
              available={available}
              unavailableReason={reason}
              href={`/rooms/${room.slug}${querySuffix}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
