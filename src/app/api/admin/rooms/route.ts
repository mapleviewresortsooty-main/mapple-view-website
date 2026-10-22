import { NextRequest, NextResponse } from "next/server";
import { RoomModel } from "@/lib/models";
import { roomSchema } from "@/lib/validation";

export async function GET() {
  const rooms = await RoomModel.all(true);
  return NextResponse.json({ rooms });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = roomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const existing = await RoomModel.bySlug(d.slug);
  if (existing) {
    return NextResponse.json(
      { error: "A room with this slug already exists" },
      { status: 409 }
    );
  }

  const room = await RoomModel.create({
    name: d.name,
    slug: d.slug,
    summary: d.summary,
    description: d.description,
    price_per_night: d.pricePerNight,
    max_guests: d.maxGuests,
    bed_type: d.bedType,
    size_sqft: d.sizeSqft,
    images: d.images,
    amenities: d.amenities,
    sort_order: d.sortOrder,
  });

  return NextResponse.json({ room }, { status: 201 });
}
