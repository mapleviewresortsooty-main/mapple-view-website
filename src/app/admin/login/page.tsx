"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-5">
      <div className="w-full max-w-sm rounded-2xl bg-cream p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">Admin</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-forest">Mapple View Resort</h1>
        <p className="mt-1 text-sm text-ink-soft">Sign in to manage rooms, bookings and settings.</p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Username</span>
            <input
              name="username"
              type="text"
              required
              autoFocus
              className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-ink">Password</span>
            <input
              name="password"
              type="password"
              required
              className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
            />
          </label>

          {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream hover:bg-forest-dark disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
