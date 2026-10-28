import { stockImages } from "@/lib/stockImages";
import { attractions } from "@/lib/ooty";

// Registry of every image slot on the public site that the /adminimage page
// can manage. Each entry is one visual section; `max` caps how many images a
// section holds (single-image slots like the hero get replace-in-place UI).
// Room photos are intentionally absent — they're managed per-room under
// Admin > Rooms.
export const SITE_IMAGE_SECTIONS = [
  {
    key: "hero",
    label: "Hero background",
    page: "Home",
    max: 1,
    hint: "Full-screen photo behind the title and booking bar.",
  },
  {
    key: "ethos",
    label: "“Above the noise” carousel",
    page: "Home",
    hint: "Photo carousel beside the intro text (section 01).",
  },
  {
    key: "timeline",
    label: "“Wake Up Here” timeline",
    page: "Home",
    hint: "One photo per time slot (section 03).",
  },
  {
    key: "panoramic",
    label: "Panoramic view",
    page: "Home",
    max: 1,
    hint: "The wide draggable panorama (section 05).",
  },
  {
    key: "gallery",
    label: "Gallery — “Mountain Views”",
    page: "Home",
    hint: "Extra frames in the gallery grid (section 06). Room photos there come from each room's own images.",
  },
  {
    key: "ooty",
    label: "Ooty attractions",
    page: "Home · Explore Ooty",
    hint: "Photos pair with destinations by position — photo 1 is Ooty Lake, photo 2 is Doddabetta Peak, and so on.",
  },
  {
    key: "social",
    label: "Instagram strip",
    page: "Home",
    hint: "The 4-photo strip shown when an Instagram handle is set in Settings.",
  },
  {
    key: "cta",
    label: "Footer banner background",
    page: "Home",
    max: 1,
    hint: "Faded photo behind the final call-to-action.",
  },
] as const;

export type SiteImageKey = (typeof SITE_IMAGE_SECTIONS)[number]["key"];

// What each section shows when nothing has been uploaded — the same stock
// photography the site shipped with, so clearing a section restores the
// original look instead of leaving a hole.
export const SITE_IMAGE_DEFAULTS: Record<SiteImageKey, string[]> = {
  hero: [stockImages.heroBg],
  ethos: [
    stockImages.escapeTall,
    stockImages.escapeSquare,
    stockImages.gallery.sunbeams,
    stockImages.gallery.facade,
  ],
  timeline: [...stockImages.timeline],
  panoramic: [stockImages.panoramic],
  gallery: [
    stockImages.gallery.sunbeams,
    stockImages.gallery.soakingTub,
    stockImages.gallery.facade,
  ],
  social: [...stockImages.social],
  ooty: attractions.map((a) => a.image),
  cta: [stockImages.timeline[4]],
};

export function isSiteImageKey(value: string): value is SiteImageKey {
  return SITE_IMAGE_SECTIONS.some((s) => s.key === value);
}

/**
 * Resolves the effective image list per section: a stored override wins;
 * otherwise the built-in default. The hero additionally falls back to
 * `settings.hero_image` (the older Settings > Homepage Photo field) so a hero
 * already configured there keeps working until it's replaced here.
 * Every returned list is non-empty — sections can never end up image-less.
 */
export function resolveSiteImages(
  stored: Record<string, string[]>,
  heroImage = ""
): { resolved: Record<SiteImageKey, string[]>; overridden: SiteImageKey[] } {
  const resolved = {} as Record<SiteImageKey, string[]>;
  const overridden: SiteImageKey[] = [];
  for (const s of SITE_IMAGE_SECTIONS) {
    const saved = stored[s.key];
    if (saved && saved.length > 0) {
      resolved[s.key] = saved;
      overridden.push(s.key);
    } else if (s.key === "hero" && heroImage) {
      resolved[s.key] = [heroImage];
    } else {
      resolved[s.key] = SITE_IMAGE_DEFAULTS[s.key];
    }
  }
  return { resolved, overridden };
}
