"use client";

import { useActionState } from "react";
import { updateSettingsAction, type SettingsFormState } from "@/lib/actions/admin-settings";
import type { Settings } from "@/lib/settings";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(updateSettingsAction, undefined);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Hotel name</span>
        <input
          name="hotel_name"
          defaultValue={settings.hotel_name}
          required
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Tagline</span>
        <input
          name="tagline"
          defaultValue={settings.tagline}
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Address</span>
        <textarea
          name="address"
          rows={2}
          defaultValue={settings.address}
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Owner WhatsApp number</span>
        <input
          name="owner_phone"
          defaultValue={settings.owner_phone}
          placeholder="919999999999 (country code + number, digits only)"
          required
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">UPI ID</span>
          <input
            name="upi_id"
            defaultValue={settings.upi_id}
            required
            className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">UPI payee name</span>
          <input
            name="upi_payee_name"
            defaultValue={settings.upi_payee_name}
            required
            className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Contact email (optional)</span>
        <input
          name="contact_email"
          type="email"
          defaultValue={settings.contact_email}
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">Hero image URL (optional)</span>
        <input
          name="hero_image"
          type="url"
          defaultValue={settings.hero_image}
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">About text</span>
        <textarea
          name="about_text"
          rows={6}
          defaultValue={settings.about_text}
          className="rounded-lg border border-forest/20 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </label>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-moss">Settings saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream hover:bg-forest-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
