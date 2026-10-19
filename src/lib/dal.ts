import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAdminSession } from "@/lib/session";

export const verifyAdminSession = cache(async () => {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
});
