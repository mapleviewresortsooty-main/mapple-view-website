import { NextRequest, NextResponse } from "next/server";
import { RoomModel } from "@/lib/models";
import { roomUpdateSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/admin/rooms/[id]">
) {
  const { id } = await context.params;
  const room = await RoomModel.byId(id);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return NextResponse.json({ room });
}

export async function PUT(
  request: NextRequest,
  context: RouteContext<"/api/admin/rooms/[id]">
) {
  const { id } = await context.params;
  const existing = await RoomModel.byId(id);
  if (!existing) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = roomUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const d = parsed.data;

  if (d.slug && d.slug !== existing.slug) {
    const conflict = await RoomModel.bySlug(d.slug);
    if (conflict) {
      return NextResponse.json(
        { error: "A room with this slug already exists" },
        { status: 409 }
      );
    }
  }

  const room = await RoomModel.update(id, {
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
    is_active: d.isActive === undefined ? undefined : d.isActive ? 1 : 0,
    sort_order: d.sortOrder,
  });

  return NextResponse.json({ room });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext<"/api/admin/rooms/[id]">
) {
  const { id } = await context.params;
  const existing = await RoomModel.byId(id);
  if (!existing) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  try {
    await RoomModel.remove(id);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "23503") {
      return NextResponse.json(
        {
          error:
            "This room has existing bookings and can't be deleted. Hide it instead so it no longer appears on the site.",
        },
        { status: 409 }
      );
    }
    throw err;
  }
  return NextResponse.json({ ok: true });
}
