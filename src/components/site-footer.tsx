import Link from "next/link";

export function SiteFooter({
  hotelName,
  address,
  contactEmail,
  ownerPhone,
}: {
  hotelName: string;
  address: string;
  contactEmail: string;
  ownerPhone: string;
}) {
  return (
    <footer className="mt-24 border-t border-forest/10 bg-forest text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold">{hotelName}</p>
          <p className="mt-3 max-w-xs text-sm text-cream/70">{address}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cream/60">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/rooms" className="text-cream/80 hover:text-cream">
              Rooms &amp; Rates
            </Link>
            <Link href="/about" className="text-cream/80 hover:text-cream">
              About the Resort
            </Link>
            <Link href="/contact" className="text-cream/80 hover:text-cream">
              Contact
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cream/60">Reach Us</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-cream/80">
            {contactEmail && <span>{contactEmail}</span>}
            {ownerPhone && <span>+{ownerPhone}</span>}
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10 px-5 py-5 text-center text-xs text-cream/50 sm:px-8">
        © {new Date().getFullYear()} {hotelName}. All rights reserved.
      </div>
    </footer>
  );
}
