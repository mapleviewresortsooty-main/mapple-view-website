"use client";

import { useActionState } from "react";
import { createBookingAction, type BookingState } from "@/lib/actions/booking";

export function BookingForm({ roomId, capacity }: { roomId: number; capacity: number }) {
  const [state, formAction, pending] = useActionState<BookingState, FormData>(createBookingAction, undefined);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-forest/10 bg-white p-6">
      <input type="hidden" name="room_id" value={roomId} />

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Check-in</span>
          <input
            type="date"
            name="check_in"
            required
            min={today}
            className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Check-out</span>
          <input
            type="date"
            name="check_out"
            required
            min={today}
            className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Guests</span>
        <input
          type="number"
          name="guests_count"
          min={1}
          max={capacity}
          defaultValue={1}
          required
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Full name</span>
        <input
          type="text"
          name="guest_name"
          required
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Phone</span>
          <input
            type="tel"
            name="guest_phone"
            required
            placeholder="98765 43210"
            className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Email (optional)</span>
          <input
            type="email"
            name="guest_email"
            className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Notes (optional)</span>
        <textarea
          name="notes"
          rows={2}
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-terracotta-dark disabled:opacity-60"
      >
        {pending ? "Booking..." : "Request Booking"}
      </button>
    </form>
  );
}
