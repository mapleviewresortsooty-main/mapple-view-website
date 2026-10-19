import "server-only";
import { db } from "@/lib/db";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: number;
  room_id: number;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  nights: number;
  total_amount: number;
  status: BookingStatus;
  notes: string;
  created_at: string;
};

export type BookingInput = {
  room_id: number;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  nights: number;
  total_amount: number;
  notes: string;
};

export function createBooking(input: BookingInput): number {
  const result = db
    .prepare(
      `INSERT INTO bookings
        (room_id, guest_name, guest_phone, guest_email, check_in, check_out, guests_count, nights, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.room_id,
      input.guest_name,
      input.guest_phone,
      input.guest_email,
      input.check_in,
      input.check_out,
      input.guests_count,
      input.nights,
      input.total_amount,
      input.notes
    );
  return Number(result.lastInsertRowid);
}

export function getBookingById(id: number): Booking | null {
  const row = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as Booking | undefined;
  return row ?? null;
}

export function listBookings(): (Booking & { room_name: string })[] {
  return db
    .prepare(
      `SELECT bookings.*, rooms.name as room_name
       FROM bookings JOIN rooms ON rooms.id = bookings.room_id
       ORDER BY bookings.created_at DESC`
    )
    .all() as (Booking & { room_name: string })[];
}

export function updateBookingStatus(id: number, status: BookingStatus): void {
  db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, id);
}
