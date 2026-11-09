import type { Metadata } from "next";
import SectionLabel from "@/components/site/SectionLabel";
import GalleryGrid, { type GalleryItem } from "@/components/site/GalleryGrid";
import { getActiveRooms, getSiteImages } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Gallery | Mapple View Resort",
};

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "rooms", label: "Rooms" },
  { key: "spaces", label: "Shared Spaces" },
];

export default async function GalleryPage() {
  const [siteImages, rooms] = await Promise.all([
    getSiteImages(),
    getActiveRooms(),
  ]);

  // The same photo set as the "Above the noise" section — photos that belong
  // to a room are grouped under Rooms; everything else is a shared space.
  const items: GalleryItem[] = siteImages.ethos.map((src, i) => {
    const room = rooms.find((r) => r.images.includes(src));
    return {
      id: `ethos-${i}`,
      category: room ? "rooms" : "spaces",
      src,
      caption: room ? room.name : "Mapple View Resort",
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="text-center">
        <SectionLabel eyebrow="The Visual Journal" className="justify-center" />
        <h1 className="mt-5 font-display text-4xl font-normal leading-[1.05] text-ink sm:text-5xl">
          Gallery
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-light text-ink/70">
          Rooms and shared spaces around Mapple View, Lovedale.
        </p>
      </div>
      <div className="mt-12">
        <GalleryGrid items={items} categories={CATEGORIES} />
      </div>
    </div>
  );
}
