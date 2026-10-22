"use client";

import DepthCarousel from "@/components/site/DepthCarousel";
import { stockImages } from "@/lib/stockImages";

const ethosCarouselItems = [
  {
    image: stockImages.escapeTall,
    alt: "Morning mist over the hills near Mapple View",
  },
  {
    image: stockImages.escapeSquare,
    alt: "A warm, quiet corner at Mapple View",
  },
  {
    image: stockImages.gallery.sunbeams,
    alt: "Morning light over the tea ridge",
  },
  {
    image: stockImages.gallery.facade,
    alt: "The estate from the driveway",
  },
];

export default function EthosDepthCarousel() {
  return (
    <div className="relative h-[400px] w-full sm:h-[420px]">
      <DepthCarousel
        items={ethosCarouselItems}
        cardWidth={280}
        cardHeight={340}
        radius={4}
        tint="#1b1c1a"
        depth={180}
        spread={72}
        tilt={18}
        tiltDirection="right"
        perspective={1400}
        visibleCards={3}
        falloff={0.2}
        blur={0}
        autoplay
        autoplayDelay={4000}
        loop
        showControls
        showIndicators
      />
    </div>
  );
}
