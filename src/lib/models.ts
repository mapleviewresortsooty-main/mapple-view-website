import { sql, ensureMigrated } from "@/lib/db";
import type { Room, Booking, Settings, BookingStatus } from "@/lib/types";

type RoomRow = Omit<Room, "images" | "amenities"> & {
  images: string;
  amenities: string;
};

function mapRoom(row: RoomRow): Room {
  return {
    ...row,
    images: JSON.parse(row.images || "[]"),
    amenities: JSON.parse(row.amenities || "[]"),
  };
}

export const RoomModel = {
  async all(includeInactive = false): Promise<Room[]> {
    await ensureMigrated();
    const rows = (includeInactive
      ? await sql.query("SELECT * FROM rooms ORDER BY sort_order ASC, created_at ASC")
      : await sql.query(
          "SELECT * FROM rooms WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC"
        )) as RoomRow[];
    return rows.map(mapRoom);
  },
  /** Lightweight rows for the admin calendar grid. */
  async forCalendar(): Promise<Pick<Room, "id" | "name" | "price_per_night">[]> {
    await ensureMigrated();
    return (await sql.query(
      `SELECT id, name, price_per_night FROM rooms
       WHERE is_active = 1
       ORDER BY sort_order ASC, created_at ASC`
    )) as Pick<Room, "id" | "name" | "price_per_night">[];
  },
  /** id → name map for admin tables that only need labels. */
  async idNames(): Promise<{ id: string; name: string }[]> {
    await ensureMigrated();
    return (await sql.query(
      "SELECT id, name FROM rooms ORDER BY sort_order ASC, created_at ASC"
    )) as { id: string; name: string }[];
  },
  async bySlug(slug: string): Promise<Room | undefined> {
    await ensureMigrated();
    const rows = (await sql.query("SELECT * FROM rooms WHERE slug = $1", [slug])) as RoomRow[];
    return rows[0] ? mapRoom(rows[0]) : undefined;
  },
  async byId(id: string): Promise<Room | undefined> {
    await ensureMigrated();
    const rows = (await sql.query("SELECT * FROM rooms WHERE id = $1", [id])) as RoomRow[];
    return rows[0] ? mapRoom(rows[0]) : undefined;
  },
  async create(data: {
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
    sort_order?: number;
  }): Promise<Room> {
    await ensureMigrated();
    const id = crypto.randomUUID();
    await sql.query(
      `INSERT INTO rooms (id, name, slug, summary, description, price_per_night, max_guests, bed_type, size_sqft, images, amenities, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        id,
        data.name,
        data.slug,
        data.summary,
        data.description,
        data.price_per_night,
        data.max_guests,
        data.bed_type,
        data.size_sqft,
        JSON.stringify(data.images),
        JSON.stringify(data.amenities),
        data.sort_order ?? 0,
      ]
    );
    return (await RoomModel.byId(id))!;
  },
  async update(
    id: string,
    data: Partial<{
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
    }>
  ): Promise<Room | undefined> {
    await ensureMigrated();
    const existing = await RoomModel.byId(id);
    if (!existing) return undefined;
    const merged = {
      name: data.name ?? existing.name,
      slug: data.slug ?? existing.slug,
      summary: data.summary ?? existing.summary,
      description: data.description ?? existing.description,
      price_per_night: data.price_per_night ?? existing.price_per_night,
      max_guests: data.max_guests ?? existing.max_guests,
      bed_type: data.bed_type ?? existing.bed_type,
      size_sqft: data.size_sqft ?? existing.size_sqft,
      images: JSON.stringify(data.images ?? existing.images),
      amenities: JSON.stringify(data.amenities ?? existing.amenities),
      is_active: data.is_active ?? existing.is_active,
      sort_order: data.sort_order ?? existing.sort_order,
    };
    await sql.query(
      `UPDATE rooms SET name=$1, slug=$2, summary=$3, description=$4,
       price_per_night=$5, max_guests=$6, bed_type=$7, size_sqft=$8,
       images=$9, amenities=$10, is_active=$11, sort_order=$12,
       updated_at=now() WHERE id=$13`,
      [
        merged.name,
        merged.slug,
        merged.summary,
        merged.description,
        merged.price_per_night,
        merged.max_guests,
        merged.bed_type,
        merged.size_sqft,
        merged.images,
        merged.amenities,
        merged.is_active,
        merged.sort_order,
        id,
      ]
    );
    return RoomModel.byId(id);
  },
  async remove(id: string): Promise<void> {
    await ensureMigrated();
    await sql.query("DELETE FROM rooms WHERE id = $1", [id]);
  },
  /**
   * True when no other active booking (any non-cancelled status, whatever
   * its source — the site itself or one entered manually for another
   * platform) overlaps [checkIn, checkOut). Half-open interval: a checkout
   * on day X does not conflict with a new check-in on day X.
   */
  async isAvailable(
    roomId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string
  ): Promise<boolean> {
    await ensureMigrated();
    const conflicts = (await sql.query(
      `SELECT id FROM bookings
       WHERE room_id = $1 AND status != 'cancelled'
         AND check_in < $3 AND check_out > $2
         AND ($4::text IS NULL OR id != $4)`,
      [roomId, checkIn, checkOut, excludeBookingId ?? null]
    )) as { id: string }[];
    return conflicts.length === 0;
  },
};

export const BookingModel = {
  async all(status?: BookingStatus): Promise<Booking[]> {
    await ensureMigrated();
    if (status) {
      return (await sql.query(
        "SELECT * FROM bookings WHERE status = $1 ORDER BY created_at DESC",
        [status]
      )) as Booking[];
    }
    return (await sql.query("SELECT * FROM bookings ORDER BY created_at DESC")) as Booking[];
  },
  async recent(limit = 6): Promise<Booking[]> {
    await ensureMigrated();
    return (await sql.query(
      "SELECT * FROM bookings ORDER BY created_at DESC LIMIT $1",
      [limit]
    )) as Booking[];
  },
  async byId(id: string): Promise<Booking | undefined> {
    await ensureMigrated();
    const rows = (await sql.query("SELECT * FROM bookings WHERE id = $1", [id])) as Booking[];
    return rows[0];
  },
  /** Slim booking rows for the admin calendar. */
  async forCalendar(from: string, to: string): Promise<
    Pick<
      Booking,
      | "id"
      | "room_id"
      | "guest_name"
      | "check_in"
      | "check_out"
      | "status"
      | "source"
      | "total_amount"
    >[]
  > {
    await ensureMigrated();
    return (await sql.query(
      `SELECT id, room_id, guest_name, check_in, check_out, status, source, total_amount
       FROM bookings
       WHERE status != 'cancelled'
         AND check_in < $2 AND check_out > $1
       ORDER BY check_in ASC`,
      [from, to]
    )) as Pick<
      Booking,
      | "id"
      | "room_id"
      | "guest_name"
      | "check_in"
      | "check_out"
      | "status"
      | "source"
      | "total_amount"
    >[];
  },
  async inRange(
    from: string,
    to: string,
    options?: { includeCancelled?: boolean; roomId?: string }
  ): Promise<Booking[]> {
    await ensureMigrated();
    const includeCancelled = options?.includeCancelled ?? false;
    const roomId = options?.roomId;

    if (roomId && includeCancelled) {
      return (await sql.query(
        `SELECT * FROM bookings
         WHERE room_id = $1 AND check_in < $3 AND check_out > $2
         ORDER BY check_in ASC`,
        [roomId, from, to]
      )) as Booking[];
    }
    if (roomId) {
      return (await sql.query(
        `SELECT * FROM bookings
         WHERE room_id = $1 AND status != 'cancelled'
           AND check_in < $3 AND check_out > $2
         ORDER BY check_in ASC`,
        [roomId, from, to]
      )) as Booking[];
    }
    if (includeCancelled) {
      return (await sql.query(
        `SELECT * FROM bookings
         WHERE check_in < $2 AND check_out > $1
         ORDER BY check_in ASC`,
        [from, to]
      )) as Booking[];
    }
    return (await sql.query(
      `SELECT * FROM bookings
       WHERE status != 'cancelled'
         AND check_in < $2 AND check_out > $1
       ORDER BY check_in ASC`,
      [from, to]
    )) as Booking[];
  },
  async create(data: {
    room_id: string;
    guest_name: string;
    guest_phone: string;
    guest_email: string;
    check_in: string;
    check_out: string;
    guests: number;
    nights: number;
    total_amount: number;
    notes: string;
    status?: BookingStatus;
    source?: string;
  }): Promise<Booking> {
    await ensureMigrated();
    const id = crypto.randomUUID();
    await sql.query(
      `INSERT INTO bookings (id, room_id, guest_name, guest_phone, guest_email, check_in, check_out, guests, nights, total_amount, notes, status, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        id,
        data.room_id,
        data.guest_name,
        data.guest_phone,
        data.guest_email,
        data.check_in,
        data.check_out,
        data.guests,
        data.nights,
        data.total_amount,
        data.notes,
        data.status ?? "pending",
        data.source ?? "Website",
      ]
    );
    return (await BookingModel.byId(id))!;
  },
  async updateStatus(
    id: string,
    status: BookingStatus,
    extra?: Partial<{
      payment_ref: string;
      whatsapp_sent: number;
      whatsapp_error: string;
    }>
  ): Promise<Booking | undefined> {
    await ensureMigrated();
    const existing = await BookingModel.byId(id);
    if (!existing) return undefined;
    const merged = {
      status,
      payment_ref: extra?.payment_ref ?? existing.payment_ref,
      whatsapp_sent: extra?.whatsapp_sent ?? existing.whatsapp_sent,
      whatsapp_error: extra?.whatsapp_error ?? existing.whatsapp_error,
    };
    await sql.query(
      `UPDATE bookings SET status=$1, payment_ref=$2, whatsapp_sent=$3,
       whatsapp_error=$4, updated_at=now() WHERE id=$5`,
      [merged.status, merged.payment_ref, merged.whatsapp_sent, merged.whatsapp_error, id]
    );
    return BookingModel.byId(id);
  },
  async stats() {
    await ensureMigrated();
    const [row] = (await sql.query(
      `SELECT
         COUNT(*)::int as total,
         COUNT(*) FILTER (WHERE status IN ('pending','payment_claimed'))::int as pending,
         COUNT(*) FILTER (WHERE status = 'confirmed')::int as confirmed,
         COALESCE(SUM(total_amount) FILTER (WHERE status = 'confirmed'), 0)::int as revenue
       FROM bookings`
    )) as {
      total: number;
      pending: number;
      confirmed: number;
      revenue: number;
    }[];
    return {
      total: row.total,
      pending: row.pending,
      confirmed: row.confirmed,
      revenue: row.revenue,
    };
  },
  /** Billing/report summary for bookings whose check-in falls in [from, to] (either bound optional). */
  async summary(filters?: { from?: string; to?: string }) {
    await ensureMigrated();
    const [row] = (await sql.query(
      `SELECT
         COUNT(*)::int as total,
         COUNT(*) FILTER (WHERE status = 'confirmed')::int as confirmed,
         COUNT(*) FILTER (WHERE status IN ('pending','payment_claimed'))::int as pending,
         COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled,
         COALESCE(SUM(total_amount) FILTER (WHERE status = 'confirmed'), 0)::int as revenue
       FROM bookings
       WHERE ($1::text IS NULL OR check_in >= $1)
         AND ($2::text IS NULL OR check_in <= $2)`,
      [filters?.from ?? null, filters?.to ?? null]
    )) as {
      total: number;
      confirmed: number;
      pending: number;
      cancelled: number;
      revenue: number;
    }[];
    return row;
  },
  /** Confirmed revenue and booking count per room, for bookings whose check-in falls in [from, to]. */
  async revenueByRoom(filters?: { from?: string; to?: string }) {
    await ensureMigrated();
    return (await sql.query(
      `SELECT r.id as room_id, r.name as room_name,
              COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'confirmed'), 0)::int as revenue,
              COUNT(b.id) FILTER (WHERE b.status = 'confirmed')::int as bookings
       FROM rooms r
       LEFT JOIN bookings b ON b.room_id = r.id
         AND ($1::text IS NULL OR b.check_in >= $1)
         AND ($2::text IS NULL OR b.check_in <= $2)
       GROUP BY r.id, r.name
       ORDER BY revenue DESC`,
      [filters?.from ?? null, filters?.to ?? null]
    )) as { room_id: string; room_name: string; revenue: number; bookings: number }[];
  },
  /** Full billing rows for the report table / CSV export, filtered by check-in date range. */
  async billing(filters?: { from?: string; to?: string }): Promise<Booking[]> {
    await ensureMigrated();
    return (await sql.query(
      `SELECT * FROM bookings
       WHERE ($1::text IS NULL OR check_in >= $1)
         AND ($2::text IS NULL OR check_in <= $2)
       ORDER BY check_in DESC`,
      [filters?.from ?? null, filters?.to ?? null]
    )) as Booking[];
  },
};

export const SettingsModel = {
  async get(): Promise<Settings> {
    await ensureMigrated();
    const rows = (await sql.query("SELECT * FROM settings WHERE id = 1")) as Settings[];
    return rows[0];
  },
  async update(data: Partial<Omit<Settings, "id" | "updated_at">>): Promise<Settings> {
    await ensureMigrated();
    const existing = await SettingsModel.get();
    const merged = { ...existing, ...data };
    await sql.query(
      `UPDATE settings SET resort_name=$1, tagline=$2, description=$3,
       address=$4, contact_phone=$5, contact_email=$6, hero_image=$7,
       upi_id=$8, upi_payee_name=$9, whatsapp_owner_number=$10,
       whatsapp_api_token=$11, whatsapp_phone_number_id=$12,
       check_in_time=$13, check_out_time=$14, about_content=$15,
       escape_intro=$16, brand_story=$17, testimonials=$18, instagram_handle=$19,
       updated_at=now()
       WHERE id = 1`,
      [
        merged.resort_name,
        merged.tagline,
        merged.description,
        merged.address,
        merged.contact_phone,
        merged.contact_email,
        merged.hero_image,
        merged.upi_id,
        merged.upi_payee_name,
        merged.whatsapp_owner_number,
        merged.whatsapp_api_token,
        merged.whatsapp_phone_number_id,
        merged.check_in_time,
        merged.check_out_time,
        merged.about_content,
        merged.escape_intro,
        merged.brand_story,
        merged.testimonials,
        merged.instagram_handle,
      ]
    );
    return SettingsModel.get();
  },
};
