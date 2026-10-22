import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import SectionLabel from "@/components/site/SectionLabel";
import { attractions, seasons } from "@/lib/ooty";

export const metadata: Metadata = {
  title: "Explore Ooty & the Nilgiris | Mapple View Resort",
};

export default function ExploreOotyPage() {
  return (
    <div>
      <section className="bg-charcoal py-20 text-center text-stone">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionLabel eyebrow="The Nilgiris" className="justify-center text-petrol-300" />
          <h1 className="mt-5 font-display text-4xl font-normal leading-[1.05] sm:text-5xl">
            Explore Ooty
          </h1>
          <p className="mt-4 font-light text-stone/75">
            A guide to the hill station and the Nilgiri hills around Lovedale, for whenever you
            step out from the resort.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <SectionLabel eyebrow="Things to See & Do" />
        <h2 className="mt-5 font-display text-2xl font-normal text-ink sm:text-3xl">
          Around Ooty &amp; the Nilgiri Hills
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {attractions.map((a) => (
            <div key={a.title} className="border-t border-petrol-100 pt-4">
              <h3 className="font-display text-lg font-medium text-ink">{a.title}</h3>
              <span className="label-caps mt-1 block text-petrol-500">{a.proximity}</span>
              <p className="mt-2 text-sm font-light leading-relaxed text-ink/70">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionLabel eyebrow="Planning" />
          <h2 className="mt-5 font-display text-2xl font-normal text-ink sm:text-3xl">
            Best Time to Visit
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-ink/70">
            Ooty stays pleasantly cool year-round thanks to its elevation, so there is no single
            wrong time to come. What changes through the year is crowds, colour, and temperature.
          </p>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {seasons.map((s) => (
              <div key={s.title}>
                <span className="label-caps text-petrol-500">{s.title}</span>
                <p className="mt-2 text-sm font-light leading-relaxed text-ink/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-2xl font-normal text-ink sm:text-3xl">
          Make Mapple View Resort Your Base
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-light leading-relaxed text-ink/70">
          Every attraction above is within reach of Lovedale. Come back each evening to a quiet
          room and a fire, then head out again the next morning.
        </p>
        <div className="mt-8">
          <LinkButton href="/rooms" variant="primary">
            View Our Rooms
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
