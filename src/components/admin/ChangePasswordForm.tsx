"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to change password" });
        setSubmitting(false);
        return;
      }
      setMessage({ type: "ok", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="text-xs font-medium text-ink/60">Current Password</label>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink/60">New Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-petrol-500 focus:outline-none"
        />
      </div>
      {message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-stone hover:bg-charcoal-light disabled:opacity-60"
      >
        {submitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
