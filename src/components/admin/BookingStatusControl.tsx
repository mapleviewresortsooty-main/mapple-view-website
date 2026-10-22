"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingStatus } from "@/lib/types";

const options: { value: BookingStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "payment_claimed", label: "Payment Claimed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BookingStatusControl({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(newStatus: BookingStatus) {
    if (newStatus === status) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Failed to update status. Please try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => updateStatus(o.value)}
            disabled={busy || o.value === status}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed ${
              o.value === status
                ? "bg-ink text-stone"
                : "bg-white text-ink-soft ring-1 ring-line hover:bg-petrol-50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
