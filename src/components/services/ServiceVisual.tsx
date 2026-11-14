import type { ReactNode } from "react";
import type { ServiceId } from "@content/services";

/**
 * Line drawings of the four services (same vocabulary as the career visuals).
 * Classes: .s stroke, .i iridescent stroke, .f soft fill, .fi iridescent fill, .flow animated dashes.
 */
const VISUALS: Record<ServiceId, ReactNode> = {
  web: (
    <>
      <rect className="s" x="6" y="8" width="64" height="52" rx="5" />
      <path className="f" d="M6 13a5 5 0 0 1 5-5h54a5 5 0 0 1 5 5v9H6z" />
      <path className="s" d="M14 32h48M14 42h36M14 52h42" />
      <rect className="i" x="96" y="38" width="64" height="54" rx="5" />
      <path className="s" d="M104 62h48M104 72h30M104 82h40" />
      <path className="fi" d="M96 43a5 5 0 0 1 5-5h54a5 5 0 0 1 5 5v9H96z" opacity=".5" />
      <rect className="s" x="182" y="8" width="52" height="42" rx="5" />
      <path className="s" d="M190 24h36M190 34h24" />
      <path className="i flow" d="M70 34h12v30h14M160 64h10V30h12" />
    </>
  ),
  games: (
    <>
      <rect className="s" x="6" y="20" width="70" height="60" rx="6" />
      <path className="f" d="M16 62h14v10H16zM36 52h14v20H36zM56 44h10v28H56z" />
      <circle className="fi" cx="24" cy="36" r="5" />
      <rect className="s" x="164" y="20" width="70" height="60" rx="6" />
      <path className="f" d="M174 54h14v18h-14zM194 46h14v26h-14zM214 60h10v12h-10z" />
      <circle className="s" cx="216" cy="36" r="5" />
      <circle className="i" cx="120" cy="50" r="16" />
      <path className="i" d="m114 50 4 4 8-9" />
      <path
        className="i flow"
        d="M76 40c14 0 14 10 28 10M164 40c-14 0-14 10-28 10M76 62c14 0 14-12 28-12M164 62c-14 0-14-12-28-12"
      />
    </>
  ),
  ai: (
    <>
      <rect className="s" x="6" y="36" width="58" height="28" rx="14" />
      <path className="s" d="M18 50h34" />
      <circle className="i" cx="120" cy="50" r="20" />
      <path className="fi" d="m120 38 3.5 8.5L132 50l-8.5 3.5L120 62l-3.5-8.5L108 50l8.5-3.5z" />
      <path className="i flow" d="M64 50h36" />
      <path className="i flow" d="M140 50h12c8 0 8-32 16-32h10M140 50h38M140 50h12c8 0 8 32 16 32h10" />
      <rect className="s" x="180" y="8" width="54" height="20" rx="5" />
      <rect className="s" x="180" y="40" width="54" height="20" rx="5" />
      <rect className="s" x="180" y="72" width="54" height="20" rx="5" />
      <path className="f" d="M188 15h24v6h-24zM188 47h34v6h-34zM188 79h18v6h-18z" />
    </>
  ),
  components: (
    <>
      <rect className="i" x="6" y="10" width="72" height="24" rx="12" />
      <path className="s" d="M24 22h36" />
      <rect className="s" x="6" y="44" width="72" height="24" rx="6" />
      <path className="f" d="M14 52h28v8H14z" />
      <rect className="s" x="6" y="78" width="34" height="14" rx="7" />
      <circle className="fi" cx="33" cy="85" r="5" />
      <path className="i flow" d="M78 22h20c8 0 8 28 16 28M78 56h36M40 85h58c8 0 8-35 16-35" />
      <rect className="s" x="116" y="8" width="118" height="84" rx="8" />
      <path className="f" d="M126 18h98v26h-98z" />
      <path className="s" d="M126 56h60M126 66h40" />
      <rect className="i" x="126" y="74" width="40" height="12" rx="6" />
    </>
  ),
};

export function ServiceVisual({ id }: { id: ServiceId }) {
  return (
    <div className="w-vis" aria-hidden="true">
      <svg viewBox="0 0 240 100" focusable="false">
        {VISUALS[id]}
      </svg>
    </div>
  );
}
