"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/reports", label: "Reports & Billing" },
  { href: "/admin/settings", label: "Settings" },
];

export default function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <>
      <div className="flex items-start justify-between px-5 py-5 md:px-6 md:py-6">
        <div>
          <p className="font-sans text-lg font-semibold">Mapple View</p>
          <p className="text-xs text-stone/50">Admin Panel</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-2 text-stone/70 hover:bg-charcoal-light hover:text-stone md:hidden"
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map((l) => {
          const active = l.exact
            ? pathname === l.href
            : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition md:py-2 ${
                active
                  ? "bg-ink text-stone"
                  : "text-stone/70 hover:bg-charcoal-light hover:text-stone"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-charcoal-light px-5 py-4 md:px-6">
        <p className="truncate text-xs text-stone/50">Signed in as {username}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 text-sm font-medium text-petrol-400 hover:text-petrol-300"
        >
          Log Out
        </button>
        <Link
          href="/"
          className="mt-2 block text-xs text-stone/50 hover:text-stone"
        >
          ← Back to website
        </Link>
      </div>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-charcoal-light bg-charcoal px-4 py-3 text-stone md:hidden">
        <div className="min-w-0">
          <p className="truncate font-sans text-base font-semibold">Mapple View</p>
          <p className="text-[10px] text-stone/50">Admin</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-stone hover:bg-charcoal-light"
          aria-label="Open menu"
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-charcoal/50 md:hidden"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-charcoal-light bg-charcoal text-stone transition-transform duration-200 ease-out md:static md:z-auto md:h-screen md:w-64 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {nav}
      </aside>
    </>
  );
}
