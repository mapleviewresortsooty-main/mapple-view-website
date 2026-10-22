import { NextRequest, NextResponse } from "next/server";
import { BookingModel, RoomModel, SettingsModel } from "@/lib/models";
import { confirmBookingSchema } from "@/lib/validation";
import {
  buildBookingMessage,
  buildOwnerWhatsappLink,
  sendWhatsappCloudApi,
} from "@/lib/whatsapp";

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/bookings/[id]/confirm">
) {
  const { id } = await context.params;
  const booking = await BookingModel.byId(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status === "confirmed" || booking.status === "cancelled") {
    return NextResponse.json(
      { error: "This booking can no longer be modified" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = confirmBookingSchema.safeParse(body);
  const paymentRef = parsed.success ? parsed.data.paymentRef : "";

  const room = await RoomModel.byId(booking.room_id);
  const settings = await SettingsModel.get();
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const updatedForMessage = { ...booking, payment_ref: paymentRef || booking.payment_ref };
  const message = buildBookingMessage(updatedForMessage, room);

  const apiResult = await sendWhatsappCloudApi(settings, message);
  const waLink = buildOwnerWhatsappLink(settings, message);

  const booking2 = await BookingModel.updateStatus(id, "payment_claimed", {
    payment_ref: paymentRef,
    whatsapp_sent: apiResult.ok ? 1 : 0,
    whatsapp_error: apiResult.ok ? "" : apiResult.error || "",
  });

  return NextResponse.json({
    booking: booking2,
    whatsapp: {
      autoSent: apiResult.ok,
      error: apiResult.ok ? null : apiResult.error,
      link: waLink,
    },
  });
}
