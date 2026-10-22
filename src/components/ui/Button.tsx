import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const base =
  "label-caps inline-flex items-center justify-center gap-2 px-7 py-3.5 transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-charcoal text-stone hover:bg-charcoal-light",
  accent: "bg-petrol-500 text-stone hover:bg-petrol-600",
  outline:
    "border border-ink/25 text-ink hover:bg-petrol-50 hover:border-petrol-300 bg-transparent",
  ghost: "text-ink-soft hover:bg-petrol-50 hover:text-ink",
};

type Variant = keyof typeof variants;

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
