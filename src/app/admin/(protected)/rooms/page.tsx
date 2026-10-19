import Link from "next/link";
import { listAllRooms } from "@/lib/rooms";
import { formatInr } from "@/lib/format";
import { DeleteRoomButton } from "@/components/admin/delete-room-button";

export default function AdminRoomsPage() {
  const rooms = listAllRooms();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-forest">Rooms</h1>
        <Link
          href="/admin/rooms/new"
          className="rounded-full bg-forest px-5 py-2 text-sm font-semibold text-cream hover:bg-forest-dark"
        >
          + Add room
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-forest/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-forest/5 text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Capacity</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="px-5 py-4 font-medium text-ink">{room.name}</td>
                <td className="px-5 py-4 text-ink-soft">{formatInr(room.price_per_night)}</td>
                <td className="px-5 py-4 text-ink-soft">{room.capacity}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      room.is_active ? "bg-moss/15 text-moss" : "bg-ink-soft/10 text-ink-soft"
                    }`}
                  >
                    {room.is_active ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/rooms/${room.id}/edit`} className="text-sm font-semibold text-forest hover:underline">
                      Edit
                    </Link>
                    <DeleteRoomButton roomId={room.id} />
                  </div>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-soft">
                  No rooms yet. Add your first room.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
