import { listBookings } from "@/lib/bookings";
import { formatInr, formatDateLong } from "@/lib/format";
import { BookingStatusControls } from "@/components/admin/booking-status-controls";

export default function AdminBookingsPage() {
  const bookings = listBookings();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-forest">Bookings</h1>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-forest/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-forest/5 text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-5 py-3">Guest</th>
              <th className="px-5 py-3">Room</th>
              <th className="px-5 py-3">Dates</th>
              <th className="px-5 py-3">Guests</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{booking.guest_name}</p>
                  <p className="text-xs text-ink-soft">{booking.guest_phone}</p>
                </td>
                <td className="px-5 py-4 text-ink-soft">{booking.room_name}</td>
                <td className="px-5 py-4 text-ink-soft">
                  {formatDateLong(booking.check_in)} → {formatDateLong(booking.check_out)}
                </td>
                <td className="px-5 py-4 text-ink-soft">{booking.guests_count}</td>
                <td className="px-5 py-4 text-ink-soft">{formatInr(booking.total_amount)}</td>
                <td className="px-5 py-4">
                  <BookingStatusControls bookingId={booking.id} status={booking.status} />
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink-soft">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
