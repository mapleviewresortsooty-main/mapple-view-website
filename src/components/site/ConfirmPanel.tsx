"use client";

import { useState } from "react";
import Image from "next/image";
import { formatInr } from "@/lib/format";
import type { BookingStatus } from "@/lib/types";

export default function ConfirmPanel({
  bookingId,
  status: initialStatus,
  qrDataUrl,
  upiUri,
  upiId,
  amount,
  paymentConfigured,
  whatsappConfigured,
}: {
  bookingId: string;
  status: BookingStatus;
  qrDataUrl: string | null;
  upiUri: string | null;
  upiId: string;
  amount: number;
  paymentConfigured: boolean;
  whatsappConfigured: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [paymentRef, setPaymentRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifyState, setNotifyState] = useState<
    "idle" | "auto" | "manual" | "unavailable"
  >("idle");

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentRef }),
      });
      const data = (await res.json()) as {
        error?: string;
        booking?: { status: BookingStatus };
        whatsapp?: { autoSent?: boolean; link?: string | null };
      };
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setStatus(data.booking!.status);
      if (data.whatsapp?.autoSent) {
        setNotifyState("auto");
      } else if (data.whatsapp?.link) {
        setNotifyState("manual");
        window.open(data.whatsapp.link, "_blank", "noopener,noreferrer");
      } else {
        setNotifyState("unavailable");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "confirmed") {
    return (
      <div className="mt-8 rounded-xl bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-800">Booking Confirmed!</p>
        <p className="mt-1 text-sm text-green-700">
          Your stay has been confirmed by the resort. We look forward to hosting you.
        </p>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="mt-8 rounded-xl bg-red-50 p-6 text-center">
        <p className="text-lg font-semibold text-red-800">Booking Cancelled</p>
        <p className="mt-1 text-sm text-red-700">
          This booking has been cancelled. Please contact us if you have questions.
        </p>
      </div>
    );
  }

  if (status === "payment_claimed") {
    return (
      <div className="mt-8 rounded-xl bg-petrol-400/10 p-6 text-center ring-1 ring-petrol-400/40">
        <p className="text-lg font-semibold text-ink">
          Booking Request Sent
        </p>
        <p className="mt-1 text-sm text-ink/70">
          We&apos;ve received your payment confirmation and notified the resort.
          You&apos;ll receive a confirmation shortly.
        </p>
        {notifyState === "manual" && (
          <p className="mt-3 text-xs text-ink/50">
            If WhatsApp didn&apos;t open automatically, it may have been blocked by your
            browser. You can message the resort directly to confirm.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-petrol-100 pt-6">
      <h2 className="font-display text-lg font-semibold text-ink">
        Pay via UPI
      </h2>

      {!paymentConfigured ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Online payment isn&apos;t configured yet. Please contact the resort directly
          to complete your booking, or click confirm below to send your request.
        </p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-4 rounded-xl bg-petrol-50 p-6 sm:flex-row sm:items-start">
          {qrDataUrl && (
            <Image
              src={qrDataUrl}
              alt="UPI Payment QR Code"
              width={180}
              height={180}
              className="rounded-lg bg-white p-2 shadow-sm"
              unoptimized
            />
          )}
          <div className="text-center sm:text-left">
            <p className="text-sm text-ink/70">Scan with any UPI app</p>
            <p className="mt-1 font-mono text-sm font-semibold text-ink">
              {upiId}
            </p>
            <p className="mt-2 text-2xl font-bold text-ink">
              {formatInr(amount)}
            </p>
            {upiUri && (
              <a
                href={upiUri}
                className="mt-3 inline-block text-sm font-semibold text-petrol-600 underline sm:hidden"
              >
                Open in UPI App
              </a>
            )}
          </div>
        </div>
      )}

      <div className="mt-5">
        <label className="text-xs font-medium text-ink/60">
          UPI Transaction Reference <span className="text-ink/40">(optional)</span>
        </label>
        <input
          type="text"
          value={paymentRef}
          onChange={(e) => setPaymentRef(e.target.value)}
          placeholder="e.g. 123456789012"
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
        />
      </div>

      {!whatsappConfigured && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Note: The resort hasn&apos;t configured a WhatsApp number yet, so automatic
          notification may not be available.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        onClick={handleConfirm}
        disabled={submitting}
        className="mt-6 w-full rounded-full bg-petrol-500 px-6 py-3 text-sm font-semibold text-stone transition hover:bg-petrol-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Confirming..." : "I've Paid, Confirm Booking"}
      </button>
      <p className="mt-3 text-center text-xs text-ink/50">
        Clicking confirm notifies the resort of your booking and payment via WhatsApp.
      </p>
    </div>
  );
}
