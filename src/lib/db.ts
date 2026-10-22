import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { stockImages, stockRoomImage } from "@/lib/stockImages";
import { RESORT_LOCATION } from "@/lib/location";

type SqlClient = ReturnType<typeof neon<false, false>>;

declare global {
  var __mapple_migrated__: Promise<void> | undefined;
  var __mapple_sql__: SqlClient | undefined;
}

/** Bump when runMigration gains new required steps (indexes, columns, etc.). */
const SCHEMA_VERSION = 2;

// Lazy: Next.js's build-time "collecting page data" step imports every API
// route module (including this one, transitively) just to inspect its
// exports — it never calls into the database. Reading DATABASE_URL and
// throwing at module scope made that build step fail even when nothing was
// actually querying the database. Deferring the check until the client is
// first used means the build only needs a real DATABASE_URL when a request
// actually runs.
function getSql(): SqlClient {
  if (!globalThis.__mapple_sql__) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. In Cloudflare, set it with `wrangler secret put DATABASE_URL` " +
          "(the pooled connection string from your Neon project). Locally, put it in .env.local."
      );
    }
    globalThis.__mapple_sql__ = neon(connectionString);
  }
  return globalThis.__mapple_sql__;
}

export const sql: SqlClient = new Proxy({} as SqlClient, {
  get(_target, prop) {
    const client = getSql();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

async function getSchemaVersion(): Promise<number> {
  try {
    const rows = (await sql.query(
      "SELECT version FROM schema_meta WHERE id = 1"
    )) as { version: number }[];
    return rows[0]?.version ?? 0;
  } catch {
    return 0;
  }
}

async function setSchemaVersion(version: number) {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS schema_meta (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version INTEGER NOT NULL
    )
  `);
  await sql.query(
    `INSERT INTO schema_meta (id, version) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET version = EXCLUDED.version`,
    [version]
  );
}

async function runMigration() {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      resort_name TEXT NOT NULL DEFAULT 'Mapple View Resort',
      tagline TEXT NOT NULL DEFAULT 'Your Mountain Escape Awaits',
      description TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      contact_phone TEXT NOT NULL DEFAULT '',
      contact_email TEXT NOT NULL DEFAULT '',
      hero_image TEXT NOT NULL DEFAULT '',
      upi_id TEXT NOT NULL DEFAULT '',
      upi_payee_name TEXT NOT NULL DEFAULT '',
      whatsapp_owner_number TEXT NOT NULL DEFAULT '',
      whatsapp_api_token TEXT NOT NULL DEFAULT '',
      whatsapp_phone_number_id TEXT NOT NULL DEFAULT '',
      check_in_time TEXT NOT NULL DEFAULT '12:00 PM',
      check_out_time TEXT NOT NULL DEFAULT '11:00 AM',
      about_content TEXT NOT NULL DEFAULT '',
      escape_intro TEXT NOT NULL DEFAULT '',
      brand_story TEXT NOT NULL DEFAULT '',
      testimonials TEXT NOT NULL DEFAULT '',
      instagram_handle TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  // CREATE TABLE IF NOT EXISTS above is a no-op against an already-existing
  // settings table (this site's already-deployed database included), so a
  // newly added column needs its own migration step to actually land there.
  await sql.query(
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_content TEXT NOT NULL DEFAULT ''`
  );
  await sql.query(
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS escape_intro TEXT NOT NULL DEFAULT ''`
  );
  await sql.query(
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS brand_story TEXT NOT NULL DEFAULT ''`
  );
  await sql.query(
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS testimonials TEXT NOT NULL DEFAULT ''`
  );
  await sql.query(
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS instagram_handle TEXT NOT NULL DEFAULT ''`
  );

  await sql.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      price_per_night INTEGER NOT NULL DEFAULT 0,
      max_guests INTEGER NOT NULL DEFAULT 2,
      bed_type TEXT NOT NULL DEFAULT '',
      size_sqft INTEGER NOT NULL DEFAULT 0,
      images TEXT NOT NULL DEFAULT '[]',
      amenities TEXT NOT NULL DEFAULT '[]',
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
      guest_name TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      guest_email TEXT NOT NULL DEFAULT '',
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      nights INTEGER NOT NULL DEFAULT 1,
      total_amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_ref TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'Website',
      whatsapp_sent INTEGER NOT NULL DEFAULT 0,
      whatsapp_error TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  // Same reasoning as about_content above: ALTER is needed for a database
  // that already ran CREATE TABLE IF NOT EXISTS before this column existed.
  await sql.query(
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'Website'`
  );

  await sql.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await sql.query(`CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`);
  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_bookings_active_range
    ON bookings (check_in, check_out)
    WHERE status <> 'cancelled'
  `);

  await sql.query(
    `INSERT INTO settings (id, resort_name, tagline, description, address, contact_phone, contact_email, hero_image, upi_id, upi_payee_name, whatsapp_owner_number, about_content, escape_intro, brand_story)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (id) DO NOTHING`,
    [
      "Mapple View Resort",
      "Your Mountain Escape Awaits",
      "Nestled in Lovedale, on the quiet edge of Ooty, Mapple View Resort offers a peaceful retreat amid the Nilgiri hills, with breathtaking views, comfortable rooms, and warm hospitality.",
      RESORT_LOCATION.address,
      "+91 98765 43210",
      "info@mapleviewresort.com",
      "",
      "",
      "Mapple View Resort",
      "",
      "Mapple View Resort sits in Lovedale, a quiet, wooded locality on the outskirts of Ooty in Tamil Nadu's Nilgiri hills, home to the historic Lawrence School and some of the region's most peaceful, untouched scenery.\n\nAt over 2,200 metres above sea level, the air here stays cool and fresh through the year, wrapped in eucalyptus and shola forest, tea gardens, and rolling grasslands. It is a landscape built for slowing down: misty mornings, long walks, and evenings by the fire.\n\nOur rooms are simple and comfortable by design, so the views outside your window do the talking. Whether you are here to explore the Nilgiris or simply to rest, we look after the details so you do not have to.",
      "Set back from Ooty's busier lanes, Mapple View is a quiet base among the hills of Lovedale — close enough to reach everything worth seeing, far enough to hear very little besides wind in the eucalyptus.",
      "Mapple View Resort was built around one idea: that a mountain stay should feel unhurried. Simple, comfortable rooms; a quiet hillside setting; and the kind of attentive, low-key hospitality that lets the Nilgiris do most of the talking.",
    ]
  );

  const adminRows = await sql.query("SELECT id FROM admin_users LIMIT 1");
  if (adminRows.length === 0) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "changeme123";
    const hash = bcrypt.hashSync(password, 10);
    await sql.query(
      "INSERT INTO admin_users (id, username, password_hash) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING",
      [crypto.randomUUID(), username, hash]
    );
    if (!process.env.ADMIN_PASSWORD) {
      console.warn(
        `\n[Mapple View Resort] No ADMIN_PASSWORD set. Created default admin user "${username}" / "${password}". Please change this immediately in Admin > Settings or via env vars.\n`
      );
    }
  }

  const countRows = (await sql.query("SELECT COUNT(*)::int as count FROM rooms")) as {
    count: number;
  }[];
  if (countRows[0]?.count === 0) {
    const sampleRooms = [
      {
        name: "Deluxe Valley View Room",
        slug: "deluxe-valley-view-room",
        summary: "Spacious room with a private balcony overlooking the valley.",
        description:
          "Wake up to stunning valley views from your private balcony. This deluxe room features a king-size bed, modern en-suite bathroom, and thoughtful amenities for a relaxing stay.",
        price_per_night: 4500,
        max_guests: 3,
        bed_type: "King Bed",
        size_sqft: 320,
        images: JSON.stringify([stockImages.rooms[0]]),
        amenities: JSON.stringify([
          "Free Wi-Fi",
          "Valley View Balcony",
          "Air Conditioning",
          "Complimentary Breakfast",
          "Flat-screen TV",
          "Hot Water",
        ]),
        sort_order: 1,
      },
      {
        name: "Premium Mountain Suite",
        slug: "premium-mountain-suite",
        summary: "Our largest suite with a living area and panoramic mountain views.",
        description:
          "The Premium Mountain Suite offers a separate living area, panoramic mountain views, and premium furnishings, perfect for families or those seeking extra space and comfort.",
        price_per_night: 7500,
        max_guests: 4,
        bed_type: "King Bed + Sofa Bed",
        size_sqft: 500,
        images: JSON.stringify([stockImages.rooms[1]]),
        amenities: JSON.stringify([
          "Free Wi-Fi",
          "Living Area",
          "Mountain View",
          "Air Conditioning",
          "Complimentary Breakfast",
          "Mini Fridge",
          "Bathtub",
        ]),
        sort_order: 2,
      },
      {
        name: "Cozy Garden Room",
        slug: "cozy-garden-room",
        summary: "Comfortable and affordable room facing our landscaped gardens.",
        description:
          "A warm and cozy room facing the resort's landscaped gardens. Ideal for solo travelers or couples looking for comfort at a great value.",
        price_per_night: 3000,
        max_guests: 2,
        bed_type: "Queen Bed",
        size_sqft: 220,
        images: JSON.stringify([stockImages.rooms[2]]),
        amenities: JSON.stringify([
          "Free Wi-Fi",
          "Garden View",
          "Complimentary Breakfast",
          "Hot Water",
          "Work Desk",
        ]),
        sort_order: 3,
      },
    ];
    for (const room of sampleRooms) {
      await sql.query(
        `INSERT INTO rooms (id, name, slug, summary, description, price_per_night, max_guests, bed_type, size_sqft, images, amenities, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (slug) DO NOTHING`,
        [
          crypto.randomUUID(),
          room.name,
          room.slug,
          room.summary,
          room.description,
          room.price_per_night,
          room.max_guests,
          room.bed_type,
          room.size_sqft,
          room.images,
          room.amenities,
          room.sort_order,
        ]
      );
    }
  }

  // Backfill placeholder photography onto rooms from an earlier deploy that
  // predates this image set — only touches rows that still have no images
  // at all, so it never overwrites a real photo an admin has uploaded.
  const bareRooms = (await sql.query(
    "SELECT id, sort_order FROM rooms WHERE images = '[]' ORDER BY sort_order"
  )) as { id: string; sort_order: number }[];
  for (let i = 0; i < bareRooms.length; i++) {
    await sql.query("UPDATE rooms SET images = $1 WHERE id = $2", [
      JSON.stringify([stockRoomImage(i)]),
      bareRooms[i].id,
    ]);
  }

  // Correct known-wrong placeholder addresses (e.g. Mussoorie) and align
  // the seeded Lovedale address with the Google Maps listing.
  await sql.query(
    `UPDATE settings
     SET address = $1
     WHERE id = 1
       AND (
         address ILIKE '%Mussoorie%'
         OR address ILIKE '%Uttarakhand%'
         OR address ILIKE '%Hill Road%'
         OR address = 'Mapple View Resort, Lovedale, Ooty (Udhagamandalam), Nilgiris District, Tamil Nadu, India'
       )`,
    [RESORT_LOCATION.address]
  );

  await setSchemaVersion(SCHEMA_VERSION);
}

export function ensureMigrated(): Promise<void> {
  if (!globalThis.__mapple_migrated__) {
    globalThis.__mapple_migrated__ = (async () => {
      const version = await getSchemaVersion();
      if (version >= SCHEMA_VERSION) return;
      await runMigration();
    })().catch((err) => {
      globalThis.__mapple_migrated__ = undefined;
      throw err;
    });
  }
  return globalThis.__mapple_migrated__;
}
