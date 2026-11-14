import type { ReactNode } from "react";
import type { WorkId } from "@content/career";

/**
 * Placeholder illustrations of the career achievements: neutral line drawings
 * (no company logo or screenshot) until the real visuals are provided.
 * Classes: .s stroke, .i iridescent stroke, .f soft fill, .fi iridescent fill, .flow animated dashes.
 */
const VISUALS: Record<WorkId, (labels: { if: string }) => ReactNode> = {
  "screenshot-bot": () => (
    <>
      <rect className="s" x="6" y="22" width="78" height="56" rx="8" />
      <circle className="f" cx="20" cy="36" r="6" />
      <path className="s" d="M32 34h36M32 41h22M16 54h56M16 62h44" />
      <path className="i flow" d="M94 50h40" />
      <path className="i" d="m128 44 7 6-7 6" />
      <rect className="s" x="150" y="14" width="80" height="72" rx="4" />
      <path className="i" d="M144 24v-16h16M236 76v16h-16" />
      <path className="f" d="m158 76 20-26 14 16 10-10 20 20z" />
      <circle className="fi" cx="214" cy="30" r="5" />
    </>
  ),
  "entity-builder": (labels) => (
    <>
      <rect className="s" x="6" y="38" width="52" height="24" rx="6" />
      <path className="s" d="M16 50h32" />
      <path className="i" d="m96 30 20 20-20 20-20-20z" />
      <path className="s" d="M58 50h18" />
      <path className="i flow" d="M116 50h20c8 0 8-28 16-28h20M116 50h20c8 0 8 28 16 28h20" />
      <rect className="s" x="174" y="10" width="60" height="24" rx="6" />
      <rect className="s" x="174" y="66" width="60" height="24" rx="6" />
      <path className="f" d="M182 18h30v8h-30z" />
      <path className="s" d="M182 78h44" />
      <text x="96" y="54" textAnchor="middle" fontSize="13" fill="currentColor" style={{ fontFamily: "var(--pixel)" }}>
        {labels.if}
      </text>
    </>
  ),
  monorepo: () => (
    <>
      <g className="s">
        <rect x="6" y="6" width="34" height="16" rx="4" />
        <rect x="6" y="30" width="34" height="16" rx="4" />
        <rect x="6" y="54" width="34" height="16" rx="4" />
        <rect x="6" y="78" width="34" height="16" rx="4" />
      </g>
      <path
        className="i flow"
        d="M40 14c50 0 50 36 100 36M40 38c40 0 60 12 100 12M40 62c40 0 60-12 100-12M40 86c50 0 50-36 100-36"
      />
      <rect className="i" x="142" y="22" width="92" height="56" rx="8" />
      <path className="s" d="M154 38h30M154 50h66M154 62h48" />
      <circle className="fi" cx="220" cy="36" r="4" />
    </>
  ),
  "adtech-forms": () => (
    <>
      <circle className="fi" cx="20" cy="16" r="7" />
      <circle className="s" cx="76" cy="16" r="7" />
      <circle className="s" cx="132" cy="16" r="7" />
      <path className="i" d="M27 16h42" />
      <path className="s flow" d="M83 16h42" />
      <rect className="s" x="6" y="36" width="134" height="18" rx="5" />
      <rect className="s" x="6" y="62" width="62" height="18" rx="5" />
      <rect className="s" x="78" y="62" width="62" height="18" rx="5" />
      <path className="f" d="M14 42h50v6H14zM14 68h30v6H14z" />
      <rect className="i" x="160" y="6" width="74" height="88" rx="8" />
      <path className="f" d="M168 14h58v40h-58z" />
      <path className="s" d="M168 64h44M168 74h28" />
    </>
  ),
  "db-redesign": () => (
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
  serverless: () => (
    <>
      <circle className="fi" cx="14" cy="50" r="6" />
      <path className="i flow" d="M22 50h26" />
      <g className="s">
        <rect x="52" y="30" width="12" height="40" rx="3" />
        <rect x="68" y="30" width="12" height="40" rx="3" />
        <rect x="84" y="30" width="12" height="40" rx="3" />
      </g>
      <path className="i flow" d="M100 50h26" />
      <circle className="i" cx="150" cy="50" r="22" />
      <path className="s" d="m142 40 6 0 10 20m-8-10-8 10" />
      <path className="i flow" d="M172 50h14c8 0 8-24 16-24h10M172 50h14c8 0 8 24 16 24h10" />
      <rect className="s" x="214" y="16" width="20" height="20" rx="5" />
      <rect className="s" x="214" y="64" width="20" height="20" rx="5" />
    </>
  ),
};

interface WorkVisualProps {
  id: WorkId;
  /** Corner label ("VISUEL À VENIR"). */
  tag: string;
  /** Word drawn inside the condition diamond ("si" / "if"). */
  ifLabel?: string;
}

export function WorkVisual({ id, tag, ifLabel = "si" }: WorkVisualProps) {
  return (
    <div className="w-vis" aria-hidden="true">
      <svg viewBox="0 0 240 100">{VISUALS[id]({ if: ifLabel })}</svg>
      <span className="w-tag">{tag}</span>
    </div>
  );
}
