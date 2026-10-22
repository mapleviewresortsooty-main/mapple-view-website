import { SettingsModel } from "@/lib/models";
import SettingsForm from "@/components/admin/SettingsForm";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default async function AdminSettingsPage() {
  const settings = await SettingsModel.get();

  return (
    <div>
      <h1 className="font-sans text-2xl font-bold text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink/60">
        Configure your resort details, UPI payment, and WhatsApp notifications.
      </p>

      <div className="mt-6 rounded-2xl border border-petrol-100 bg-white p-6 shadow-sm">
        <SettingsForm settings={settings} />
      </div>

      <div className="mt-8 rounded-2xl border border-petrol-100 bg-white p-6 shadow-sm">
        <h2 className="font-sans text-lg font-semibold text-ink">
          Change Admin Password
        </h2>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
