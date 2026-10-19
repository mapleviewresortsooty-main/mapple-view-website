import { notFound } from "next/navigation";
import { getRoomById } from "@/lib/rooms";
import { updateRoomAction } from "@/lib/actions/admin-rooms";
import { RoomForm } from "@/components/admin/room-form";

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roomId = Number(id);
  const room = Number.isFinite(roomId) ? getRoomById(roomId) : null;
  if (!room) notFound();

  const boundAction = updateRoomAction.bind(null, room.id);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-forest">Edit {room.name}</h1>
      <div className="mt-8">
        <RoomForm action={boundAction} room={room} />
      </div>
    </div>
  );
}
