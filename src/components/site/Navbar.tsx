import { getSiteSettings } from "@/lib/site-data";
import NavShell from "@/components/site/NavShell";

export default async function Navbar() {
  const settings = await getSiteSettings();

  const links = [
    { href: "/rooms", label: "The Rooms" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <NavShell
      resortName={settings.resort_name}
      whatsappNumber={settings.whatsapp_owner_number}
      links={links}
    />
  );
}
