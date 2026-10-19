import Link from "next/link";
import { listAllRooms } from "@/lib/rooms";
import { listBookings } from "@/lib/bookings";
import { formatInr } from "@/lib/format";

export default function AdminDashboardPage() {
  const rooms = listAllRooms();
  const bookings = listBookings();

  const pending = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const revenue = confirmed.reduce((sum, b) => sum + b.total_amount, 0);

  const stats = [
    { label: "Active rooms", value: rooms.filter((r) => r.is_active).length },
    { label: "Pending bookings", value: pending.length },
    { label: "Confirmed bookings", value: confirmed.length },
    { label: "Confirmed revenue", value: formatInr(revenue) },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-forest">Dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-forest/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wide text-ink-soft">{stat.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-forest">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-forest/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-forest">Recent bookings</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-forest hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-4 flex flex-col divide-y divide-forest/10">
          {bookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-ink">{booking.guest_name}</p>
                <p className="text-ink-soft">{booking.room_name}</p>
              </div>
              <span className="text-ink-soft">{formatInr(booking.total_amount)}</span>
              <span className="rounded-full bg-forest/5 px-3 py-1 text-xs font-semibold uppercase text-forest">
                {booking.status}
              </span>
            </div>
          ))}
          {bookings.length === 0 && <p className="py-4 text-sm text-ink-soft">No bookings yet.</p>}
        </div>
      </div>
    </div>
  );
}
