import { endOfMonth, format, startOfMonth, startOfToday } from "date-fns";
import { BookingModel, RoomModel } from "@/lib/models";
import { formatInr, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

export default async function AdminReportsPage({
  searchParams,
}: PageProps<"/admin/reports">) {
  const sp = await searchParams;
  const today = startOfToday();
  const defaultFrom = format(startOfMonth(today), "yyyy-MM-dd");
  const defaultTo = format(endOfMonth(today), "yyyy-MM-dd");
  const from =
    typeof sp.from === "string" && sp.from
      ? sp.from
      : typeof sp.to === "string" && sp.to
        ? undefined
        : defaultFrom;
  const to =
    typeof sp.to === "string" && sp.to
      ? sp.to
      : typeof sp.from === "string" && sp.from
        ? undefined
        : defaultTo;
  const filters = { from, to };

  const [summary, revenueByRoom, billing, rooms] = await Promise.all([
    BookingModel.summary(filters),
    BookingModel.revenueByRoom(filters),
    BookingModel.billing(filters),
    RoomModel.idNames(),
  ]);
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  const exportHref = `/api/admin/reports/export?${new URLSearchParams({
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  })}`;

  const cards = [
    { label: "Bookings", value: summary.total },
    { label: "Confirmed", value: summary.confirmed },
    { label: "Pending", value: summary.pending },
    { label: "Cancelled", value: summary.cancelled },
    { label: "Confirmed Revenue", value: formatInr(summary.revenue) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-ink">Reports & Billing</h1>
          <p className="mt-1 text-sm text-ink/60">
            Revenue and booking activity, filtered by check-in date.
          </p>
        </div>
        <a
          href={exportHref}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-stone hover:bg-charcoal-light"
        >
          Export CSV
        </a>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-petrol-100 bg-white p-4 shadow-sm">
        <div>
          <label className="text-xs font-medium text-ink/60">Check-in From</label>
          <input
            type="date"
            name="from"
            defaultValue={from ?? ""}
            className="mt-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60">Check-in To</label>
          <input
            type="date"
            name="to"
            defaultValue={to ?? ""}
            className="mt-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-petrol-500 px-5 py-2.5 text-sm font-semibold text-stone hover:bg-petrol-600"
        >
          Apply Filter
        </button>
        {(from !== defaultFrom || to !== defaultTo) && (
          <a href="/admin/reports" className="text-sm font-medium text-ink-soft hover:underline">
            This month
          </a>
        )}
      </form>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-petrol-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{c.label}</p>
            <p className="mt-2 font-sans text-2xl font-bold text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-petrol-100 bg-white shadow-sm">
        <div className="border-b border-petrol-100 px-6 py-4">
          <h2 className="font-sans text-lg font-semibold text-ink">Revenue by Room</h2>
        </div>
        {revenueByRoom.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-ink/50">No rooms yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-petrol-100 text-xs uppercase text-ink/50">
                  <th className="px-6 py-3 font-medium">Room</th>
                  <th className="px-6 py-3 font-medium">Confirmed Bookings</th>
                  <th className="px-6 py-3 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenueByRoom.map((r) => (
                  <tr key={r.room_id} className="border-b border-petrol-50 last:border-0">
                    <td className="px-6 py-3 font-medium text-ink">{r.room_name}</td>
                    <td className="px-6 py-3 text-ink/70">{r.bookings}</td>
                    <td className="px-6 py-3 text-ink/70">{formatInr(r.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-petrol-100 bg-white shadow-sm">
        <div className="border-b border-petrol-100 px-6 py-4">
          <h2 className="font-sans text-lg font-semibold text-ink">Billing Detail</h2>
        </div>
        {billing.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-ink/50">No bookings in this range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-petrol-100 text-xs uppercase text-ink/50">
                  <th className="px-6 py-3 font-medium">Guest</th>
                  <th className="px-6 py-3 font-medium">Room</th>
                  <th className="px-6 py-3 font-medium">Dates</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Payment Ref</th>
                </tr>
              </thead>
              <tbody>
                {billing.map((b) => (
                  <tr key={b.id} className="border-b border-petrol-50 last:border-0">
                    <td className="px-6 py-3">
                      <p className="font-medium text-ink">{b.guest_name}</p>
                      <p className="text-xs text-ink/50">{b.guest_phone}</p>
                    </td>
                    <td className="px-6 py-3 text-ink/70">
                      {roomMap.get(b.room_id)?.name || "Unknown Room"}
                    </td>
                    <td className="px-6 py-3 text-ink/70">
                      {formatDate(b.check_in)} → {formatDate(b.check_out)}
                    </td>
                    <td className="px-6 py-3 text-ink/70">{formatInr(b.total_amount)}</td>
                    <td className="px-6 py-3 text-ink/70">{b.source}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-3 text-ink/60">{b.payment_ref || "—"}</td>
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
