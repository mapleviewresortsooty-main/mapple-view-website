import { notFound } from "next/navigation";
import { BookingModel, RoomModel } from "@/lib/models";
import { formatInr, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import BookingStatusControl from "@/components/admin/BookingStatusControl";

export default async function AdminBookingDetailPage({
  params,
}: PageProps<"/admin/bookings/[id]">) {
  const { id } = await params;
  const booking = await BookingModel.byId(id);
  if (!booking) notFound();
  const room = await RoomModel.byId(booking.room_id);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-bold text-ink">
          Booking Details
        </h1>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-6 rounded-2xl border border-petrol-100 bg-white p-6 shadow-sm">
        <h2 className="font-sans text-lg font-semibold text-ink">
          {room?.name || "Unknown Room"}
        </h2>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-ink/50">Guest Name</dt><dd className="font-medium text-ink/80">{booking.guest_name}</dd></div>
          <div><dt className="text-ink/50">Phone</dt><dd className="font-medium text-ink/80">{booking.guest_phone}</dd></div>
          {booking.guest_email && (
            <div><dt className="text-ink/50">Email</dt><dd className="font-medium text-ink/80">{booking.guest_email}</dd></div>
          )}
          <div><dt className="text-ink/50">Guests</dt><dd className="font-medium text-ink/80">{booking.guests}</dd></div>
          <div><dt className="text-ink/50">Check-in</dt><dd className="font-medium text-ink/80">{formatDate(booking.check_in)}</dd></div>
          <div><dt className="text-ink/50">Check-out</dt><dd className="font-medium text-ink/80">{formatDate(booking.check_out)}</dd></div>
          <div><dt className="text-ink/50">Nights</dt><dd className="font-medium text-ink/80">{booking.nights}</dd></div>
          <div><dt className="text-ink/50">Total Amount</dt><dd className="font-medium text-ink/80">{formatInr(booking.total_amount)}</dd></div>
          <div><dt className="text-ink/50">Source</dt><dd className="font-medium text-ink/80">{booking.source}</dd></div>
          {booking.payment_ref && (
            <div><dt className="text-ink/50">Payment Ref</dt><dd className="font-medium text-ink/80">{booking.payment_ref}</dd></div>
          )}
          <div>
            <dt className="text-ink/50">WhatsApp Auto-Notify</dt>
            <dd className="font-medium text-ink/80">
              {booking.whatsapp_sent ? "Sent" : booking.whatsapp_error ? "Failed" : "Not sent"}
            </dd>
          </div>
        </dl>

        {booking.notes && (
          <div className="mt-4">
            <p className="text-ink/50 text-sm">Special Requests</p>
            <p className="mt-1 text-sm text-ink/80">{booking.notes}</p>
          </div>
        )}

        <p className="mt-4 text-xs text-ink/40">Booking ID: {booking.id}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-petrol-100 bg-white p-6 shadow-sm">
        <h3 className="font-sans text-base font-semibold text-ink">
          Update Status
        </h3>
        <div className="mt-3">
          <BookingStatusControl bookingId={booking.id} status={booking.status} />
        </div>
      </div>
    </div>
  );
}
