"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfToday,
  differenceInCalendarDays,
} from "date-fns";
import type { Booking, BookingStatus, Room } from "@/lib/types";
import { formatInr } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

const SOURCE_OPTIONS = [
  "Walk-in",
  "Phone",
  "Booking.com",
  "Airbnb",
  "MakeMyTrip",
  "Goibibo",
  "Maintenance",
  "Other",
];

type CalendarRoom = Pick<Room, "id" | "name" | "price_per_night">;
type CalendarBooking = Pick<
  Booking,
  | "id"
  | "room_id"
  | "guest_name"
  | "check_in"
  | "check_out"
  | "status"
  | "source"
  | "total_amount"
>;

type OccupancyResponse = {
  rooms?: CalendarRoom[];
  bookings: CalendarBooking[];
};

function nightKey(d: Date | string) {
  return typeof d === "string" ? d : format(d, "yyyy-MM-dd");
}

function isPastNight(night: string, todayKey: string) {
  return night < todayKey;
}

/** Booking that occupies this night (check_in <= night < check_out). */
function bookingOnNight(
  byRoom: Map<string, CalendarBooking[]>,
  roomId: string,
  night: string
) {
  const list = byRoom.get(roomId);
  if (!list) return undefined;
  return list.find((b) => b.check_in <= night && b.check_out > night);
}

const cellStatusClass: Record<Exclude<BookingStatus, "cancelled">, string> = {
  pending: "bg-amber-200 hover:bg-amber-300",
  payment_claimed: "bg-blue-200 hover:bg-blue-300",
  confirmed: "bg-emerald-200 hover:bg-emerald-300",
};

export default function BookingCalendar({
  initialRooms,
  initialBookings,
  initialMonth,
}: {
  initialRooms?: CalendarRoom[];
  initialBookings?: CalendarBooking[];
  /** First day of the preloaded month as yyyy-MM-dd */
  initialMonth?: string;
} = {}) {
  const today = startOfToday();
  const todayKey = format(today, "yyyy-MM-dd");
  const [month, setMonth] = useState(() =>
    initialMonth ? startOfMonth(parseISO(initialMonth)) : startOfMonth(today)
  );
  const [rooms, setRooms] = useState<CalendarRoom[]>(initialRooms ?? []);
  const [bookings, setBookings] = useState<CalendarBooking[]>(initialBookings ?? []);
  const [loading, setLoading] = useState(!(initialRooms && initialBookings));
  const [error, setError] = useState<string | null>(null);

  const [dayZoom, setDayZoom] = useState<string | null>(null);
  const [rangeRoomId, setRangeRoomId] = useState<string | null>(null);
  const [rangeCheckIn, setRangeCheckIn] = useState<string | null>(null);
  const [rangeCheckOut, setRangeCheckOut] = useState<string | null>(null);
  const [pickingCheckout, setPickingCheckout] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [activeBooking, setActiveBooking] = useState<CalendarBooking | null>(null);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayColRef = useRef<HTMLTableCellElement>(null);
  const hasRooms = useRef((initialRooms?.length ?? 0) > 0);

  const from = format(startOfMonth(month), "yyyy-MM-dd");
  const to = format(addDays(endOfMonth(month), 1), "yyyy-MM-dd");
  const days = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }),
    [month]
  );
  const monthIncludesToday =
    month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  const bookingsByRoom = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const b of bookings) {
      const list = map.get(b.room_id);
      if (list) list.push(b);
      else map.set(b.room_id, [b]);
    }
    return map;
  }, [bookings]);

  const load = useCallback(
    async (opts?: { forceRooms?: boolean }) => {
      setLoading(true);
      setError(null);
      try {
        const needRooms = opts?.forceRooms || !hasRooms.current;
        const qs = new URLSearchParams({ from, to });
        if (!needRooms) qs.set("includeRooms", "0");
        const res = await fetch(`/api/admin/bookings/occupancy?${qs}`);
        const data = (await res.json()) as OccupancyResponse & { error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to load calendar");
        if (data.rooms) {
          setRooms(data.rooms);
          hasRooms.current = data.rooms.length > 0;
        }
        setBookings(data.bookings);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load calendar");
      } finally {
        setLoading(false);
      }
    },
    [from, to]
  );

  const skipNextFetch = useRef(
    Boolean(initialRooms && initialBookings && initialMonth)
  );

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    void load();
  }, [load]);

  useEffect(() => {
    if (loading || !monthIncludesToday) return;
    const id = window.requestAnimationFrame(() => {
      todayColRef.current?.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [loading, monthIncludesToday, month]);

  function resetRange() {
    setRangeRoomId(null);
    setRangeCheckIn(null);
    setRangeCheckOut(null);
    setPickingCheckout(false);
  }

  function openCreate(roomId: string, checkIn: string, checkOut: string) {
    if (isPastNight(checkIn, todayKey)) {
      setError("Cannot book nights that are already in the past.");
      resetRange();
      return;
    }
    setRangeRoomId(roomId);
    setRangeCheckIn(checkIn);
    setRangeCheckOut(checkOut);
    setPickingCheckout(false);
    setShowCreate(true);
    setDayZoom(null);
  }

  function onCellClick(roomId: string, night: string) {
    const existing = bookingOnNight(bookingsByRoom, roomId, night);
    if (existing) {
      setActiveBooking(existing);
      resetRange();
      return;
    }

    if (isPastNight(night, todayKey)) {
      setError("Cannot book nights that are already in the past.");
      resetRange();
      return;
    }

    if (!pickingCheckout || rangeRoomId !== roomId || !rangeCheckIn) {
      setRangeRoomId(roomId);
      setRangeCheckIn(night);
      setRangeCheckOut(null);
      setPickingCheckout(true);
      setActiveBooking(null);
      return;
    }

    if (night < rangeCheckIn) {
      setRangeCheckIn(night);
      setRangeCheckOut(null);
      return;
    }

    const checkOut = format(addDays(parseISO(night), 1), "yyyy-MM-dd");
    let cursor = parseISO(rangeCheckIn);
    const end = parseISO(checkOut);
    while (cursor < end) {
      const key = format(cursor, "yyyy-MM-dd");
      if (bookingOnNight(bookingsByRoom, roomId, key)) {
        setError("That range overlaps an existing booking. Pick free nights only.");
        resetRange();
        return;
      }
      cursor = addDays(cursor, 1);
    }
    openCreate(roomId, rangeCheckIn, checkOut);
  }

  function isInPendingRange(roomId: string, night: string) {
    if (rangeRoomId !== roomId || !rangeCheckIn) return false;
    if (!rangeCheckOut && pickingCheckout) {
      return night === rangeCheckIn;
    }
    if (rangeCheckOut) {
      return night >= rangeCheckIn && night < rangeCheckOut;
    }
    return false;
  }

  async function cancelBooking(id: string) {
    if (!confirm("Cancel this booking? The dates will become available again.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Could not cancel");
      }
      setActiveBooking(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel");
    } finally {
      setBusy(false);
    }
  }

  const monthLabel = format(month, "MMMM yyyy");

  return (
    <div className="min-w-0 w-full max-w-full space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            className="min-h-10 min-w-10 rounded-lg border border-line px-2.5 py-2 text-sm hover:bg-petrol-50 sm:px-3"
            aria-label="Previous month"
          >
            Prev
          </button>
          <h2 className="min-w-0 flex-1 truncate text-center font-sans text-base font-semibold text-ink sm:min-w-[10rem] sm:flex-none sm:text-lg">
            {monthLabel}
          </h2>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="min-h-10 min-w-10 rounded-lg border border-line px-2.5 py-2 text-sm hover:bg-petrol-50 sm:px-3"
            aria-label="Next month"
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => setMonth(startOfMonth(today))}
            className="min-h-10 rounded-lg bg-petrol-50 px-2.5 py-2 text-sm font-medium text-ink hover:bg-petrol-100 sm:px-3"
          >
            Today
          </button>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-ink/60 sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-200" /> Confirmed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-200" /> Pending
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-blue-200" /> Payment
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm border border-line bg-white" /> Free
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-rose-200 ring-1 ring-rose-300/80" /> Past
          </span>
        </div>
      </div>

      {pickingCheckout && rangeCheckIn && (
        <p className="rounded-lg bg-petrol-50 px-3 py-2 text-sm text-ink/80">
          Selecting stay starting <strong>{rangeCheckIn}</strong> — click the last night of the stay
          for this room, or{" "}
          <button type="button" className="underline" onClick={resetRange}>
            cancel
          </button>
          .
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}{" "}
          <button type="button" className="underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </p>
      )}

      {loading && rooms.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink/50">Loading calendar…</p>
      ) : rooms.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink/50">No active rooms. Add rooms first.</p>
      ) : (
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-[11px] text-ink/45 sm:hidden">Swipe sideways to see more days →</p>
            {loading && (
              <p className="ml-auto text-[11px] text-ink/45 sm:text-xs">Updating…</p>
            )}
          </div>
          <div
            ref={scrollRef}
            className={`max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-petrol-100 bg-white shadow-sm [-webkit-overflow-scrolling:touch] sm:rounded-2xl ${
              loading ? "opacity-70" : ""
            }`}
          >
            <table className="w-max min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-petrol-100">
                  <th className="sticky left-0 z-10 bg-white px-2 py-2 text-left text-[10px] font-medium uppercase text-ink/50 sm:px-3 sm:text-xs">
                    Room
                  </th>
                  {days.map((d) => {
                    const key = nightKey(d);
                    const isToday = isSameDay(d, today);
                    const past = isPastNight(key, todayKey);
                    return (
                      <th
                        key={key}
                        ref={isToday ? todayColRef : undefined}
                        className="p-0.5"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setDayZoom(key);
                            resetRange();
                            setActiveBooking(null);
                          }}
                          className={`flex w-7 flex-col items-center rounded-md px-0.5 py-1 text-[9px] font-medium transition sm:w-9 sm:text-[10px] ${
                            isToday
                              ? "bg-charcoal text-stone"
                              : past
                                ? "bg-rose-50 text-rose-400 hover:bg-rose-100"
                                : "text-ink/70 hover:bg-petrol-50"
                          }`}
                          title={`Zoom ${key}`}
                        >
                          <span className="hidden sm:inline">{format(d, "EEE")}</span>
                          <span className="text-[10px] sm:text-xs">{format(d, "d")}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-b border-petrol-50 last:border-0">
                    <td className="sticky left-0 z-10 w-24 max-w-[6rem] truncate bg-white px-2 py-1.5 text-[11px] font-semibold text-ink shadow-[2px_0_4px_rgba(0,0,0,0.04)] sm:w-36 sm:max-w-[9rem] sm:px-3 sm:py-2 sm:text-xs">
                      {room.name}
                    </td>
                    {days.map((d) => {
                      const key = nightKey(d);
                      const b = bookingOnNight(bookingsByRoom, room.id, key);
                      const pending = isInPendingRange(room.id, key);
                      const past = !b && isPastNight(key, todayKey);
                      let cls =
                        "h-8 w-7 touch-manipulation rounded-md border border-transparent transition focus:outline-none focus:ring-2 focus:ring-petrol-400 sm:h-9 sm:w-9";
                      if (b && b.status !== "cancelled") {
                        cls += ` ${cellStatusClass[b.status as Exclude<BookingStatus, "cancelled">]}`;
                      } else if (pending) {
                        cls += " bg-petrol-400/40 ring-2 ring-petrol-500";
                      } else if (past) {
                        cls +=
                          " cursor-not-allowed border-rose-200/70 bg-rose-100 opacity-90";
                      } else {
                        cls += " border-line/60 bg-stone hover:bg-petrol-50";
                      }
                      return (
                        <td key={key} className="p-0.5">
                          <button
                            type="button"
                            disabled={past}
                            className={cls}
                            title={
                              b
                                ? `${b.guest_name} (${b.status})`
                                : past
                                  ? "Past night — cannot book"
                                  : pending
                                    ? "In selection"
                                    : `Book ${room.name} from ${key}`
                            }
                            onClick={() => onCellClick(room.id, key)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-[11px] text-ink/50 sm:text-xs">
        Tip: tap a free cell to start a stay, then tap the last night. Tap a coloured cell to view
        or cancel. Tap a day number to zoom into that date.
      </p>

      {dayZoom && (
        <DayZoomPanel
          day={dayZoom}
          rooms={rooms}
          bookingsByRoom={bookingsByRoom}
          isPast={isPastNight(dayZoom, todayKey)}
          onClose={() => setDayZoom(null)}
          onBook={(roomId) => {
            const checkOut = format(addDays(parseISO(dayZoom), 1), "yyyy-MM-dd");
            openCreate(roomId, dayZoom, checkOut);
          }}
          onExtend={(roomId, checkIn) => {
            if (isPastNight(checkIn, todayKey)) {
              setError("Cannot book nights that are already in the past.");
              return;
            }
            setRangeRoomId(roomId);
            setRangeCheckIn(checkIn);
            setRangeCheckOut(null);
            setPickingCheckout(true);
            setDayZoom(null);
          }}
          onSelectBooking={(b) => {
            setActiveBooking(b);
            setDayZoom(null);
          }}
        />
      )}

      {activeBooking && (
        <BookingDetailModal
          booking={activeBooking}
          room={rooms.find((r) => r.id === activeBooking.room_id)}
          busy={busy}
          onClose={() => setActiveBooking(null)}
          onCancel={() => cancelBooking(activeBooking.id)}
        />
      )}

      {showCreate && rangeRoomId && rangeCheckIn && rangeCheckOut && (
        <CreateBookingModal
          room={rooms.find((r) => r.id === rangeRoomId)!}
          checkIn={rangeCheckIn}
          checkOut={rangeCheckOut}
          todayKey={todayKey}
          onCheckInChange={(v) => {
            if (isPastNight(v, todayKey)) {
              setError("Cannot book nights that are already in the past.");
              return;
            }
            setRangeCheckIn(v);
            if (v >= (rangeCheckOut || "")) {
              setRangeCheckOut(format(addDays(parseISO(v), 1), "yyyy-MM-dd"));
            }
          }}
          onCheckOutChange={setRangeCheckOut}
          onClose={() => {
            setShowCreate(false);
            resetRange();
          }}
          onCreated={async () => {
            setShowCreate(false);
            resetRange();
            await load();
          }}
        />
      )}
    </div>
  );
}

function DayZoomPanel({
  day,
  rooms,
  bookingsByRoom,
  isPast,
  onClose,
  onBook,
  onExtend,
  onSelectBooking,
}: {
  day: string;
  rooms: CalendarRoom[];
  bookingsByRoom: Map<string, CalendarBooking[]>;
  isPast: boolean;
  onClose: () => void;
  onBook: (roomId: string) => void;
  onExtend: (roomId: string, checkIn: string) => void;
  onSelectBooking: (b: CalendarBooking) => void;
}) {
  const label = format(parseISO(day), "EEEE, d MMMM yyyy");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/50 p-3 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:max-h-[90vh] sm:rounded-2xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Day view</p>
            <h3 className="font-sans text-base font-semibold text-ink sm:text-lg">{label}</h3>
            {isPast && (
              <p className="mt-1 text-xs text-rose-600">Past date — new bookings are disabled.</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-ink/60 hover:bg-petrol-50"
          >
            Close
          </button>
        </div>
        <ul className="mt-5 space-y-3">
          {rooms.map((room) => {
            const b = bookingOnNight(bookingsByRoom, room.id, day);
            return (
              <li key={room.id} className="rounded-xl border border-petrol-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{room.name}</p>
                    {b ? (
                      <div className="mt-1 space-y-1 text-sm text-ink/70">
                        <p>
                          {b.guest_name} · {b.source}
                        </p>
                        <p>
                          {b.check_in} → {b.check_out}
                        </p>
                        <StatusBadge status={b.status} />
                      </div>
                    ) : isPast ? (
                      <p className="mt-1 text-sm text-ink/50">Past night</p>
                    ) : (
                      <p className="mt-1 text-sm text-emerald-700">Available</p>
                    )}
                  </div>
                  {b ? (
                    <button
                      type="button"
                      onClick={() => onSelectBooking(b)}
                      className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-stone"
                    >
                      Manage
                    </button>
                  ) : !isPast ? (
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => onBook(room.id)}
                        className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-stone"
                      >
                        Book 1 night
                      </button>
                      <button
                        type="button"
                        onClick={() => onExtend(room.id, day)}
                        className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-petrol-50"
                      >
                        Pick range
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function BookingDetailModal({
  booking,
  room,
  busy,
  onClose,
  onCancel,
}: {
  booking: CalendarBooking;
  room?: CalendarRoom;
  busy: boolean;
  onClose: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Booking</p>
            <h3 className="font-sans text-lg font-semibold text-ink">{booking.guest_name}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-ink/60 hover:underline">
            Close
          </button>
        </div>
        <dl className="mt-4 space-y-2 text-sm text-ink/80">
          <div className="flex justify-between gap-4">
            <dt className="text-ink/50">Room</dt>
            <dd>{room?.name || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/50">Dates</dt>
            <dd>
              {booking.check_in} → {booking.check_out}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/50">Source</dt>
            <dd>{booking.source}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/50">Amount</dt>
            <dd>{formatInr(booking.total_amount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink/50">Status</dt>
            <dd>
              <StatusBadge status={booking.status} />
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href={`/admin/bookings/${booking.id}`}
            className="rounded-full border border-line px-4 py-2.5 text-center text-sm font-medium text-ink hover:bg-petrol-50"
          >
            Open full details
          </Link>
          {booking.status !== "cancelled" && (
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {busy ? "Cancelling…" : "Cancel booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateBookingModal({
  room,
  checkIn,
  checkOut,
  todayKey,
  onCheckInChange,
  onCheckOutChange,
  onClose,
  onCreated,
}: {
  room: CalendarRoom;
  checkIn: string;
  checkOut: string;
  todayKey: string;
  onCheckInChange: (v: string) => void;
  onCheckOutChange: (v: string) => void;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const nights = Math.max(
    0,
    differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn))
  );
  const suggested = nights * room.price_per_night;

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [source, setSource] = useState("Walk-in");
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState(suggested);
  const [amountTouched, setAmountTouched] = useState(false);
  const [status, setStatus] = useState<BookingStatus>("confirmed");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isBlock = source === "Maintenance";
  const effectiveAmount = amountTouched ? amount : suggested;

  useEffect(() => {
    if (!amountTouched) setAmount(suggested);
  }, [suggested, amountTouched]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (isPastNight(checkIn, todayKey)) {
      setError("Check-in cannot be in the past.");
      return;
    }
    if (nights < 1) {
      setError("Check-out must be after check-in.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          guestName: guestName || `${source} guest`,
          guestPhone,
          guestEmail,
          checkIn,
          checkOut,
          guests: 1,
          totalAmount: isBlock ? 0 : effectiveAmount,
          status: isBlock ? "confirmed" : status,
          source,
          notes,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not save booking");
        setSubmitting(false);
        return;
      }
      await onCreated();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/50 p-4 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">New booking</p>
            <h3 className="font-sans text-lg font-semibold text-ink">{room.name}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-ink/60 hover:underline">
            Close
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-ink/60">Check-in</label>
            <input
              type="date"
              required
              min={todayKey}
              value={checkIn}
              onChange={(e) => onCheckInChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60">Check-out</label>
            <input
              type="date"
              required
              value={checkOut}
              min={format(addDays(parseISO(checkIn), 1), "yyyy-MM-dd")}
              onChange={(e) => onCheckOutChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-ink/50">
          {nights} night{nights === 1 ? "" : "s"}
          {!isBlock && ` · suggested ${formatInr(suggested)}`}
        </p>

        <div className="mt-4">
          <label className="text-xs font-medium text-ink/60">Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
          >
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3">
          <label className="text-xs font-medium text-ink/60">Guest name</label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            placeholder="Guest name"
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-ink/60">Phone</label>
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60">Email</label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
        </div>

        {!isBlock && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink/60">Amount (₹)</label>
              <input
                type="number"
                min={0}
                value={effectiveAmount}
                onChange={(e) => {
                  setAmountTouched(true);
                  setAmount(Number(e.target.value));
                }}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="payment_claimed">Payment claimed</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-3">
          <label className="text-xs font-medium text-ink/60">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || nights < 1}
          className="mt-5 w-full rounded-full bg-ink px-4 py-3 text-sm font-semibold text-stone hover:bg-charcoal-light disabled:opacity-60"
        >
          {submitting ? "Saving…" : isBlock ? "Block these dates" : "Save booking"}
        </button>
      </form>
    </div>
  );
}
