import Link from "next/link";
import { BookingModel, RoomModel } from "@/lib/models";
import { formatInr, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

export default async function AdminDashboardPage() {
  const [stats, recentBookings, rooms] = await Promise.all([
    BookingModel.stats(),
    BookingModel.recent(6),
    RoomModel.idNames(),
  ]);
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  const cards = [
    { label: "Total Bookings", value: stats.total },
    { label: "Pending Action", value: stats.pending },
    { label: "Confirmed Stays", value: stats.confirmed },
    { label: "Confirmed Revenue", value: formatInr(stats.revenue) },
  ];

  return (
    <div>
      <h1 className="font-sans text-2xl font-bold text-ink">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Overview of your resort&apos;s bookings and performance.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-petrol-100 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              {c.label}
            </p>
            <p className="mt-2 font-sans text-2xl font-bold text-ink">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-petrol-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-petrol-100 px-6 py-4">
          <h2 className="font-sans text-lg font-semibold text-ink">
            Recent Bookings
          </h2>
          <Link href="/admin/bookings" className="text-sm font-medium text-petrol-600 hover:underline">
            View all
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-ink/50">
            No bookings yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-petrol-100 text-xs uppercase text-ink/50">
                  <th className="px-6 py-3 font-medium">Guest</th>
                  <th className="px-6 py-3 font-medium">Room</th>
                  <th className="px-6 py-3 font-medium">Dates</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-petrol-50 last:border-0">
                    <td className="px-6 py-3">
                      <Link href={`/admin/bookings/${b.id}`} className="font-medium text-ink hover:underline">
                        {b.guest_name}
                      </Link>
                      <p className="text-xs text-ink/50">{b.guest_phone}</p>
                    </td>
                    <td className="px-6 py-3 text-ink/70">
                      {roomMap.get(b.room_id)?.name || "—"}
                    </td>
                    <td className="px-6 py-3 text-ink/70">
                      {formatDate(b.check_in)} → {formatDate(b.check_out)}
                    </td>
                    <td className="px-6 py-3 text-ink/70">{formatInr(b.total_amount)}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
