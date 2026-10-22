import { NextRequest, NextResponse } from "next/server";
import { BookingModel, RoomModel } from "@/lib/models";

/**
 * Occupancy for the admin calendar: active rooms + non-cancelled bookings
 * overlapping [from, to). Slim columns only.
 * Pass includeRooms=0 when the client already has the room list.
 */
export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  if (!from || !to || from >= to) {
    return NextResponse.json(
      { error: "Provide from and to as YYYY-MM-DD with to after from." },
      { status: 400 }
    );
  }

  const includeRooms = request.nextUrl.searchParams.get("includeRooms") !== "0";
  const [rooms, bookings] = await Promise.all([
    includeRooms ? RoomModel.forCalendar() : Promise.resolve(undefined),
    BookingModel.forCalendar(from, to),
  ]);

  return NextResponse.json({
    from,
    to,
    ...(rooms ? { rooms } : {}),
    bookings,
  });
}
