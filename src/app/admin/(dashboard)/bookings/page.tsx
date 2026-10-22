import { addDays, endOfMonth, format, startOfMonth, startOfToday } from "date-fns";
import BookingCalendar from "@/components/admin/BookingCalendar";
import { BookingModel, RoomModel } from "@/lib/models";

export default async function AdminBookingsPage() {
  const today = startOfToday();
  const from = format(startOfMonth(today), "yyyy-MM-dd");
  const to = format(addDays(endOfMonth(today), 1), "yyyy-MM-dd");

  const [rooms, bookings] = await Promise.all([
    RoomModel.forCalendar(),
    BookingModel.forCalendar(from, to),
  ]);

  return (
    <div className="min-w-0 w-full max-w-full">
      <div className="min-w-0">
        <h1 className="font-sans text-xl font-bold text-ink sm:text-2xl">Bookings</h1>
        <p className="mt-1 text-sm text-ink/60">
          See all rooms by day, mark stays, and free dates by cancelling.
        </p>
      </div>

      <div className="mt-4 min-w-0 sm:mt-6">
        <BookingCalendar
          initialRooms={rooms}
          initialBookings={bookings}
          initialMonth={from}
        />
      </div>
    </div>
  );
}
