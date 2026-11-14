import type { SVGProps } from "react";

/** Inline SVG icons (same drawings as the mockups). Decorative by default: pass `title` to expose a label. */
const ICONS = {
  github: {
    viewBox: "0 0 24 24",
    body: (
      <path
        fill="currentColor"
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C2.422 18.07 1.633 17.7 1.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    ),
  },
  x: {
    viewBox: "0 0 24 24",
    body: (
      <path
        fill="currentColor"
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
      />
    ),
  },
  youtube: {
    viewBox: "0 0 24 24",
    body: (
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4.6 4.6h14.8A3.6 3.6 0 0 1 23 8.2v7.6a3.6 3.6 0 0 1-3.6 3.6H4.6A3.6 3.6 0 0 1 1 15.8V8.2a3.6 3.6 0 0 1 3.6-3.6ZM9.7 8.4v7.2l6.2-3.6Z"
      />
    ),
  },
  tiktok: {
    viewBox: "0 0 24 24",
    body: (
      <path
        fill="currentColor"
        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
      />
    ),
  },
  linkedin: {
    viewBox: "0 0 24 24",
    body: (
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"
      />
    ),
  },
  twitch: {
    viewBox: "0 0 24 24",
    body: (
      <path
        fill="currentColor"
        d="M11.57 4.71h1.72v5.15h-1.72zm4.72 0H18v5.15h-1.71zM6 0 1.71 4.29v15.42h5.15V24l4.28-4.29h3.43L22.29 12V0zm14.57 11.14-3.43 3.43h-3.43l-3 3v-3H6.86V1.71h13.71z"
      />
    ),
  },
  instagram: {
    viewBox: "0 0 24 24",
    body: (
      <>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          d="M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10a4.5 4.5 0 0 1-4.5 4.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5Z"
        />
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
      </>
    ),
  },
  search: {
    viewBox: "0 0 16 16",
    body: (
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10Zm3.7-1.3L14 14"
      />
    ),
  },
  sun: {
    viewBox: "0 0 24 24",
    body: (
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </g>
    ),
  },
  moon: {
    viewBox: "0 0 24 24",
    body: (
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
      />
    ),
  },
  copy: {
    viewBox: "0 0 16 16",
    body: (
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        d="M5.5 5.5h8v8h-8zM10.5 5.5v-3h-8v8h3"
      />
    ),
  },
  check: {
    viewBox: "0 0 16 16",
    body: (
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 8.5 3.2 3L13 4.5"
      />
    ),
  },
  arrow: {
    viewBox: "0 0 16 16",
    body: (
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8h10M9 4l4 4-4 4"
      />
    ),
  },
  play: { viewBox: "0 0 16 16", body: <path fill="currentColor" d="M4 2.5v11l9-5.5z" /> },
  download: {
    viewBox: "0 0 16 16",
    body: (
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10"
      />
    ),
  },
  bolt: { viewBox: "0 0 14 20", body: <path fill="currentColor" d="M9 0 0 11h5.5L4 20l10-12H8z" /> },
} as const;

export type IconName = keyof typeof ICONS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  /** Accessible name. Without it the icon is hidden from assistive tech. */
  title?: string;
}

export function Icon({ name, title, ...props }: IconProps) {
  const icon = ICONS[name];
  return (
    <svg
      viewBox={icon.viewBox}
      focusable="false"
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
      {...props}
    >
      {icon.body}
    </svg>
  );
}

/** Shared <defs> (iridescent gradient for strokes/fills: `url(#iris)`). Rendered once in the layout. */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="iris" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9C85FF" />
          <stop offset="1" stopColor="#3DDC97" />
        </linearGradient>
      </defs>
    </svg>
  );
}
