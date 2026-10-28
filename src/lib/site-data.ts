import { cache } from "react";
import { RoomModel, SettingsModel, SiteImagesModel } from "@/lib/models";
import { resolveSiteImages } from "@/lib/siteImages";
import type { SiteImageKey } from "@/lib/siteImages";

/** Dedupes settings fetches within a single request (navbar + page + footer). */
export const getSiteSettings = cache(() => SettingsModel.get());

/** Active rooms only — for the public site. */
export const getActiveRooms = cache(() => RoomModel.all());

/** All rooms including inactive — for admin-style listings that need them. */
export const getAllRooms = cache(() => RoomModel.all(true));

/**
 * Effective image list per homepage section: admin overrides from
 * site_images where set, otherwise the built-in stock defaults (with the
 * legacy Settings > Homepage Photo value honoured for the hero).
 */
export const getSiteImages = cache(async () => {
  const [stored, settings] = await Promise.all([
    SiteImagesModel.all(),
    SettingsModel.get(),
  ]);
  return resolveSiteImages(stored, settings.hero_image).resolved as Record<
    SiteImageKey,
    string[]
  >;
});
