"use client";

import DepthCarousel from "@/components/site/DepthCarousel";

const alts = [
  "Morning mist over the hills near Mapple View",
  "A warm, quiet corner at Mapple View",
  "Morning light over the tea ridge",
  "The estate from the driveway",
];

export default function EthosDepthCarousel({ images }: { images: string[] }) {
  const items = images.map((image, i) => ({
    image,
    alt: alts[i] ?? "Mapple View Resort",
  }));
  return (
    <div className="relative h-[400px] w-full sm:h-[420px]">
      <DepthCarousel
        items={items}
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
