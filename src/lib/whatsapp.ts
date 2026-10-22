import type { Booking, Room, Settings } from "@/lib/types";

function normalizePhoneForWa(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  return digits;
}

export function buildBookingMessage(booking: Booking, room: Room) {
  const lines = [
    `New Booking Request - Mapple View Resort`,
    ``,
    `Room: ${room.name}`,
    `Guest: ${booking.guest_name}`,
    `Phone: ${booking.guest_phone}`,
    booking.guest_email ? `Email: ${booking.guest_email}` : undefined,
    `Check-in: ${booking.check_in}`,
    `Check-out: ${booking.check_out}`,
    `Guests: ${booking.guests}`,
    `Nights: ${booking.nights}`,
    `Total Amount: ₹${booking.total_amount}`,
    booking.payment_ref ? `Payment Ref: ${booking.payment_ref}` : `Payment: Marked as paid by guest (please verify)`,
    booking.notes ? `Notes: ${booking.notes}` : undefined,
    ``,
    `Booking ID: ${booking.id}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function buildOwnerWhatsappLink(settings: Settings, message: string) {
  const number = normalizePhoneForWa(settings.whatsapp_owner_number);
  if (!number) return null;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

export async function sendWhatsappCloudApi(
  settings: Settings,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  if (!settings.whatsapp_api_token || !settings.whatsapp_phone_number_id) {
    return { ok: false, error: "cloud_api_not_configured" };
  }
  const toNumber = normalizePhoneForWa(settings.whatsapp_owner_number);
  if (!toNumber) {
    return { ok: false, error: "owner_number_not_configured" };
  }
  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${settings.whatsapp_phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.whatsapp_api_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: toNumber,
          type: "text",
          text: { body: message },
        }),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `whatsapp_api_error: ${res.status} ${text}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown_error",
    };
  }
}
