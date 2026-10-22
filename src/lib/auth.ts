import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { sql, ensureMigrated } from "@/lib/db";
import type { AdminUser } from "@/lib/types";

export const SESSION_COOKIE = "mvr_admin_session";

function getSecretKey() {
  const secret =
    process.env.SESSION_SECRET ||
    "dev-only-insecure-secret-change-me-in-env-file";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: string, username: string) {
  return new SignJWT({ sub: userId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as { sub: string; username: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function findAdminByUsername(
  username: string
): Promise<AdminUser | undefined> {
  await ensureMigrated();
  const rows = (await sql.query("SELECT * FROM admin_users WHERE username = $1", [
    username,
  ])) as AdminUser[];
  return rows[0];
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compareSync(plain, hash);
}

export async function updateAdminPassword(userId: string, newPassword: string) {
  await ensureMigrated();
  const hash = bcrypt.hashSync(newPassword, 10);
  await sql.query("UPDATE admin_users SET password_hash = $1 WHERE id = $2", [
    hash,
    userId,
  ]);
}
