import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
