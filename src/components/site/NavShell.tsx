"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { stockImages } from "@/lib/stockImages";

type NavLink = { href: string; label: string };

export default function NavShell({
  resortName,
  contactPhone,
  whatsappNumber,
  links,
}: {
  resortName: string;
  contactPhone: string;
  whatsappNumber: string;
  links: NavLink[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-line bg-stone/95 backdrop-blur transition-shadow ${
          scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.06)]" : ""
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[padding] duration-300 sm:px-6 ${
            scrolled ? "py-3" : "py-4"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={stockImages.logoMark}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 object-contain"
            />
            <span className="flex flex-col leading-none">
              <span className="label-caps text-ink">{resortName}</span>
              <span className="label-caps mt-1 text-[0.6rem] text-ink-soft/70">
                Ooty · Nilgiris
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="label-caps text-ink-soft transition hover:text-charcoal"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {contactPhone && (
              <a
                href={`tel:${contactPhone.replace(/\s/g, "")}`}
                className="label-caps hidden text-ink-soft xl:block"
              >
                {contactPhone}
              </a>
            )}
            <Link
              href="/rooms"
              className="label-caps hidden bg-charcoal px-5 py-3 text-stone transition hover:bg-charcoal-light sm:inline-flex"
            >
              Check Availability
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-ink transition hover:text-charcoal lg:hidden"
            >
              <Icon name={menuOpen ? "close" : "menu"} className="text-2xl" />
            </button>
          </div>
        </div>
      </header>

      {/* Outside the blurred header so `fixed` covers the full viewport */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-charcoal text-stone transition-[opacity,visibility] duration-300 lg:hidden ${
          menuOpen
            ? "visible pointer-events-auto opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 sm:px-6">
          <span className="label-caps text-stone/70">{resortName}</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-stone"
          >
            <Icon name="close" className="text-2xl" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-stone/10 py-4 font-display text-3xl font-normal text-stone transition hover:text-petrol-300"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-10 flex flex-col gap-3 pb-4">
            <Link
              href="/rooms"
              onClick={() => setMenuOpen(false)}
              className="label-caps flex min-h-12 items-center justify-center bg-stone px-6 py-4 text-ink"
            >
              Check Availability
            </Link>
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="label-caps flex min-h-12 items-center justify-center gap-2 border border-stone/30 px-6 py-4 text-stone"
              >
                <Icon name="chat" className="text-base" />
                WhatsApp
              </a>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
