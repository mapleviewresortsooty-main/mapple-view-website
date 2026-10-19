"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/dal";
import { updateBookingStatus, type BookingStatus } from "@/lib/bookings";

export async function updateBookingStatusAction(bookingId: number, status: BookingStatus): Promise<void> {
  await verifyAdminSession();
  updateBookingStatus(bookingId, status);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}
