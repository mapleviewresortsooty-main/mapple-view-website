import "server-only";
import { db } from "@/lib/db";

export type Room = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  image_url: string;
  is_active: number;
  sort_order: number;
  created_at: string;
};

type RoomRow = Omit<Room, "amenities"> & { amenities: string };

function parseRoom(row: RoomRow): Room {
  return { ...row, amenities: JSON.parse(row.amenities) as string[] };
}

export function listActiveRooms(): Room[] {
  const rows = db
    .prepare("SELECT * FROM rooms WHERE is_active = 1 ORDER BY sort_order ASC, id ASC")
    .all() as RoomRow[];
  return rows.map(parseRoom);
}

export function listAllRooms(): Room[] {
  const rows = db.prepare("SELECT * FROM rooms ORDER BY sort_order ASC, id ASC").all() as RoomRow[];
  return rows.map(parseRoom);
}

export function getRoomBySlug(slug: string): Room | null {
  const row = db.prepare("SELECT * FROM rooms WHERE slug = ?").get(slug) as RoomRow | undefined;
  return row ? parseRoom(row) : null;
}

export function getRoomById(id: number): Room | null {
  const row = db.prepare("SELECT * FROM rooms WHERE id = ?").get(id) as RoomRow | undefined;
  return row ? parseRoom(row) : null;
}

export type RoomInput = {
  slug: string;
  name: string;
  description: string;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  image_url: string;
  is_active: boolean;
  sort_order: number;
};

export function createRoom(input: RoomInput): number {
  const result = db
    .prepare(
      `INSERT INTO rooms (slug, name, description, price_per_night, capacity, amenities, image_url, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.slug,
      input.name,
      input.description,
      input.price_per_night,
      input.capacity,
      JSON.stringify(input.amenities),
      input.image_url,
      input.is_active ? 1 : 0,
      input.sort_order
    );
  return Number(result.lastInsertRowid);
}

export function updateRoom(id: number, input: RoomInput): void {
  db.prepare(
    `UPDATE rooms SET slug = ?, name = ?, description = ?, price_per_night = ?, capacity = ?,
     amenities = ?, image_url = ?, is_active = ?, sort_order = ? WHERE id = ?`
  ).run(
    input.slug,
    input.name,
    input.description,
    input.price_per_night,
    input.capacity,
    JSON.stringify(input.amenities),
    input.image_url,
    input.is_active ? 1 : 0,
    input.sort_order,
    id
  );
}

export function deleteRoom(id: number): void {
  db.prepare("DELETE FROM rooms WHERE id = ?").run(id);
}
