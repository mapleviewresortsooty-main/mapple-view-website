"use client";

import { format, parseISO } from "date-fns";
import { useState } from "react";
import type { InputHTMLAttributes } from "react";

/**
 * iOS Safari renders <input type="date"> values with an inner offset that CSS
 * cannot reach (the text sits well right of the padding box). So the real
 * input is stretched, invisible, across a styled box — taps still open the
 * native picker on every platform, but the text shown is formatted here.
 * Use focus-within: utilities (not focus:) in className for focus styling.
 */
export default function DateField({
  value,
  defaultValue,
  onChange,
  className = "",
  placeholder = "Select date",
  displayFormat = "d MMM yyyy",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  placeholder?: string;
  displayFormat?: string;
}) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(
    typeof defaultValue === "string" ? defaultValue : ""
  );
  const current = isControlled ? String(value ?? "") : uncontrolled;

  const parsed = current ? parseISO(current) : null;
  const label =
    parsed && !Number.isNaN(parsed.getTime())
      ? format(parsed, displayFormat)
      : placeholder;

  return (
    <span className={`relative ${className}`}>
      <span
        aria-hidden="true"
        className={`min-w-0 truncate ${current ? "" : "text-ink/40"}`}
      >
        {label}
      </span>
      <input
        type="date"
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => {
          if (!isControlled) setUncontrolled(e.target.value);
          onChange?.(e);
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        {...props}
      />
    </span>
  );
}
