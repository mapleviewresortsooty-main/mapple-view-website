import { z } from "zod";

export const BookingFormSchema = z
  .object({
    room_id: z.coerce.number().int().positive(),
    guest_name: z.string().trim().min(2, "Enter your full name").max(120),
    guest_phone: z
      .string()
      .trim()
      .regex(/^[0-9+\s-]{7,20}$/, "Enter a valid phone number"),
    guest_email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]),
    check_in: z.string().trim().min(1, "Select a check-in date"),
    check_out: z.string().trim().min(1, "Select a check-out date"),
    guests_count: z.coerce.number().int().min(1, "At least 1 guest").max(20),
    notes: z.string().trim().max(500).optional().default(""),
  })
  .refine((data) => new Date(data.check_out) > new Date(data.check_in), {
    message: "Check-out must be after check-in",
    path: ["check_out"],
  });

export const LoginFormSchema = z.object({
  username: z.string().trim().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

export const RoomFormSchema = z.object({
  name: z.string().trim().min(2, "Name required").max(120),
  slug: z
    .string()
    .trim()
    .min(2, "Slug required")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  description: z.string().trim().max(2000).default(""),
  price_per_night: z.coerce.number().int().positive("Enter a valid price"),
  capacity: z.coerce.number().int().min(1).max(30),
  amenities: z.string().trim().default(""),
  image_url: z.union([z.literal(""), z.string().trim().url("Enter a valid URL")]),
  is_active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
});

export const SettingsFormSchema = z.object({
  hotel_name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(200).default(""),
  address: z.string().trim().max(300).default(""),
  owner_phone: z
    .string()
    .trim()
    .regex(/^[0-9]{7,15}$/, "Enter phone as country code + number, digits only"),
  upi_id: z.string().trim().min(3).max(80),
  upi_payee_name: z.string().trim().min(1).max(120),
  contact_email: z.union([z.literal(""), z.string().trim().email()]),
  hero_image: z.union([z.literal(""), z.string().trim().url("Enter a valid URL")]),
  about_text: z.string().trim().max(4000).default(""),
});
