import type { ReactNode } from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

// Data (settings, rooms, bookings) now comes from Neon over the network, so
// nothing under this layout should be statically prerendered at build time —
// that would require live DB access during `next build`/`opennextjs-cloudflare
// build`. Everything renders per-request instead, same as the admin panel
// (which is already dynamic because it reads cookies()).
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
