"use client";

import { useState, useTransition } from "react";
import { deleteRoomAction } from "@/lib/actions/admin-rooms";

export function DeleteRoomButton({ roomId }: { roomId: number }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Delete this room? This can't be undone.")) return;
          setError(null);
          startTransition(async () => {
            const result = await deleteRoomAction(roomId);
            if (result.error) setError(result.error);
          });
        }}
        className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-60"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
