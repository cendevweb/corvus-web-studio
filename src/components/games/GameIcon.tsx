import type { SVGProps } from "react";
import type { PlatformIcon } from "@content/games";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const ICONS = {
  web: {
    viewBox: "0 0 20 20",
    body: (
      <g {...stroke}>
        <rect x="2" y="3.5" width="16" height="13" rx="2.5" />
        <path d="M2 7.5h16M5 5.6h.01M7.6 5.6h.01" />
      </g>
    ),
  },
  devices: {
    viewBox: "0 0 20 20",
    body: (
      <g {...stroke}>
        <rect x="1.5" y="4" width="11.5" height="8.5" rx="1.5" />
        <path d="M4.5 16h5.5M7.2 12.5V16" />
        <rect x="13.5" y="7" width="5" height="9.5" rx="1.4" />
      </g>
    ),
  },
  gamepad: {
    viewBox: "0 0 20 20",
    body: (
      <g {...stroke}>
        <path d="M6 6h8a4.5 4.5 0 0 1 4.4 5.4l-.5 2.4a2 2 0 0 1-3.5.9L13 13H7l-1.4 1.7a2 2 0 0 1-3.5-.9l-.5-2.4A4.5 4.5 0 0 1 6 6Z" />
        <path d="M6.2 8.6v2.6M4.9 9.9h2.6M13.4 9.2h.01M15 10.6h.01" />
      </g>
    ),
  },
  language: {
    viewBox: "0 0 20 20",
    body: (
      <g {...stroke}>
        <circle cx="10" cy="10" r="7.5" />
        <path d="M2.5 10h15M10 2.5c2.4 2.2 2.4 12.8 0 15M10 2.5c-2.4 2.2-2.4 12.8 0 15" />
      </g>
    ),
  },
  user: {
    viewBox: "0 0 20 20",
    body: (
      <g {...stroke}>
        <circle cx="10" cy="7" r="3.4" />
        <path d="M3.5 17c.8-3.3 3.3-5 6.5-5s5.7 1.7 6.5 5" />
      </g>
    ),
  },
  free: {
    viewBox: "0 0 20 20",
    body: <path {...stroke} d="M10 2.5 12.3 7.3l5.2.7-3.8 3.6.9 5.2L10 14.3l-4.6 2.5.9-5.2L2.5 8l5.2-.7Z" />,
  },
  zoom: {
    viewBox: "0 0 16 16",
    body: <path {...stroke} strokeWidth={1.7} d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" />,
  },
  close: {
    viewBox: "0 0 16 16",
    body: <path {...stroke} strokeWidth={1.8} d="m3.5 3.5 9 9M12.5 3.5l-9 9" />,
  },
} as const;

export type GameIconName = PlatformIcon | "zoom" | "close";

/** Icons used only by the game pages (platforms, lightbox). Decorative: always hidden from assistive tech. */
export function GameIcon({ name, ...props }: { name: GameIconName } & Omit<SVGProps<SVGSVGElement>, "name">) {
  const icon = ICONS[name];
  return (
    <svg viewBox={icon.viewBox} focusable="false" aria-hidden="true" {...props}>
      {icon.body}
    </svg>
  );
}
