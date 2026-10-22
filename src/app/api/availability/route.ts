import { NextRequest, NextResponse } from "next/server";
import { addDays, format, parseISO, differenceInCalendarDays } from "date-fns";
import { BookingModel, RoomModel } from "@/lib/models";

/**
 * Public availability for guest booking UI.
 * Returns occupied nights (half-open: check_in .. check_out-1) per room.
 *
 * Query: from, to (required YYYY-MM-DD), optional roomId.
 */
export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const roomId = request.nextUrl.searchParams.get("roomId") || undefined;

  if (!from || !to || from >= to) {
    return NextResponse.json(
      { error: "Provide from and to as YYYY-MM-DD with to after from." },
      { status: 400 }
    );
  }

  // Cap public look-ahead to ~18 months to avoid abuse
  const span = differenceInCalendarDays(parseISO(to), parseISO(from));
  if (span > 548) {
    return NextResponse.json({ error: "Date range too large." }, { status: 400 });
  }

  if (roomId) {
    const room = await RoomModel.byId(roomId);
    if (!room || !room.is_active) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
  }

  const bookings = await BookingModel.inRange(from, to, { roomId });
  const bookedNightsByRoom: Record<string, string[]> = {};

  for (const b of bookings) {
    if (!bookedNightsByRoom[b.room_id]) bookedNightsByRoom[b.room_id] = [];
    let cursor = parseISO(b.check_in);
    const end = parseISO(b.check_out);
    while (cursor < end) {
      const day = format(cursor, "yyyy-MM-dd");
      if (day >= from && day < to) {
        bookedNightsByRoom[b.room_id].push(day);
      }
      cursor = addDays(cursor, 1);
    }
  }

  // Dedupe
  for (const id of Object.keys(bookedNightsByRoom)) {
    bookedNightsByRoom[id] = [...new Set(bookedNightsByRoom[id])].sort();
  }

  if (roomId) {
    return NextResponse.json({
      from,
      to,
      roomId,
      bookedNights: bookedNightsByRoom[roomId] ?? [],
    });
  }

  return NextResponse.json({ from, to, bookedNightsByRoom });
}
