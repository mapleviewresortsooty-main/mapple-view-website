import "server-only";
import { db } from "@/lib/db";

export type Settings = {
  hotel_name: string;
  tagline: string;
  address: string;
  owner_phone: string;
  upi_id: string;
  upi_payee_name: string;
  contact_email: string;
  hero_image: string;
  about_text: string;
};

const KEYS: (keyof Settings)[] = [
  "hotel_name",
  "tagline",
  "address",
  "owner_phone",
  "upi_id",
  "upi_payee_name",
  "contact_email",
  "hero_image",
  "about_text",
];

export function getSettings(): Settings {
  const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const settings = {} as Settings;
  for (const key of KEYS) {
    settings[key] = map.get(key) ?? "";
  }
  return settings;
}

export function updateSettings(input: Partial<Settings>): void {
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  for (const key of KEYS) {
    if (input[key] !== undefined) {
      upsert.run(key, input[key]);
    }
  }
}
