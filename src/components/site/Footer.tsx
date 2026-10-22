import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/lib/site-data";
import { stockImages } from "@/lib/stockImages";

export default async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-line bg-charcoal text-stone">
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex items-center gap-2.5">
            <Image src={stockImages.logoMark} alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />
            <h3 className="font-display text-2xl font-medium text-stone">
              {settings.resort_name}
            </h3>
          </div>
          <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-stone/75">
            {settings.tagline}
          </p>
        </div>
        <div className="md:col-span-4">
          <span className="label-caps text-petrol-300">Explore</span>
          <ul className="mt-4 space-y-1 text-sm font-light text-stone/80">
            <li>
              <Link href="/rooms" className="inline-flex min-h-11 items-center hover:text-petrol-300">
                Rooms &amp; Suites
              </Link>
            </li>
            <li>
              <Link href="/about" className="inline-flex min-h-11 items-center hover:text-petrol-300">
                About the Resort
              </Link>
            </li>
            <li>
              <Link href="/explore-ooty" className="inline-flex min-h-11 items-center hover:text-petrol-300">
                Explore Ooty
              </Link>
            </li>
            <li>
              <Link href="/contact" className="inline-flex min-h-11 items-center hover:text-petrol-300">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <span className="label-caps text-petrol-300">Get in Touch</span>
          <ul className="mt-4 space-y-2.5 text-sm font-light text-stone/80">
            {settings.address && <li>{settings.address}</li>}
            {settings.contact_phone && (
              <li>
                <a href={`tel:${settings.contact_phone.replace(/\s/g, "")}`} className="hover:text-petrol-300">
                  {settings.contact_phone}
                </a>
              </li>
            )}
            {settings.contact_email && (
              <li>
                <a href={`mailto:${settings.contact_email}`} className="hover:text-petrol-300">
                  {settings.contact_email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="label-caps relative flex flex-col items-center justify-between gap-2 border-t border-charcoal-light px-4 py-5 text-center text-stone/55 sm:flex-row sm:px-6">
        <span>© {year} {settings.resort_name}. All rights reserved.</span>
        <span>Lovedale, Ooty · Nilgiris, Tamil Nadu</span>
      </div>
    </footer>
  );
}
