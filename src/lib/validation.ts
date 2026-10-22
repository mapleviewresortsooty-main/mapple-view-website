import { z } from "zod";

export const createBookingSchema = z
  .object({
    roomId: z.string().min(1),
    guestName: z.string().trim().min(2, "Name is required"),
    guestPhone: z
      .string()
      .trim()
      .min(7, "A valid phone number is required")
      .max(20),
    guestEmail: z
      .union([z.string().trim().email(), z.literal("")])
      .optional()
      .default(""),
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
    guests: z.coerce.number().int().min(1).max(20),
    notes: z.string().trim().max(1000).optional().default(""),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export const confirmBookingSchema = z.object({
  paymentRef: z.string().trim().max(200).optional().default(""),
});

export const roomSchema = z.object({
  name: z.string().trim().min(2),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens"),
  summary: z.string().trim().max(300).optional().default(""),
  description: z.string().trim().max(5000).optional().default(""),
  pricePerNight: z.coerce.number().int().min(0),
  maxGuests: z.coerce.number().int().min(1).max(50),
  bedType: z.string().trim().max(100).optional().default(""),
  sizeSqft: z.coerce.number().int().min(0).optional().default(0),
  images: z.array(z.string()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().optional().default(0),
});

// A field with `.default()` gets that default filled in by `.partial()`
// whenever the field is simply omitted from the request body — it does
// NOT stay `undefined`. Using `roomSchema.partial()` for partial updates
// (e.g. RoomActions toggling only `isActive`) would silently reset every
// other defaulted field (summary, description, images, amenities, ...)
// back to empty on every request. This schema has no defaults, so an
// omitted field parses to `undefined` and RoomModel.update's `?? existing.x`
// merge leaves it untouched.
export const roomUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens")
    .optional(),
  summary: z.string().trim().max(300).optional(),
  description: z.string().trim().max(5000).optional(),
  pricePerNight: z.coerce.number().int().min(0).optional(),
  maxGuests: z.coerce.number().int().min(1).max(50).optional(),
  bedType: z.string().trim().max(100).optional(),
  sizeSqft: z.coerce.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const settingsSchema = z.object({
  resortName: z.string().trim().min(1),
  tagline: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
  address: z.string().trim().optional().default(""),
  contactPhone: z.string().trim().optional().default(""),
  contactEmail: z.union([z.string().trim().email(), z.literal("")]).optional().default(""),
  heroImage: z.string().trim().optional().default(""),
  upiId: z.string().trim().optional().default(""),
  upiPayeeName: z.string().trim().optional().default(""),
  whatsappOwnerNumber: z.string().trim().optional().default(""),
  whatsappApiToken: z.string().trim().optional().default(""),
  whatsappPhoneNumberId: z.string().trim().optional().default(""),
  checkInTime: z.string().trim().optional().default(""),
  checkOutTime: z.string().trim().optional().default(""),
  aboutContent: z.string().trim().max(8000).optional().default(""),
  escapeIntro: z.string().trim().max(2000).optional().default(""),
  brandStory: z.string().trim().max(4000).optional().default(""),
  // One guest quote per line, formatted "Quote text | Guest Name, Location".
  // Shown on the homepage only when non-empty, so nothing fabricated ships
  // until the resort supplies real guest feedback.
  testimonials: z.string().trim().max(4000).optional().default(""),
  instagramHandle: z.string().trim().max(60).optional().default(""),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export const bookingStatusSchema = z.object({
  status: z.enum(["pending", "payment_claimed", "confirmed", "cancelled"]),
});

// Used by the admin calendar create-booking flow to record a booking from
// another platform (for billing/reports) and block those dates on the site
// in one step. Deliberately more lenient than the guest-facing
// createBookingSchema: phone/email aren't always known for an OTA booking,
// and the admin sets amount/status/source directly.
export const adminCreateBookingSchema = z
  .object({
    roomId: z.string().min(1),
    guestName: z.string().trim().min(2, "Name is required"),
    guestPhone: z.string().trim().max(20).optional().default(""),
    guestEmail: z
      .union([z.string().trim().email(), z.literal("")])
      .optional()
      .default(""),
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
    guests: z.coerce.number().int().min(1).max(20).optional().default(1),
    totalAmount: z.coerce.number().int().min(0),
    status: z
      .enum(["pending", "payment_claimed", "confirmed", "cancelled"])
      .optional()
      .default("confirmed"),
    source: z.string().trim().min(1).max(50).optional().default("Other"),
    notes: z.string().trim().max(1000).optional().default(""),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
