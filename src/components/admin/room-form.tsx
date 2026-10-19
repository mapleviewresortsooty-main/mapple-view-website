"use client";

import { useActionState } from "react";
import type { Room } from "@/lib/rooms";
import type { RoomFormState } from "@/lib/actions/admin-rooms";

export function RoomForm({
  action,
  room,
}: {
  action: (state: RoomFormState, formData: FormData) => Promise<RoomFormState>;
  room?: Room;
}) {
  const [state, formAction, pending] = useActionState<RoomFormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Name</span>
        <input
          name="name"
          type="text"
          required
          defaultValue={room?.name}
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Slug (used in the URL)</span>
        <input
          name="slug"
          type="text"
          required
          pattern="[a-z0-9\-]+"
          defaultValue={room?.slug}
          placeholder="valley-view-deluxe"
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Description</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={room?.description}
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Price per night (₹)</span>
          <input
            name="price_per_night"
            type="number"
            min={1}
            required
            defaultValue={room?.price_per_night}
            className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Capacity (guests)</span>
          <input
            name="capacity"
            type="number"
            min={1}
            required
            defaultValue={room?.capacity ?? 2}
            className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Amenities (comma separated)</span>
        <input
          name="amenities"
          type="text"
          defaultValue={room?.amenities.join(", ")}
          placeholder="Free Wi-Fi, Balcony, Breakfast Included"
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Image URL (optional)</span>
        <input
          name="image_url"
          type="url"
          defaultValue={room?.image_url}
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Sort order</span>
        <input
          name="sort_order"
          type="number"
          defaultValue={room?.sort_order ?? 0}
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={room ? room.is_active === 1 : true}
          className="h-4 w-4 rounded border-forest/30"
        />
        <span className="font-medium text-ink">Visible on the public site</span>
      </label>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream hover:bg-forest-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : room ? "Save changes" : "Create room"}
      </button>
    </form>
  );
}
