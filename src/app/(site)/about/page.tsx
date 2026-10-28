import type { Metadata } from "next";
import Image from "next/image";
import { getSiteImages, getSiteSettings } from "@/lib/site-data";
import { LinkButton } from "@/components/ui/Button";
import SectionLabel from "@/components/site/SectionLabel";
import LocationSection from "@/components/site/LocationSection";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = { title: "About Us | Mapple View Resort" };

const values = [
  {
    title: "Warm Hospitality",
    icon: "favorite",
    desc: "Every guest is welcomed like family, with attentive and genuine service.",
  },
  {
    title: "Natural Serenity",
    icon: "park",
    desc: "Surrounded by hills and greenery, designed for rest and rejuvenation.",
  },
  {
    title: "Comfort First",
    icon: "king_bed",
    desc: "Thoughtfully furnished rooms with all the amenities you need.",
  },
];

const gettingHere = [
  {
    title: "By Air",
    icon: "flight",
    desc: "Coimbatore International Airport (CJB) is the nearest airport, about 85-90 km away, roughly a 3-hour drive up the Nilgiri ghat roads.",
  },
  {
    title: "By Train",
    icon: "train",
    desc: "Ooty's own railway station is the terminus of the Nilgiri Mountain Railway, a UNESCO World Heritage \"toy train\" that climbs from Mettupalayam through Coonoor. Mettupalayam and Coimbatore are the nearest broad-gauge junctions.",
  },
  {
    title: "By Road",
    icon: "directions_car",
    desc: "Ooty is well connected by road from Coimbatore, Mysore, and Bengaluru. Lovedale sits just a few minutes outside Ooty town, on the quieter side near the Ooty Golf Club and Lawrence School.",
  },
];

export default async function AboutPage() {
  const [settings, siteImages] = await Promise.all([
    getSiteSettings(),
    getSiteImages(),
  ]);
  const paragraphs = (settings.about_content || settings.description)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div>
      <section className="bg-charcoal py-20 text-center text-stone">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionLabel eyebrow="About Us" className="justify-center text-petrol-300" />
          <h1 className="mt-5 font-display text-4xl font-normal leading-[1.05] sm:text-5xl">
            {settings.resort_name}
          </h1>
          <p className="label-caps mt-4 text-stone/60">Lovedale, Ooty · The Nilgiri Hills</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionLabel eyebrow="Our Story" />
            <div className="mt-6 space-y-5">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={i === 0 ? "text-lg font-light leading-relaxed text-ink/80" : "font-light leading-relaxed text-ink/70"}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-petrol-100 sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src={siteImages.about[0]}
              alt={`${settings.resort_name} — the resort`}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="border border-line bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-petrol-50">
                <Icon name={v.icon} className="text-xl text-petrol-500" />
              </div>
              <h3 className="mt-4 font-display text-lg font-medium text-ink">
                {v.title}
              </h3>
              <p className="mt-2 text-sm font-light text-ink/70">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-petrol-50/50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionLabel eyebrow="Getting Here" />
          <h2 className="mt-5 font-display text-2xl font-normal text-ink sm:text-3xl">
            Reaching Lovedale &amp; Ooty
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {gettingHere.map((g) => (
              <div key={g.title}>
                <Icon name={g.icon} className="text-2xl text-petrol-500" />
                <h3 className="mt-3 font-display text-base font-medium text-ink">{g.title}</h3>
                <p className="mt-1.5 text-sm font-light leading-relaxed text-ink/70">{g.desc}</p>
              </div>
            ))}
          </div>
          <p className="label-caps mt-10 text-ink/50">
            Check-in: {settings.check_in_time} · Check-out: {settings.check_out_time}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionLabel eyebrow="Find Us" />
        <div className="mt-8">
          <LocationSection settings={settings} />
        </div>
        <div className="mt-14 text-center">
          <LinkButton href="/rooms" variant="primary">
            View Our Rooms
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
