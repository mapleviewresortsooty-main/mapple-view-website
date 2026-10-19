"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/dal";
import { updateSettings } from "@/lib/settings";
import { SettingsFormSchema } from "@/lib/validation";

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

export async function updateSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await verifyAdminSession();

  const parsed = SettingsFormSchema.safeParse({
    hotel_name: formData.get("hotel_name"),
    tagline: formData.get("tagline"),
    address: formData.get("address"),
    owner_phone: formData.get("owner_phone"),
    upi_id: formData.get("upi_id"),
    upi_payee_name: formData.get("upi_payee_name"),
    contact_email: formData.get("contact_email"),
    hero_image: formData.get("hero_image"),
    about_text: formData.get("about_text"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  updateSettings(parsed.data);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  return { success: true };
}
