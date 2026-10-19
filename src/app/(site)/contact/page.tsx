import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Contact | Mapple View Resort" };

export default function ContactPage() {
  const settings = getSettings();
  const whatsappLink = buildWhatsAppLink(
    settings.owner_phone,
    `Hi ${settings.hotel_name}, I'd like to know more about staying with you.`
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">Contact</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-forest">Get in touch</h1>
      <p className="mt-4 text-ink-soft">
        Have a question before you book? Reach out and we&apos;ll get back to you.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-forest/10 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <p className="text-xs uppercase tracking-wide text-ink-soft">WhatsApp</p>
          <p className="mt-1 font-display text-lg font-semibold text-forest">Chat with us</p>
          <p className="mt-1 text-sm text-ink-soft">+{settings.owner_phone}</p>
        </a>

        {settings.contact_email && (
          <a
            href={`mailto:${settings.contact_email}`}
            className="rounded-2xl border border-forest/10 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-wide text-ink-soft">Email</p>
            <p className="mt-1 font-display text-lg font-semibold text-forest">Send a message</p>
            <p className="mt-1 text-sm text-ink-soft">{settings.contact_email}</p>
          </a>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-forest/10 bg-white p-6">
        <p className="text-xs uppercase tracking-wide text-ink-soft">Address</p>
        <p className="mt-1 font-medium text-ink">{settings.address}</p>
      </div>
    </div>
  );
}
