import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ username }: { username: string }) {
  return (
    <header className="border-b border-forest/10 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-8">
          <span className="font-display text-lg font-semibold text-forest">Mapple View Admin</span>
          <nav className="flex items-center gap-6">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-ink-soft hover:text-forest">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-soft">{username}</span>
          <form action={logoutAction}>
            <button type="submit" className="text-sm font-semibold text-terracotta hover:underline">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
