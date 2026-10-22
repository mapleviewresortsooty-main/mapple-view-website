export type BookingStatus =
  | "pending"
  | "payment_claimed"
  | "confirmed"
  | "cancelled";

export interface Room {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  price_per_night: number;
  max_guests: number;
  bed_type: string;
  size_sqft: number;
  images: string[];
  amenities: string[];
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  room_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total_amount: number;
  status: BookingStatus;
  payment_ref: string;
  notes: string;
  source: string;
  whatsapp_sent: number;
  whatsapp_error: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: number;
  resort_name: string;
  tagline: string;
  description: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  hero_image: string;
  upi_id: string;
  upi_payee_name: string;
  whatsapp_owner_number: string;
  whatsapp_api_token: string;
  whatsapp_phone_number_id: string;
  check_in_time: string;
  check_out_time: string;
  about_content: string;
  escape_intro: string;
  brand_story: string;
  testimonials: string;
  instagram_handle: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}
