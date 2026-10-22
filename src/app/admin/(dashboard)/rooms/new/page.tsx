import RoomForm from "@/components/admin/RoomForm";

export default function NewRoomPage() {
  return (
    <div>
      <h1 className="font-sans text-2xl font-bold text-ink">Add Room</h1>
      <p className="mt-1 text-sm text-ink/60">Create a new room listing.</p>
      <div className="mt-6">
        <RoomForm />
      </div>
    </div>
  );
}
