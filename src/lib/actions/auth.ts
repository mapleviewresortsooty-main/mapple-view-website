"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createAdminSession, destroyAdminSession } from "@/lib/session";
import { LoginFormSchema } from "@/lib/validation";

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginFormSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter both username and password." };
  }

  const { username, password } = parsed.data;
  const row = db
    .prepare("SELECT id, username, password_hash FROM admin_users WHERE username = ?")
    .get(username) as { id: number; username: string; password_hash: string } | undefined;

  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return { error: "Invalid username or password." };
  }

  await createAdminSession({ adminId: row.id, username: row.username });
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
