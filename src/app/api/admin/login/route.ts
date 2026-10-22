import { NextRequest, NextResponse } from "next/server";
import { findAdminByUsername, verifyPassword, createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const user = await findAdminByUsername(parsed.data.username);
  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const token = await createSessionToken(user.id, user.username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
