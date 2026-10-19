import { RoomForm } from "@/components/admin/room-form";
import { createRoomAction } from "@/lib/actions/admin-rooms";

export default function NewRoomPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-forest">Add a room</h1>
      <div className="mt-8">
        <RoomForm action={createRoomAction} />
      </div>
    </div>
  );
}
