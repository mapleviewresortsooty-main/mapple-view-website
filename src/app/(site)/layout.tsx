import { getSettings } from "@/lib/settings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  return (
    <>
      <SiteHeader hotelName={settings.hotel_name} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        hotelName={settings.hotel_name}
        address={settings.address}
        contactEmail={settings.contact_email}
        ownerPhone={settings.owner_phone}
      />
    </>
  );
}
