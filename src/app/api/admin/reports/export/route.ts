import { NextRequest, NextResponse } from "next/server";
import { BookingModel, RoomModel } from "@/lib/models";
import { formatDate } from "@/lib/format";

function csvField(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  const [bookings, rooms] = await Promise.all([
    BookingModel.billing({ from, to }),
    RoomModel.all(true),
  ]);
  const roomMap = new Map(rooms.map((r) => [r.id, r.name]));

  const header = [
    "Booking ID",
    "Guest Name",
    "Phone",
    "Email",
    "Room",
    "Check-in",
    "Check-out",
    "Nights",
    "Guests",
    "Amount (INR)",
    "Status",
    "Source",
    "Payment Ref",
    "Created",
  ];
  const rows = bookings.map((b) => [
    b.id,
    b.guest_name,
    b.guest_phone,
    b.guest_email,
    roomMap.get(b.room_id) || "Unknown Room",
    formatDate(b.check_in),
    formatDate(b.check_out),
    b.nights,
    b.guests,
    b.total_amount,
    b.status,
    b.source,
    b.payment_ref,
    formatDate(b.created_at),
  ]);

  const csv =
    [header, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n") + "\r\n";

  const filenameParts = ["mapple-view-billing", from || "all", to || "all"];
  const filename = `${filenameParts.join("_")}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
