/** Authoritative Google Maps listing for the resort. */
export const RESORT_LOCATION = {
  /** Google Maps place name */
  placeName: "Maple View Resorts",
  /** Display address used in seed / backfill */
  address:
    "Maple View Resorts, Lovedale, Ooty (Udhagamandalam), Nilgiris District, Tamil Nadu, India",
  lat: 11.3882814,
  lng: 76.7076242,
  /** Compact hero coords label */
  coordsLabel: "11.388° N, 76.708° E",
  /** Direct link to the Google Maps place */
  placeUrl:
    "https://www.google.com/maps/place/Maple+view+resorts/@11.3882814,76.7076242,17z/data=!3m1!4b1!4m6!3m5!1s0x3ba8963cfd417715:0x7825fc289da64e7d!8m2!3d11.3882814!4d76.7076242!16s%2Fg%2F11cn7x3m78",
} as const;

export function mapsEmbedUrl(): string {
  const { lat, lng } = RESORT_LOCATION;
  return `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
}

export function mapsDirectionsUrl(): string {
  const { lat, lng } = RESORT_LOCATION;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
