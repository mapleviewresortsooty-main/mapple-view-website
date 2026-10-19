import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ hotelName }: { hotelName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-forest/10 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-forest">
          {hotelName}
        </Link>
        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-forest"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/rooms"
          className="rounded-full bg-forest px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-forest-dark"
        >
          Book Now
        </Link>
      </div>
      <nav className="flex items-center gap-6 overflow-x-auto border-t border-forest/10 px-5 py-2 sm:hidden">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="shrink-0 text-sm font-medium text-ink-soft">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
