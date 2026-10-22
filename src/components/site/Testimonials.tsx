function parseTestimonials(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [quote, attribution] = line.split("|").map((s) => s.trim());
      return { quote, attribution: attribution || "" };
    })
    .filter((t) => t.quote);
}

export default function Testimonials({ raw }: { raw: string }) {
  const testimonials = parseTestimonials(raw);
  if (testimonials.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {testimonials.slice(0, 6).map((t, i) => (
        <div key={i} className="flex flex-col justify-between bg-petrol-50 p-8">
          <p className="font-display text-lg font-normal italic leading-snug text-ink">
            &ldquo;{t.quote}&rdquo;
          </p>
          {t.attribution && (
            <span className="label-caps mt-6 block text-ink-soft/70">{t.attribution}</span>
          )}
        </div>
      ))}
    </div>
  );
}
