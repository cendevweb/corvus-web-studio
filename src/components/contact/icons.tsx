import type { ReactNode } from "react";

/** Small icons used only by the contact page and the 404 scene (same drawings as the mockup). */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const;

const ICONS = {
  warn: <path {...stroke} d="M8 1.8 14.8 13.5H1.2zM8 6.5v3.2M8 11.6v.1" />,
  pin: (
    <>
      <path {...stroke} d="M8 14.5s4.6-4.3 4.6-8A4.6 4.6 0 0 0 3.4 6.500c0 3.700 4.600 8 4.600 8Z" />
      <circle cx="8" cy="6.4" r="1.6" fill="currentColor" />
    </>
  ),
  clock: (
    <>
      <circle {...stroke} cx="8" cy="8" r="6.2" />
      <path {...stroke} d="M8 4.6V8l2.3 1.6" />
    </>
  ),
  mail: <path {...stroke} d="M1.8 3.5h12.4v9H1.8zM2 4l6 5 6-5" />,
  back: <path {...stroke} strokeWidth={1.8} d="M13 8H3M7 4 3 8l4 4" />,
} as const satisfies Record<string, ReactNode>;

export function ContactIcon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className={className}>
      {ICONS[name]}
    </svg>
  );
}
