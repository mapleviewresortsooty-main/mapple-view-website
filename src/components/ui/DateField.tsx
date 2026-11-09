"use client";

import { format, parseISO } from "date-fns";
import { useState } from "react";
import type { InputHTMLAttributes } from "react";

/**
 * iOS Safari renders <input type="date"> values with an inner offset that CSS
 * cannot reach, so the real input is stretched, invisible, across a styled
 * box — the text shown is formatted here instead. The invisible input needs
 * an explicit showPicker() to open the picker on desktop browsers (clicks
 * only hit the tiny calendar icon otherwise). Browsers with neither a native
 * picker nor showPicker (desktop Safari) get the input rendered normally so
 * keyboard entry stays usable.
 * Use focus-within: utilities (not focus:) in className for focus styling.
 */
export default function DateField({
  value,
  defaultValue,
  onChange,
  onClick,
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

  // Overlay the invisible input only where a picker can actually be opened:
  // iOS opens its wheel picker on tap regardless; Chrome/Firefox/Edge open it
  // via showPicker. Desktop Safari supports showPicker but throws for date
  // inputs (it has no popup picker) — it gets a normal visible input so
  // keyboard entry stays usable.
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS =
    /iP(ad|hone|od)/.test(ua) ||
    (typeof navigator !== "undefined" &&
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1);
  const isDesktopSafari =
    /safari/i.test(ua) &&
    !/chrome|chromium|crios|edg|firefox|fxios|opr|opera|android/i.test(ua) &&
    !isIOS;
  const overlay =
    isIOS ||
    (!isDesktopSafari &&
      typeof HTMLInputElement === "function" &&
      typeof HTMLInputElement.prototype.showPicker === "function");

  if (!overlay) {
    return (
      <span className={`relative ${className}`}>
        <input
          type="date"
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => {
            if (!isControlled) setUncontrolled(e.target.value);
            onChange?.(e);
          }}
          onClick={onClick}
          className="h-full w-full bg-transparent px-3 text-base text-ink outline-none"
          {...props}
        />
      </span>
    );
  }

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
        onClick={(e) => {
          try {
            e.currentTarget.showPicker();
          } catch {
            /* no picker on this browser — focus is enough */
          }
          onClick?.(e);
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        {...props}
      />
    </span>
  );
}
