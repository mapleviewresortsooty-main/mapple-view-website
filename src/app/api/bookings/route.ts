import { NextRequest, NextResponse } from "next/server";
import { differenceInCalendarDays } from "date-fns";
import { RoomModel, BookingModel } from "@/lib/models";
import { createBookingSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const room = await RoomModel.byId(data.roomId);
  if (!room || !room.is_active) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const nights = differenceInCalendarDays(
    new Date(data.checkOut),
    new Date(data.checkIn)
  );
  if (nights < 1) {
    return NextResponse.json(
      { error: "Check-out must be after check-in" },
      { status: 400 }
    );
  }
  if (data.guests > room.max_guests) {
    return NextResponse.json(
      { error: `This room allows a maximum of ${room.max_guests} guests` },
      { status: 400 }
    );
  }

  const available = await RoomModel.isAvailable(room.id, data.checkIn, data.checkOut);
  if (!available) {
    return NextResponse.json(
      { error: "This room isn't available for the selected dates. Please choose different dates." },
      { status: 409 }
    );
  }

  const totalAmount = nights * room.price_per_night;

  const booking = await BookingModel.create({
    room_id: room.id,
    guest_name: data.guestName,
    guest_phone: data.guestPhone,
    guest_email: data.guestEmail || "",
    check_in: data.checkIn,
    check_out: data.checkOut,
    guests: data.guests,
    nights,
    total_amount: totalAmount,
    notes: data.notes || "",
  });

  return NextResponse.json({ booking }, { status: 201 });
}
