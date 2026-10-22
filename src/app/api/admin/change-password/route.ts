import { NextRequest, NextResponse } from "next/server";
import { getSession, verifyPassword, updateAdminPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validation";
import { sql, ensureMigrated } from "@/lib/db";
import type { AdminUser } from "@/lib/types";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters" },
      { status: 400 }
    );
  }
  await ensureMigrated();
  const rows = (await sql.query("SELECT * FROM admin_users WHERE id = $1", [
    session.sub,
  ])) as AdminUser[];
  const user = rows[0];
  if (!user || !verifyPassword(parsed.data.currentPassword, user.password_hash)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }
  await updateAdminPassword(user.id, parsed.data.newPassword);
  return NextResponse.json({ ok: true });
}
