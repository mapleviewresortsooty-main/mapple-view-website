import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-data";
import SectionLabel from "@/components/site/SectionLabel";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Contact Us | Mapple View Resort" };

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const waNumber = settings.whatsapp_owner_number.replace(/[^\d]/g, "");

  return (
    <div>
      <section className="bg-charcoal py-20 text-center text-stone">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionLabel eyebrow="Get in Touch" className="justify-center text-petrol-300" />
          <h1 className="mt-5 font-display text-4xl font-normal leading-[1.05] sm:text-5xl">
            Contact Us
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {settings.contact_phone && (
            <div className="border border-line bg-white p-6">
              <Icon name="call" className="text-xl text-petrol-500" />
              <h3 className="mt-3 font-display text-lg font-medium text-ink">Phone</h3>
              <a
                href={`tel:${settings.contact_phone.replace(/\s/g, "")}`}
                className="mt-2 block font-light text-ink/70 hover:text-petrol-600"
              >
                {settings.contact_phone}
              </a>
            </div>
          )}
          {settings.contact_email && (
            <div className="border border-line bg-white p-6">
              <Icon name="mail" className="text-xl text-petrol-500" />
              <h3 className="mt-3 font-display text-lg font-medium text-ink">Email</h3>
              <a
                href={`mailto:${settings.contact_email}`}
                className="mt-2 block font-light text-ink/70 hover:text-petrol-600"
              >
                {settings.contact_email}
              </a>
            </div>
          )}
          {settings.address && (
            <div className="border border-line bg-white p-6 sm:col-span-2">
              <Icon name="location_on" className="text-xl text-petrol-500" />
              <h3 className="mt-3 font-display text-lg font-medium text-ink">Address</h3>
              <p className="mt-2 font-light text-ink/70">{settings.address}</p>
            </div>
          )}
          {waNumber && (
            <div className="border border-line bg-white p-6 sm:col-span-2">
              <Icon name="chat" className="text-xl text-petrol-500" />
              <h3 className="mt-3 font-display text-lg font-medium text-ink">WhatsApp</h3>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-light text-ink/70 hover:text-petrol-600"
              >
                Chat with us on WhatsApp
              </a>
            </div>
          )}
        </div>

        <p className="label-caps mt-10 text-center text-ink/50">
          Check-in: {settings.check_in_time} · Check-out: {settings.check_out_time}
        </p>
      </section>
    </div>
  );
}
