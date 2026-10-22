import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "mvr_admin_session";

function getSecretKey() {
  const secret =
    process.env.SESSION_SECRET ||
    "dev-only-insecure-secret-change-me-in-env-file";
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (!isAdminApi && !isAdminPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let authed = false;
  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      authed = true;
    } catch {
      authed = false;
    }
  }

  if (!authed) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
