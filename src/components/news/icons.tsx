import type { SVGProps } from "react";

/** Icons used by the news and Nid pages only (same drawings as the mockups). */
const PATHS = {
  clock: (
    <>
      <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M8 4.6V8l2.3 1.6" />
    </>
  ),
  back: (
    <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M13 8H3M7 4 3 8l4 4" />
  ),
  code: (
    <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M5.5 4 1.8 8l3.7 4M10.5 4l3.7 4-3.7 4" />
  ),
} as const;

export function LineIcon({ name, ...props }: { name: keyof typeof PATHS } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" {...props}>
      {PATHS[name]}
    </svg>
  );
}
