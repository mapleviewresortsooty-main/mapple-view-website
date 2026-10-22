"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays, format, addDays, parseISO, eachDayOfInterval } from "date-fns";
import { formatInr } from "@/lib/format";
import type { Room } from "@/lib/types";

export default function BookingForm({
  room,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: {
  room: Room;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}) {
  const router = useRouter();
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const tomorrow = useMemo(() => format(addDays(new Date(), 1), "yyyy-MM-dd"), []);

  const defaultCheckIn =
    initialCheckIn && initialCheckIn >= today ? initialCheckIn : today;
  const defaultCheckOut =
    initialCheckOut && initialCheckOut > defaultCheckIn
      ? initialCheckOut
      : format(addDays(parseISO(defaultCheckIn), 1), "yyyy-MM-dd");

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(
    Math.min(Math.max(initialGuests || 2, 1), room.max_guests)
  );
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookedNights, setBookedNights] = useState<Set<string>>(new Set());

  const nights = Math.max(
    0,
    differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
  );
  const total = nights * room.price_per_night;

  // Load ~12 months of availability for this room
  useEffect(() => {
    const from = today;
    const to = format(addDays(parseISO(today), 365), "yyyy-MM-dd");
    let cancelled = false;
    fetch(`/api/availability?roomId=${encodeURIComponent(room.id)}&from=${from}&to=${to}`)
      .then((r) => r.json() as Promise<{ bookedNights?: string[] }>)
      .then((data) => {
        if (!cancelled) setBookedNights(new Set(data.bookedNights ?? []));
      })
      .catch(() => {
        /* availability hint is best-effort; POST still enforces */
      });
    return () => {
      cancelled = true;
    };
  }, [room.id, today]);

  const rangeConflict = useMemo(() => {
    if (nights < 1) return false;
    const days = eachDayOfInterval({
      start: parseISO(checkIn),
      end: addDays(parseISO(checkOut), -1),
    });
    return days.some((d) => bookedNights.has(format(d, "yyyy-MM-dd")));
  }, [checkIn, checkOut, nights, bookedNights]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (nights < 1) {
      setError("Check-out date must be after check-in date.");
      return;
    }
    if (rangeConflict) {
      setError("Those dates are not available for this room. Please choose different dates.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          guestName,
          guestPhone,
          guestEmail,
          checkIn,
          checkOut,
          guests,
          notes,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        booking?: { id: string };
      };
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/booking/${data.booking!.id}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-petrol-100 bg-white p-6 shadow-sm"
    >
      <h3 className="font-display text-xl font-semibold text-ink">Book This Room</h3>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-ink/60">Check-in</label>
          <input
            type="date"
            required
            min={today}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (e.target.value >= checkOut) {
                setCheckOut(format(addDays(new Date(e.target.value), 1), "yyyy-MM-dd"));
              }
            }}
            className="mt-1 min-h-11 w-full rounded-lg border border-line px-3 py-2.5 text-base focus:border-petrol-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60">Check-out</label>
          <input
            type="date"
            required
            min={format(addDays(new Date(checkIn), 1), "yyyy-MM-dd")}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border border-line px-3 py-2.5 text-base focus:border-petrol-500 focus:outline-none"
          />
        </div>
      </div>

      {rangeConflict && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This room is already booked for part of that stay. Try different dates.
        </p>
      )}

      <div className="mt-4">
        <label className="text-xs font-medium text-ink/60">Guests</label>
        <div className="mt-1 flex min-h-11 items-center gap-3">
          <button
            type="button"
            aria-label="Decrease guests"
            disabled={guests <= 1}
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-lg text-ink transition hover:bg-petrol-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-[5rem] text-center text-base font-medium text-ink" aria-live="polite">
            {guests} {guests === 1 ? "guest" : "guests"}
          </span>
          <button
            type="button"
            aria-label="Increase guests"
            disabled={guests >= room.max_guests}
            onClick={() => setGuests((g) => Math.min(room.max_guests, g + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-lg text-ink transition hover:bg-petrol-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
        <p className="mt-1 text-xs text-ink/50">Max {room.max_guests} guests</p>
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-ink/60">Full Name</label>
        <input
          type="text"
          required
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Your full name"
          className="mt-1 min-h-11 w-full rounded-lg border border-line px-3 py-2.5 text-base focus:border-petrol-500 focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-ink/60">Phone Number</label>
        <input
          type="tel"
          required
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          placeholder="+91 98765 43210"
          className="mt-1 min-h-11 w-full rounded-lg border border-line px-3 py-2.5 text-base focus:border-petrol-500 focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-ink/60">
          Email <span className="text-ink/40">(optional)</span>
        </label>
        <input
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 min-h-11 w-full rounded-lg border border-line px-3 py-2.5 text-base focus:border-petrol-500 focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-ink/60">
          Special Requests <span className="text-ink/40">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-base focus:border-petrol-500 focus:outline-none"
        />
      </div>

      <div className="mt-6 space-y-1 rounded-xl bg-petrol-50 p-4 text-sm">
        <div className="flex justify-between text-ink/70">
          <span>
            {formatInr(room.price_per_night)} x {nights || 0} night{nights === 1 ? "" : "s"}
          </span>
          <span>{formatInr(total)}</span>
        </div>
        <div className="flex justify-between border-t border-petrol-100 pt-2 font-semibold text-ink">
          <span>Total</span>
          <span>{formatInr(total)}</span>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || nights < 1 || rangeConflict}
        className="mt-6 min-h-12 w-full rounded-full bg-ink px-6 py-3 text-base font-semibold text-stone transition hover:bg-charcoal-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Processing..." : "Continue to Payment"}
      </button>
      <p className="mt-3 text-center text-xs text-ink/50">
        You&apos;ll pay securely via UPI on the next step.
      </p>
    </form>
  );
}
