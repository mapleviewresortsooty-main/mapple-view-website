import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "mvr_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 hours

function getSecretKey() {
  const secret = process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  adminId: number;
  username: string;
};

export async function createAdminSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    if (typeof payload.adminId !== "number" || typeof payload.username !== "string") return null;
    return { adminId: payload.adminId, username: payload.username };
  } catch {
    return null;
  }
}
