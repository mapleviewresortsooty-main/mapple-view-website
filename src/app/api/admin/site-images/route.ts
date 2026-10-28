import { NextRequest, NextResponse } from "next/server";
import { SiteImagesModel } from "@/lib/models";
import { siteImagesUpdateSchema } from "@/lib/validation";
import { isSiteImageKey } from "@/lib/siteImages";

export async function GET() {
  const images = await SiteImagesModel.all();
  return NextResponse.json({ images });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = siteImagesUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  await SiteImagesModel.set(parsed.data.section, parsed.data.images);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const section = request.nextUrl.searchParams.get("section") ?? "";
  if (!isSiteImageKey(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }
  await SiteImagesModel.clear(section);
  return NextResponse.json({ ok: true });
}
