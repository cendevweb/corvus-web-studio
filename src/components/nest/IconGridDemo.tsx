"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { skinFontVariables } from "@/lib/fonts-skins";

const ICONS = [
  { key: "crown", d: "M3 18h18l1-10-5 4-5-8-5 8-5-4z" },
  { key: "sword", d: "M19 2l3 0 0 3-11 11 2 2-2 2-3-3-4 4-2-2 4-4-3-3 2-2 2 2z" },
  { key: "bolt", d: "M14 1 4 14h6l-2 9 12-14h-7z" },
  { key: "moon", d: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z" },
  { key: "star", d: "m12 2 3 7 7 .6-5.4 4.6L18.5 22 12 17.8 5.5 22l1.9-7.8L2 9.6 9 9z" },
  {
    key: "anchor",
    d: "M12 2a3 3 0 0 0-1.5 5.6V10H7v3h3.5v6A6 6 0 0 1 5 14H2a10 10 0 0 0 20 0h-3a6 6 0 0 1-5.5 5v-6H17v-3h-3.5V7.6A3 3 0 0 0 12 2z",
  },
  { key: "heart", d: "M12 21C5 15 2 12 2 8a5 5 0 0 1 10-1.5A5 5 0 0 1 22 8c0 4-3 7-10 13z" },
  { key: "flag", d: "M5 2h2v1h12l-3 5 3 5H7v9H5z" },
] as const;

export type IconGridKey = (typeof ICONS)[number]["key"];

const COLORS = ["#1f7f7d", "#d9534f", "#c98a14", "#358AD9"] as const;

/** Nid demo 03: Iconic-style flip cards. The state lives in aria-pressed, which CSS reads to rotate the card. */
export function IconGridDemo() {
  const t = useTranslations("demos.grid");
  const common = useTranslations("common");
  const [flipped, setFlipped] = useState<ReadonlySet<IconGridKey>>(new Set());

  const toggle = (key: IconGridKey) =>
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className={cn("t-demo d-grid", skinFontVariables.iconic)}>
      <span className="live">
        <i aria-hidden="true" />
        {common("live")}
      </span>
      <span className="ig-count">
        {flipped.size} / {ICONS.length}
      </span>
      <div className="ig">
        {ICONS.map((icon, index) => {
          const on = flipped.has(icon.key);
          return (
            <button
              key={icon.key}
              type="button"
              aria-pressed={on}
              aria-label={on ? t("flipped", { name: t(`icons.${icon.key}`) }) : t("hidden", { n: index + 1 })}
              onClick={() => toggle(icon.key)}
            >
              <span className="q">?</span>
              <span className="a" style={{ color: COLORS[index % COLORS.length] }}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d={icon.d} />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
