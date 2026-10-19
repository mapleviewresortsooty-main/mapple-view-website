export function buildWhatsAppLink(phoneDigitsOnly: string, message: string): string {
  const phone = phoneDigitsOnly.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function bookingWhatsAppMessage(params: {
  hotelName: string;
  roomName: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalAmount: number;
  bookingId: number;
}): string {
  const { hotelName, roomName, guestName, guestPhone, checkIn, checkOut, guestsCount, totalAmount, bookingId } =
    params;
  return [
    `New booking request #${bookingId} for ${hotelName}`,
    `Room: ${roomName}`,
    `Guest: ${guestName} (${guestPhone})`,
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    `Guests: ${guestsCount}`,
    `Total: ₹${totalAmount.toLocaleString("en-IN")}`,
    ``,
    `Please confirm availability.`,
  ].join("\n");
}
