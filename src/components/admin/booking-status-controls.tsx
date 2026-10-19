"use client";

import { useTransition } from "react";
import { updateBookingStatusAction } from "@/lib/actions/admin-bookings";
import type { BookingStatus } from "@/lib/bookings";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled"];

export function BookingStatusControls({ bookingId, status }: { bookingId: number; status: BookingStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as BookingStatus;
        startTransition(() => updateBookingStatusAction(bookingId, next));
      }}
      className="rounded-full border border-forest/20 bg-white px-3 py-1.5 text-xs font-semibold uppercase text-forest focus:outline-none disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
