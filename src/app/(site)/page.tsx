import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { LinkButton } from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SectionLabel from "@/components/site/SectionLabel";
import { stockImages, stockRoomImage } from "@/lib/stockImages";
import HeroBookingBar from "@/components/site/HeroBookingBar";
import Testimonials from "@/components/site/Testimonials";
import LocationSection from "@/components/site/LocationSection";
import Reveal from "@/components/site/Reveal";
import { getActiveRooms, getSiteSettings } from "@/lib/site-data";
import { seasons } from "@/lib/ooty";
import { mapsDirectionsUrl, RESORT_LOCATION } from "@/lib/location";
import type { GalleryItem } from "@/components/site/GalleryGrid";

const EthosDepthCarousel = dynamic(() => import("@/components/site/EthosDepthCarousel"), {
  loading: () => (
    <div className="h-[400px] w-full animate-pulse bg-petrol-100 sm:h-[420px]" />
  ),
});
const RoomShowcase = dynamic(() => import("@/components/site/RoomShowcase"));
const WakeUpHereTimeline = dynamic(() => import("@/components/site/WakeUpHereTimeline"));
const ExploreOotyPanel = dynamic(() => import("@/components/site/ExploreOotyPanel"));
const PanoramicDrag = dynamic(() => import("@/components/site/PanoramicDrag"));
const GalleryGrid = dynamic(() => import("@/components/site/GalleryGrid"));
const FaqAccordion = dynamic(() => import("@/components/site/FaqAccordion"));

const ethos = [
  {
    icon: "landscape",
    title: "Elevated Mountain Setting",
    desc: "Set at over 2,200 metres in the Nilgiri hills, with cool air and hill views year-round.",
  },
  {
    icon: "forest",
    title: "Quiet, Wooded Surroundings",
    desc: "Lovedale is one of the quieter corners near Ooty, away from the busiest market roads.",
  },
  {
    icon: "wifi",
    title: "Free Wi-Fi",
    desc: "Complimentary high-speed internet throughout your stay.",
  },
  {
    icon: "bolt",
    title: "Instant Confirmation",
    desc: "Your booking request reaches us instantly via WhatsApp for a quick response.",
  },
];

export default async function HomePage() {
  const [settings, allRooms] = await Promise.all([
    getSiteSettings(),
    getActiveRooms(),
  ]);
  const rooms = allRooms.slice(0, 3);

  const faqItems = [
    {
      q: "What are the check-in and check-out timings?",
      a: `Check-in is from ${settings.check_in_time || "12:00 PM"} and check-out is by ${
        settings.check_out_time || "11:00 AM"
      }. Let us know in advance if you need different timing and we'll try to accommodate it.`,
    },
    { q: "Is Wi-Fi available?", a: "Yes, complimentary Wi-Fi is available throughout the resort." },
    {
      q: "Is parking available?",
      a: "Please contact us directly to confirm parking arrangements ahead of your visit.",
    },
    {
      q: "Is breakfast included?",
      a: "This can vary by room and season — please check with us at the time of booking.",
    },
    {
      q: "Do you allow pets?",
      a: "Please contact us before booking to confirm our current pet policy.",
    },
    {
      q: "Are children welcome?",
      a: "Yes. Please share the number and age of children when enquiring so we can suggest the right room.",
    },
    {
      q: "What is your cancellation policy?",
      a: "Please contact us directly for our current cancellation and rescheduling policy.",
    },
    {
      q: "How do I get to Mapple View Resort?",
      a: "We're in Lovedale, on the outskirts of Ooty. See the Location section below for directions, or our About page for a fuller guide on getting here.",
    },
  ];

  const galleryItems: GalleryItem[] = [
    ...allRooms.map((r, i) => ({
      id: `${r.id}-0`,
      category: "rooms" as const,
      src: r.images[0] || stockRoomImage(i),
      caption: r.name,
      span: i === 0 ? ("wide" as const) : undefined,
    })),
    { id: "view-sunbeams", category: "views" as const, src: stockImages.gallery.sunbeams, caption: "Morning light over the tea ridge" },
    { id: "view-tub", category: "views" as const, src: stockImages.gallery.soakingTub, caption: "A quiet corner, view included" },
    { id: "view-facade", category: "views" as const, src: stockImages.gallery.facade, caption: "The estate, from the driveway" },
  ];

  return (
    <div>
      {/* ============================= HERO ============================= */}
      <section className="relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden text-stone md:min-h-[92vh]">
        <Image
          src={settings.hero_image || stockImages.heroBg}
          alt=""
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover"
        />
        {/* Lighter wash on mobile so the landscape reads; deepen from sm up for type */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-charcoal/10 sm:from-charcoal sm:via-charcoal/55 sm:to-charcoal/40" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-charcoal/50 via-charcoal/20 to-transparent sm:block" />

        <div className="label-caps relative z-10 mx-auto hidden w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-b border-stone/35 px-4 pt-8 pb-4 text-stone drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] sm:flex sm:px-6">
          <span>
            {RESORT_LOCATION.coordsLabel} &nbsp;&middot;&nbsp; ~2,200M ELEVATION
          </span>
          <span>LOVEDALE &middot; OOTY, NILGIRIS</span>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-6 pt-24 sm:flex-none sm:justify-center sm:px-6 sm:py-14">
          <span className="label-caps hidden text-petrol-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] sm:inline">
            {settings.resort_name}
          </span>
          <h1 className="max-w-3xl font-display text-[2.75rem] font-normal leading-[1.05] text-stone drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] sm:mt-5 sm:text-7xl lg:text-8xl">
            {settings.tagline || "A quiet escape in the Nilgiris."}
          </h1>
          <p className="mt-6 hidden max-w-md text-base font-normal leading-relaxed text-stone drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] sm:block sm:text-lg">
            {settings.description}
          </p>
          <div className="mt-8 flex items-stretch gap-2.5 sm:mt-10 sm:gap-4">
            <a
              href="#rooms"
              className="label-caps inline-flex min-h-12 flex-1 items-center justify-center bg-petrol-500 px-5 py-3.5 text-center text-stone transition hover:bg-petrol-600 sm:flex-none sm:px-7"
            >
              Explore the Resort
            </a>
            <a
              href="#quick-booking"
              className="label-caps inline-flex min-h-12 flex-1 items-center justify-center border border-stone/70 bg-stone/10 px-5 py-3.5 text-center text-stone backdrop-blur-[2px] transition hover:bg-stone hover:text-ink sm:flex-none sm:border-stone/80 sm:bg-charcoal/55 sm:px-7 sm:shadow-[0_1px_8px_rgba(0,0,0,0.35)] sm:backdrop-blur-sm"
            >
              Check Availability
            </a>
          </div>
        </div>

        <HeroBookingBar />

        <div className="label-caps relative z-10 mx-auto hidden w-full max-w-6xl items-center justify-between px-4 pb-6 pt-3 text-stone/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] sm:flex sm:px-6">
          <span>Scroll to Discover</span>
          <Icon name="south" className="animate-bounce text-base" />
        </div>
      </section>

      {/* ========================= 01 · THE ESCAPE ========================= */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-20 pb-10 sm:gap-12 sm:px-6 sm:pt-28 sm:pb-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <SectionLabel index="01" eyebrow="Sanctuary Ethos" />
            <h2 className="mt-5 font-display text-3xl font-normal leading-[1.15] text-ink sm:text-4xl">
              Above the noise.
              <br />
              <span className="italic font-light">Closer to the clouds.</span>
            </h2>
            <p className="mt-5 text-sm font-light leading-relaxed text-ink/70 sm:text-base">
              {settings.escape_intro}
            </p>
            <div className="mt-8 space-y-5">
              {ethos.slice(0, 2).map((h) => (
                <div key={h.title} className="flex items-start gap-4">
                  <Icon name={h.icon} className="mt-0.5 text-xl text-petrol-500" />
                  <div>
                    <h4 className="font-display text-base font-medium text-ink">{h.title}</h4>
                    <p className="mt-1 text-sm font-light text-ink/70">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <div className="lg:col-span-7">
            <EthosDepthCarousel />
          </div>
        </div>
      </section>

      {/* ========================= 02 · ROOMS ========================= */}
      {rooms.length > 0 && (
        <section id="rooms" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-20">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel index="02" eyebrow="Accommodation Portfolio" />
              <h2 className="mt-5 font-display text-4xl font-normal leading-[1.05] text-ink sm:text-5xl">
                Our Rooms &amp; Suites
              </h2>
            </div>
            <LinkButton href="/rooms" variant="outline">
              View All Rooms
            </LinkButton>
          </Reveal>
          <div className="mt-14">
            <RoomShowcase rooms={rooms} whatsappNumber={settings.whatsapp_owner_number} />
          </div>
        </section>
      )}

      {/* ========================= 03 · WAKE UP HERE ========================= */}
      <section className="bg-petrol-50/50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel index="03" eyebrow="Sensory Chronology" className="justify-center" />
            <h2 className="mt-5 font-display text-3xl font-normal text-ink sm:text-4xl">
              Wake Up Here: The Rhythm of a Day
            </h2>
            <p className="mt-3 text-sm font-light text-ink/70">
              Time slows in the high Nilgiris. Here&apos;s how a day at the resort tends to unfold.
            </p>
          </div>
          <div className="mt-12">
            <WakeUpHereTimeline />
          </div>
        </div>
      </section>

      {/* ========================= 04 · EXPLORE OOTY ========================= */}
      <section className="bg-charcoal py-16 text-stone sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel index="04" eyebrow="Destination Compendium" className="text-petrol-300" />
              <h2 className="mt-5 font-display text-3xl font-normal text-stone sm:text-4xl">
                Where the Mountains Slow Time Down
              </h2>
            </div>
            <Link
              href="/explore-ooty"
              className="label-caps border-b border-stone/40 pb-1 text-stone/80 hover:text-petrol-300"
            >
              Full Ooty Guide
            </Link>
          </div>
          <div className="mt-12">
            <ExploreOotyPanel />
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-stone/15 pt-10 sm:grid-cols-3">
            {seasons.map((s) => (
              <div key={s.title}>
                <span className="label-caps text-petrol-300">{s.title}</span>
                <p className="mt-2 text-sm font-light text-stone/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= 05 · THE VIEW ========================= */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionLabel index="05" eyebrow="Unfiltered Perspective" />
        <h2 className="mt-5 max-w-xl font-display text-3xl font-normal text-ink sm:text-4xl">
          Some views don&apos;t need a filter.
        </h2>
        <div className="mt-10">
          <PanoramicDrag />
        </div>
      </section>

      {/* ========================= 06 · GALLERY ========================= */}
      <section className="bg-petrol-50/50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionLabel index="06" eyebrow="The Visual Journal" />
          <h2 className="mt-5 font-display text-3xl font-normal text-ink sm:text-4xl">
            Curated Estate Frames
          </h2>
          <p className="mt-3 max-w-xl text-sm font-light text-ink/70">
            Real room photos as they&apos;re added, alongside placeholder Nilgiri imagery in the
            meantime.
          </p>
          <div className="mt-10">
            <GalleryGrid items={galleryItems} />
          </div>
        </div>
      </section>

      {/* ========================= 07 · FAQ ========================= */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionLabel index="07" eyebrow="Good to Know" />
          <h2 className="mt-5 font-display text-3xl font-normal text-ink sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10">
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* ========================= 08 · GUEST MOMENTS ========================= */}
      {settings.testimonials.trim() && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionLabel index="08" eyebrow="Guest Moments" />
          <h2 className="mt-5 font-display text-3xl font-normal text-ink sm:text-4xl">
            In Their Own Words
          </h2>
          <div className="mt-10">
            <Testimonials raw={settings.testimonials} />
          </div>
        </section>
      )}

      {/* ========================= 09 · LOCATION ========================= */}
      <section className="bg-petrol-50/50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionLabel index="09" eyebrow="Arrival & Access" />
          <h2 className="mt-5 font-display text-3xl font-normal text-ink sm:text-4xl">
            Find Mapple View Resort
          </h2>
          <div className="mt-10">
            <LocationSection settings={settings} />
          </div>
        </div>
      </section>

      {/* ========================= SOCIAL (optional) ========================= */}
      {settings.instagram_handle && (
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <span className="label-caps text-petrol-500">Estate Dispatches</span>
          <a
            href={`https://instagram.com/${settings.instagram_handle.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block font-display text-2xl font-normal text-ink hover:text-petrol-600"
          >
            @{settings.instagram_handle.replace(/^@/, "")}
          </a>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-4 gap-3">
            {stockImages.social.map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden bg-petrol-100">
                <Image src={src} alt="" fill sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =============================== FINAL CTA =============================== */}
      <section className="relative overflow-hidden bg-charcoal text-stone">
        <Image
          src={stockImages.timeline[4]}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25 mix-blend-luminosity"
        />
        <Reveal className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="label-caps text-petrol-300">Your Ooty Escape Starts Here</span>
          <h2 className="mt-5 font-display text-4xl font-normal leading-[1.05] sm:text-5xl">
            Come for the mountains.
            <br />
            <span className="italic font-light">Stay for the moments.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-light leading-relaxed text-stone/75">
            Reserve your room today and let us take care of the rest.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <LinkButton href="/rooms" variant="accent">
              Check Availability
            </LinkButton>
            {settings.whatsapp_owner_number && (
              <a
                href={`https://wa.me/${settings.whatsapp_owner_number.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="label-caps inline-flex items-center justify-center gap-2 border border-stone/40 px-7 py-3.5 text-stone transition hover:bg-stone hover:text-ink"
              >
                <Icon name="chat" className="text-base" />
                WhatsApp Us
              </a>
            )}
            <a
              href={mapsDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps inline-flex items-center justify-center gap-2 border border-stone/40 px-7 py-3.5 text-stone transition hover:bg-stone hover:text-ink"
            >
              <Icon name="directions" className="text-base" />
              Get Directions
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
