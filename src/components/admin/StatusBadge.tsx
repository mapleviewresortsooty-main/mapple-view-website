import type { BookingStatus } from "@/lib/types";

const styles: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  payment_claimed: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const labels: Record<BookingStatus, string> = {
  pending: "Pending",
  payment_claimed: "Payment Claimed",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
