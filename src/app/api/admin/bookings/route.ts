import { NextRequest, NextResponse } from "next/server";
import { differenceInCalendarDays, format, startOfToday } from "date-fns";
import { BookingModel, RoomModel } from "@/lib/models";
import { adminCreateBookingSchema } from "@/lib/validation";

/**
 * Create a booking from the admin calendar (OTA walk-in, phone, maintenance
 * block, etc.). Blocks those dates for the public site and tracks revenue
 * in Reports & Billing.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = adminCreateBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const room = await RoomModel.byId(d.roomId);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const todayKey = format(startOfToday(), "yyyy-MM-dd");
  if (d.checkIn < todayKey) {
    return NextResponse.json(
      { error: "Check-in cannot be in the past" },
      { status: 400 }
    );
  }

  const nights = differenceInCalendarDays(new Date(d.checkOut), new Date(d.checkIn));
  if (nights < 1) {
    return NextResponse.json(
      { error: "Check-out must be after check-in" },
      { status: 400 }
    );
  }

  const available = await RoomModel.isAvailable(d.roomId, d.checkIn, d.checkOut);
  if (!available) {
    return NextResponse.json(
      { error: "This room already has a booking or block over those dates." },
      { status: 409 }
    );
  }

  const booking = await BookingModel.create({
    room_id: d.roomId,
    guest_name: d.guestName,
    guest_phone: d.guestPhone,
    guest_email: d.guestEmail,
    check_in: d.checkIn,
    check_out: d.checkOut,
    guests: d.guests,
    nights,
    total_amount: d.totalAmount,
    notes: d.notes,
    status: d.status,
    source: d.source,
  });

  return NextResponse.json({ booking }, { status: 201 });
}
