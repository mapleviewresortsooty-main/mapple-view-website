import Link from "next/link";
import Icon from "@/components/ui/Icon";
import {
  mapsDirectionsUrl,
  mapsEmbedUrl,
  RESORT_LOCATION,
} from "@/lib/location";
import type { Settings } from "@/lib/types";

export default function LocationSection({ settings }: { settings: Settings }) {
  const waNumber = settings.whatsapp_owner_number.replace(/\D/g, "");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="aspect-[4/3] w-full overflow-hidden bg-petrol-100 lg:aspect-auto lg:h-full">
        <iframe
          title="Mapple View Resort location map"
          src={mapsEmbedUrl()}
          className="h-full min-h-[320px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="flex flex-col justify-center gap-6">
        <div>
          <span className="label-caps text-petrol-500">Mapple View Resort</span>
          <h3 className="mt-2 font-display text-lg font-normal leading-snug text-ink sm:text-2xl">
            {settings.address || RESORT_LOCATION.address}
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={mapsDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="label-caps flex items-center justify-center gap-2 bg-charcoal px-5 py-3.5 text-stone transition hover:bg-charcoal-light"
          >
            <Icon name="directions" className="text-base" />
            Get Directions
          </a>
          {settings.contact_phone && (
            <a
              href={`tel:${settings.contact_phone.replace(/\s/g, "")}`}
              className="label-caps flex items-center justify-center gap-2 border border-ink/20 px-5 py-3.5 text-ink transition hover:bg-petrol-50"
            >
              <Icon name="call" className="text-base" />
              Call the Resort
            </a>
          )}
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps flex items-center justify-center gap-2 border border-ink/20 px-5 py-3.5 text-ink transition hover:bg-petrol-50"
            >
              <Icon name="chat" className="text-base" />
              WhatsApp
            </a>
          )}
          <Link
            href="/rooms"
            className="label-caps flex items-center justify-center gap-2 bg-petrol-500 px-5 py-3.5 text-stone transition hover:bg-petrol-600"
          >
            <Icon name="event_available" className="text-base" />
            Check Availability
          </Link>
        </div>
      </div>
    </div>
  );
}
