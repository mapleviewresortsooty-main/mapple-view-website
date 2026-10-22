import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingModel, RoomModel } from "@/lib/models";
import { getSiteSettings } from "@/lib/site-data";
import { buildUpiQrDataUrl, buildUpiUri } from "@/lib/upi";
import { formatInr, formatDate } from "@/lib/format";
import ConfirmPanel from "@/components/site/ConfirmPanel";

export const metadata: Metadata = { title: "Complete Your Booking | Mapple View Resort" };

export default async function BookingPaymentPage({
  params,
}: PageProps<"/booking/[id]">) {
  const { id } = await params;
  const booking = await BookingModel.byId(id);
  if (!booking) notFound();
  const [room, settings] = await Promise.all([
    RoomModel.byId(booking.room_id),
    getSiteSettings(),
  ]);
  if (!room) notFound();

  const needsPayment =
    booking.status === "pending" || booking.status === "payment_claimed";

  let qrDataUrl: string | null = null;
  let upiUri: string | null = null;
  if (needsPayment && settings.upi_id) {
    const upiParams = {
      upiId: settings.upi_id,
      payeeName: settings.upi_payee_name || settings.resort_name,
      amount: booking.total_amount,
      note: `Booking ${booking.id.slice(0, 8)}`,
    };
    qrDataUrl = await buildUpiQrDataUrl(upiParams);
    upiUri = buildUpiUri(upiParams);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="rounded-2xl border border-petrol-100 bg-white p-6 shadow-sm sm:p-8">
        <span className="text-sm font-semibold uppercase tracking-widest text-petrol-600">
          Booking Summary
        </span>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
          {room.name}
        </h1>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ink/50">Check-in</dt>
            <dd className="font-medium text-ink/80">{formatDate(booking.check_in)}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Check-out</dt>
            <dd className="font-medium text-ink/80">{formatDate(booking.check_out)}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Nights</dt>
            <dd className="font-medium text-ink/80">{booking.nights}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Guests</dt>
            <dd className="font-medium text-ink/80">{booking.guests}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Guest Name</dt>
            <dd className="font-medium text-ink/80">{booking.guest_name}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Phone</dt>
            <dd className="font-medium text-ink/80">{booking.guest_phone}</dd>
          </div>
        </dl>

        <div className="mt-6 flex items-center justify-between rounded-xl bg-petrol-50 px-5 py-4">
          <span className="font-medium text-ink">Total Amount</span>
          <span className="font-display text-2xl font-bold text-ink">
            {formatInr(booking.total_amount)}
          </span>
        </div>

        <ConfirmPanel
          bookingId={booking.id}
          status={booking.status}
          qrDataUrl={qrDataUrl}
          upiUri={upiUri}
          upiId={settings.upi_id}
          amount={booking.total_amount}
          paymentConfigured={Boolean(settings.upi_id)}
          whatsappConfigured={Boolean(settings.whatsapp_owner_number)}
        />
      </div>
    </div>
  );
}
