import { verifyAdminSession } from "@/lib/dal";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdminSession();

  return (
    <div className="min-h-screen bg-cream-dim">
      <AdminNav username={session.username} />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
