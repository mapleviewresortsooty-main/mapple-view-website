"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RoomActions({
  roomId,
  isActive,
}: {
  roomId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleActive() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to update room. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/rooms/${roomId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to delete room. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1 text-sm">
      <div className="flex items-center gap-3">
        <Link href={`/admin/rooms/${roomId}/edit`} className="font-medium text-petrol-600 hover:underline">
          Edit
        </Link>
        <button onClick={toggleActive} disabled={busy} className="text-ink-soft hover:underline disabled:opacity-50">
          {isActive ? "Hide" : "Show"}
        </button>
        <button onClick={handleDelete} disabled={busy} className="text-red-600 hover:underline disabled:opacity-50">
          Delete
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
