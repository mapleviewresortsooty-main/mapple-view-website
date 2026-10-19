import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import type { Metadata } from "next";
import { getBookingById } from "@/lib/bookings";
import { getRoomById } from "@/lib/rooms";
import { getSettings } from "@/lib/settings";
import { formatInr, formatDateLong } from "@/lib/format";
import { buildUpiPaymentLink } from "@/lib/upi";
import { buildWhatsAppLink, bookingWhatsAppMessage } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Booking Confirmation | Mapple View Resort" };

export default async function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bookingId = Number(id);
  const booking = Number.isFinite(bookingId) ? getBookingById(bookingId) : null;
  if (!booking) notFound();

  const room = getRoomById(booking.room_id);
  if (!room) notFound();

  const settings = getSettings();

  const upiLink = buildUpiPaymentLink({
    payeeUpiId: settings.upi_id,
    payeeName: settings.upi_payee_name,
    amount: booking.total_amount,
    transactionNote: `Booking #${booking.id} - ${room.name}`,
  });
  const qrDataUrl = await QRCode.toDataURL(upiLink, { margin: 1, width: 260 });

  const whatsappLink = buildWhatsAppLink(
    settings.owner_phone,
    bookingWhatsAppMessage({
      hotelName: settings.hotel_name,
      roomName: room.name,
      guestName: booking.guest_name,
      guestPhone: booking.guest_phone,
      checkIn: formatDateLong(booking.check_in),
      checkOut: formatDateLong(booking.check_out),
      guestsCount: booking.guests_count,
      totalAmount: booking.total_amount,
      bookingId: booking.id,
    })
  );

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <div className="rounded-2xl border border-forest/10 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">Booking Requested</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Thank you, {booking.guest_name}!</h1>
        <p className="mt-2 text-ink-soft">
          Your request for <strong>{room.name}</strong> has been received. Complete the two steps below to secure
          it.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-ink-soft">Booking ID</dt>
          <dd className="text-right font-medium text-ink">#{booking.id}</dd>
          <dt className="text-ink-soft">Check-in</dt>
          <dd className="text-right font-medium text-ink">{formatDateLong(booking.check_in)}</dd>
          <dt className="text-ink-soft">Check-out</dt>
          <dd className="text-right font-medium text-ink">{formatDateLong(booking.check_out)}</dd>
          <dt className="text-ink-soft">Nights</dt>
          <dd className="text-right font-medium text-ink">{booking.nights}</dd>
          <dt className="text-ink-soft">Guests</dt>
          <dd className="text-right font-medium text-ink">{booking.guests_count}</dd>
          <dt className="font-semibold text-ink">Total</dt>
          <dd className="text-right font-display text-lg font-semibold text-terracotta">
            {formatInr(booking.total_amount)}
          </dd>
        </dl>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col items-center rounded-xl border border-forest/10 p-5 text-center">
            <p className="text-sm font-semibold text-forest">Step 1 · Pay via UPI</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="UPI payment QR code" className="mt-3 h-48 w-48" />
            <p className="mt-3 text-xs text-ink-soft">Scan with GPay, PhonePe, Paytm or any UPI app</p>
            <a href={upiLink} className="mt-2 text-xs font-semibold text-terracotta hover:underline">
              Or tap to open UPI app
            </a>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-forest/10 p-5 text-center">
            <p className="text-sm font-semibold text-forest">Step 2 · Confirm with us</p>
            <p className="mt-2 text-xs text-ink-soft">
              Send us your booking details on WhatsApp so we can confirm availability and your payment.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream hover:bg-forest-dark"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-ink-soft">
          Your booking stays <strong>pending</strong> until we confirm it. Keep this page or your WhatsApp chat for
          reference.
        </p>

        <div className="mt-6 text-center">
          <Link href="/rooms" className="text-sm font-semibold text-forest hover:underline">
            ← Back to rooms
          </Link>
        </div>
      </div>
    </div>
  );
}
