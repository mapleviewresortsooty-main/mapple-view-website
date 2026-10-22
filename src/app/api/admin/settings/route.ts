import { NextRequest, NextResponse } from "next/server";
import { SettingsModel } from "@/lib/models";
import { settingsSchema } from "@/lib/validation";

export async function GET() {
  const settings = await SettingsModel.get();
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const settings = await SettingsModel.update({
    resort_name: d.resortName,
    tagline: d.tagline,
    description: d.description,
    address: d.address,
    contact_phone: d.contactPhone,
    contact_email: d.contactEmail,
    hero_image: d.heroImage,
    upi_id: d.upiId,
    upi_payee_name: d.upiPayeeName,
    whatsapp_owner_number: d.whatsappOwnerNumber,
    whatsapp_api_token: d.whatsappApiToken,
    whatsapp_phone_number_id: d.whatsappPhoneNumberId,
    check_in_time: d.checkInTime,
    check_out_time: d.checkOutTime,
    about_content: d.aboutContent,
    escape_intro: d.escapeIntro,
    brand_story: d.brandStory,
    testimonials: d.testimonials,
    instagram_handle: d.instagramHandle,
  });
  return NextResponse.json({ settings });
}
