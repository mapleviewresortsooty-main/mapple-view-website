import "server-only";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "mapple-view.db");

declare global {
  var __mappleDb: DatabaseSync | undefined;
}

function openDb(): DatabaseSync {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const database = new DatabaseSync(DB_PATH);
  database.exec("PRAGMA busy_timeout = 5000;");
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  return database;
}

export const db = globalThis.__mappleDb ?? openDb();
if (process.env.NODE_ENV !== "production") {
  globalThis.__mappleDb = db;
}

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price_per_night INTEGER NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 2,
      amenities TEXT NOT NULL DEFAULT '[]',
      image_url TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL REFERENCES rooms(id),
      guest_name TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      guest_email TEXT NOT NULL DEFAULT '',
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      guests_count INTEGER NOT NULL DEFAULT 1,
      nights INTEGER NOT NULL,
      total_amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const adminHash = bcrypt.hashSync("changeme123", 10);
  db.prepare(
    "INSERT INTO admin_users (username, password_hash) VALUES (?, ?) ON CONFLICT(username) DO NOTHING"
  ).run("admin", adminHash);

  const defaultSettings: Record<string, string> = {
    hotel_name: "Mapple View Resort",
    tagline: "Wake up to the mountains, every morning.",
    address: "Mapple Valley Road, Near Pine Ridge, Himachal Pradesh, India",
    owner_phone: "919999999999",
    upi_id: "mapleviewresort@upi",
    upi_payee_name: "Mapple View Resort",
    contact_email: "stay@mappleviewresort.example",
    hero_image: "",
    about_text:
      "Mapple View Resort sits on a quiet hillside with sweeping valley views, home-style dining, and rooms built for slowing down. Family-run since day one, we look after every guest like they're staying with kin.",
  };
  const upsert = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING"
  );
  for (const [key, value] of Object.entries(defaultSettings)) {
    upsert.run(key, value);
  }

  {
    const insertRoom = db.prepare(`
      INSERT INTO rooms (slug, name, description, price_per_night, capacity, amenities, image_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO NOTHING
    `);
    const seedRooms = [
      {
        slug: "valley-view-deluxe",
        name: "Valley View Deluxe",
        description:
          "A bright, spacious room facing the valley, with a private balcony perfect for morning coffee and sunset views.",
        price: 4500,
        capacity: 2,
        amenities: ["Free Wi-Fi", "Balcony", "Valley View", "Hot Water", "Breakfast Included"],
      },
      {
        slug: "family-cottage",
        name: "Family Cottage",
        description:
          "A standalone cottage with two bedrooms, a sitting area, and a private garden patch — ideal for families and small groups.",
        price: 7500,
        capacity: 5,
        amenities: ["Free Wi-Fi", "Private Garden", "Two Bedrooms", "Kitchenette", "Breakfast Included"],
      },
      {
        slug: "pine-view-standard",
        name: "Pine View Standard",
        description:
          "A cosy, comfortable room surrounded by pine trees — great value for couples and solo travellers.",
        price: 2800,
        capacity: 2,
        amenities: ["Free Wi-Fi", "Hot Water", "Pine View", "Breakfast Included"],
      },
    ];
    for (const [i, room] of seedRooms.entries()) {
      insertRoom.run(
        room.slug,
        room.name,
        room.description,
        room.price,
        room.capacity,
        JSON.stringify(room.amenities),
        "",
        i
      );
    }
  }
}

migrate();
