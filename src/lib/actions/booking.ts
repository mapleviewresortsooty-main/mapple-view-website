"use server";

import { redirect } from "next/navigation";
import { getRoomById } from "@/lib/rooms";
import { createBooking } from "@/lib/bookings";
import { BookingFormSchema } from "@/lib/validation";

export type BookingState = { error?: string } | undefined;

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export async function createBookingAction(_prevState: BookingState, formData: FormData): Promise<BookingState> {
  const parsed = BookingFormSchema.safeParse({
    room_id: formData.get("room_id"),
    guest_name: formData.get("guest_name"),
    guest_phone: formData.get("guest_phone"),
    guest_email: formData.get("guest_email"),
    check_in: formData.get("check_in"),
    check_out: formData.get("check_out"),
    guests_count: formData.get("guests_count"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const data = parsed.data;
  const room = getRoomById(data.room_id);
  if (!room || !room.is_active) {
    return { error: "This room is no longer available." };
  }

  const nights = nightsBetween(data.check_in, data.check_out);
  if (nights < 1) {
    return { error: "Check-out must be after check-in." };
  }
  if (data.guests_count > room.capacity) {
    return { error: `This room fits up to ${room.capacity} guests.` };
  }

  const totalAmount = nights * room.price_per_night;

  const bookingId = createBooking({
    room_id: room.id,
    guest_name: data.guest_name,
    guest_phone: data.guest_phone,
    guest_email: data.guest_email,
    check_in: data.check_in,
    check_out: data.check_out,
    guests_count: data.guests_count,
    nights,
    total_amount: totalAmount,
    notes: data.notes ?? "",
  });

  redirect(`/booking/confirmation/${bookingId}`);
}
