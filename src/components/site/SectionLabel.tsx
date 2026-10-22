export default function SectionLabel({
  index,
  eyebrow,
  className = "",
}: {
  index?: string;
  eyebrow: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="label-caps text-petrol-500">
        {index ? `${index} // ` : ""}
        {eyebrow}
      </span>
      <span className="h-px w-10 bg-line" />
    </div>
  );
}
