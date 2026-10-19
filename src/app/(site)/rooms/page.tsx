import type { Metadata } from "next";
import { listActiveRooms } from "@/lib/rooms";
import { RoomCard } from "@/components/room-card";

export const metadata: Metadata = { title: "Rooms & Rates | Mapple View Resort" };

export default function RoomsPage() {
  const rooms = listActiveRooms();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">Rooms &amp; Rates</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-forest">Find your room</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Every room comes with breakfast, hot water, and a view worth waking up for. Pick one and book in a couple of
        minutes.
      </p>

      {rooms.length === 0 ? (
        <p className="mt-12 text-ink-soft">No rooms are available right now. Please check back soon.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
