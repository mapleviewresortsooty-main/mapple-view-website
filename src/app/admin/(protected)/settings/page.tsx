import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default function AdminSettingsPage() {
  const settings = getSettings();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-forest">Settings</h1>
      <p className="mt-2 text-sm text-ink-soft">
        These details power the public site, the UPI payment QR, and the WhatsApp booking notifications.
      </p>
      <div className="mt-8">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
