import type { Metadata } from "next";
import { RoomModel, SettingsModel, SiteImagesModel } from "@/lib/models";
import { resolveSiteImages, SITE_IMAGE_SECTIONS } from "@/lib/siteImages";
import SiteImagesManager from "@/components/admin/SiteImagesManager";

export const metadata: Metadata = { title: "Site Images | Mapple View Resort" };

export default async function AdminImagePage() {
  const [stored, settings, rooms] = await Promise.all([
    SiteImagesModel.all(),
    SettingsModel.get(),
    RoomModel.all(true),
  ]);
  const { resolved, overridden } = resolveSiteImages(stored, settings.hero_image);
  const { resolved: fallbacks } = resolveSiteImages({}, settings.hero_image);

  return (
    <div>
      <h1 className="font-sans text-2xl font-bold text-ink">Site Images</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink/60">
        Add, remove and reorder the photos shown in each section of the website,
        then press <strong>Save changes</strong> on a card to publish them. If a
        section ends up with no images of its own, it falls back to the built-in
        photo.
      </p>
      <div className="mt-8">
        <SiteImagesManager
          sections={SITE_IMAGE_SECTIONS}
          initial={resolved}
          fallbacks={fallbacks}
          overridden={overridden}
          rooms={rooms.map((r) => ({
            id: r.id,
            name: r.name,
            is_active: r.is_active,
            images: r.images,
          }))}
        />
      </div>
    </div>
  );
}
