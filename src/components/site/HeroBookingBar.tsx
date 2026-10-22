"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import Icon from "@/components/ui/Icon";

const MIN_GUESTS = 1;
const MAX_GUESTS = 20;

/** Full-field tap target for native date pickers (especially iOS/Android). */
const dateInputClass =
  "relative min-h-11 w-full min-w-0 cursor-pointer rounded-lg border border-line bg-white px-3 py-2.5 " +
  "font-display text-base leading-none text-ink outline-none transition " +
  "focus:border-petrol-500 focus:ring-2 focus:ring-petrol-500/20 " +
  "[&::-webkit-date-and-time-value]:text-left " +
  "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 " +
  "[&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full " +
  "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0";

export default function HeroBookingBar() {
  const router = useRouter();
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);

  function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    });
    router.push(`/rooms?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleReserve}
      className="relative z-10 w-full bg-stone/95 py-4 shadow-2xl backdrop-blur-md sm:py-5"
      id="quick-booking"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-stretch lg:gap-6">
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line">
          <label className="flex min-w-0 flex-col gap-2 border-r border-line pr-3 sm:border-r-0 sm:pr-6 lg:pr-8">
            <span className="label-caps text-ink-soft/70">Arrival</span>
            <input
              type="date"
              required
              value={checkIn}
              min={today}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (e.target.value >= checkOut) {
                  setCheckOut(format(addDays(new Date(e.target.value), 1), "yyyy-MM-dd"));
                }
              }}
              className={dateInputClass}
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 sm:px-6 lg:px-8">
            <span className="label-caps text-ink-soft/70">Departure</span>
            <input
              type="date"
              required
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className={dateInputClass}
            />
          </label>

          <div className="col-span-2 flex min-w-0 flex-col gap-2 sm:col-span-1 sm:pl-6 lg:pl-8">
            <span className="label-caps text-ink-soft/70">Guests</span>
            <div className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-line bg-white px-2 py-1.5 sm:justify-start sm:gap-2.5 sm:border-0 sm:bg-transparent sm:px-0">
              <button
                type="button"
                aria-label="Decrease guests"
                disabled={guests <= MIN_GUESTS}
                onClick={() => setGuests((g) => Math.max(MIN_GUESTS, g - 1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-lg leading-none text-ink transition hover:bg-petrol-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>
              <span
                className="min-w-[4.25rem] text-center text-base font-medium tabular-nums text-ink"
                aria-live="polite"
              >
                {guests} {guests === 1 ? "Guest" : "Guests"}
              </span>
              <button
                type="button"
                aria-label="Increase guests"
                disabled={guests >= MAX_GUESTS}
                onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-lg leading-none text-ink transition hover:bg-petrol-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="label-caps flex min-h-12 w-full shrink-0 items-center justify-center gap-2 bg-charcoal px-6 py-3.5 text-stone transition hover:bg-charcoal-light lg:w-44 lg:self-center"
        >
          <span>See Rooms</span>
          <Icon name="arrow_forward" className="text-sm" />
        </button>
      </div>
    </form>
  );
}
