import { NextResponse } from "next/server";
import { BookingModel, RoomModel, SettingsModel } from "@/lib/models";
import { buildUpiQrDataUrl } from "@/lib/upi";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/bookings/[id]">
) {
  const { id } = await context.params;
  const booking = await BookingModel.byId(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  const room = await RoomModel.byId(booking.room_id);
  const settings = await SettingsModel.get();

  let qrDataUrl: string | null = null;
  if (settings.upi_id && booking.status !== "confirmed" && booking.status !== "cancelled") {
    qrDataUrl = await buildUpiQrDataUrl({
      upiId: settings.upi_id,
      payeeName: settings.upi_payee_name || settings.resort_name,
      amount: booking.total_amount,
      note: `Booking ${booking.id.slice(0, 8)}`,
    });
  }

  return NextResponse.json({
    booking,
    room,
    settings: {
      resort_name: settings.resort_name,
      upi_id: settings.upi_id,
      upi_payee_name: settings.upi_payee_name,
      whatsapp_owner_number: settings.whatsapp_owner_number,
    },
    qrDataUrl,
  });
}
