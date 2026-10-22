import { getSiteSettings } from "@/lib/site-data";
import NavShell from "@/components/site/NavShell";

export default async function Navbar() {
  const settings = await getSiteSettings();

  const links = [
    { href: "/", label: "Stay" },
    { href: "/rooms", label: "The Rooms" },
    { href: "/about", label: "About" },
    { href: "/explore-ooty", label: "Explore Ooty" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <NavShell
      resortName={settings.resort_name}
      contactPhone={settings.contact_phone}
      whatsappNumber={settings.whatsapp_owner_number}
      links={links}
    />
  );
}
