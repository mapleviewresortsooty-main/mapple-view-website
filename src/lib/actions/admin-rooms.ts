"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/dal";
import { createRoom, updateRoom, deleteRoom, getRoomBySlug } from "@/lib/rooms";
import { RoomFormSchema } from "@/lib/validation";

export type RoomFormState = { error?: string } | undefined;

function parseAmenities(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createRoomAction(_prevState: RoomFormState, formData: FormData): Promise<RoomFormState> {
  await verifyAdminSession();

  const parsed = RoomFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price_per_night: formData.get("price_per_night"),
    capacity: formData.get("capacity"),
    amenities: formData.get("amenities"),
    image_url: formData.get("image_url"),
    is_active: formData.get("is_active") === "on",
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  if (getRoomBySlug(parsed.data.slug)) {
    return { error: "A room with this slug already exists." };
  }

  createRoom({ ...parsed.data, amenities: parseAmenities(parsed.data.amenities) });
  revalidatePath("/admin/rooms");
  revalidatePath("/rooms");
  revalidatePath("/");
  redirect("/admin/rooms");
}

export async function updateRoomAction(
  roomId: number,
  _prevState: RoomFormState,
  formData: FormData
): Promise<RoomFormState> {
  await verifyAdminSession();

  const parsed = RoomFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price_per_night: formData.get("price_per_night"),
    capacity: formData.get("capacity"),
    amenities: formData.get("amenities"),
    image_url: formData.get("image_url"),
    is_active: formData.get("is_active") === "on",
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const existing = getRoomBySlug(parsed.data.slug);
  if (existing && existing.id !== roomId) {
    return { error: "A room with this slug already exists." };
  }

  updateRoom(roomId, { ...parsed.data, amenities: parseAmenities(parsed.data.amenities) });
  revalidatePath("/admin/rooms");
  revalidatePath("/rooms");
  revalidatePath("/");
  redirect("/admin/rooms");
}

export async function deleteRoomAction(roomId: number): Promise<{ error?: string }> {
  await verifyAdminSession();
  try {
    deleteRoom(roomId);
  } catch {
    return { error: "Can't delete a room that has bookings. Deactivate it instead." };
  }
  revalidatePath("/admin/rooms");
  revalidatePath("/rooms");
  revalidatePath("/");
  return {};
}
