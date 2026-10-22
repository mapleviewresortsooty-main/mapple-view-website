import { NextRequest, NextResponse } from "next/server";
import { BookingModel, RoomModel } from "@/lib/models";
import { bookingStatusSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/admin/bookings/[id]">
) {
  const { id } = await context.params;
  const booking = await BookingModel.byId(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  const room = await RoomModel.byId(booking.room_id);
  return NextResponse.json({ booking, room });
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/bookings/[id]">
) {
  const { id } = await context.params;
  const existing = await BookingModel.byId(id);
  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = bookingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const booking = await BookingModel.updateStatus(id, parsed.data.status);
  return NextResponse.json({ booking });
}
