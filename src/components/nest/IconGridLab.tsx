"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { skinFontVariables } from "@/lib/fonts-skins";
import { prefersReducedMotion } from "@/lib/media";
import { ICONS, type IconGridKey } from "./IconGridDemo";
import { useNestMessages } from "./use-nest-messages";

/** AA-contrast variants of the Iconic palette on white cards. */
const COLORS = ["#1f7f7d", "#d9534f", "#a56f0c", "#2b72b8"] as const;
const REWARD = 25;
const START = ICONS.map((_, index) => index);

/**
 * Nid experiment 03, full version: Iconic-style flip cards whose state lives in `aria-pressed`,
 * with the game's reward (25 ICoins the first time a card is revealed), "flip all" and "shuffle".
 * The home page keeps the compact `IconGridDemo`.
 */
export function IconGridLab() {
  const t = useNestMessages("grid");
  const names = useTranslations("demos.grid.icons");
  const [order, setOrder] = useState<number[]>(START);
  const [flipped, setFlipped] = useState<ReadonlySet<IconGridKey>>(new Set());
  const [seen, setSeen] = useState<ReadonlySet<IconGridKey>>(new Set());
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const flip = (key: IconGridKey, on: boolean) => {
    setFlipped((current) => {
      const next = new Set(current);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
    if (on) setSeen((current) => (current.has(key) ? current : new Set(current).add(key)));
  };

  const complete = flipped.size === ICONS.length;

  const flipAll = () => {
    const on = !complete;
    timers.current.forEach(clearTimeout);
    const delay = prefersReducedMotion() ? 0 : 45;
    timers.current = order.map((iconIndex, position) =>
      setTimeout(() => flip(ICONS[iconIndex]!.key, on), position * delay),
    );
  };

  const shuffle = () => {
    timers.current.forEach(clearTimeout);
    const next = [...START];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j]!, next[i]!];
    }
    setOrder(next);
    setFlipped(new Set());
  };

  return (
    <div className={cn("x-demo lab-grid", skinFontVariables.iconic)}>
      <span className="live">
        <i aria-hidden="true" />
        {t("live")}
      </span>
      <p className="fg-hud">
        <span>
          {flipped.size} / {ICONS.length}
        </span>
        <span className="coin">{t("coins", { n: seen.size * REWARD })}</span>
      </p>
      <div className="fg">
        {order.map((iconIndex, position) => {
          const icon = ICONS[iconIndex]!;
          const on = flipped.has(icon.key);
          return (
            <button
              key={icon.key}
              type="button"
              aria-pressed={on}
              aria-label={
                on ? t("flipped", { name: names(icon.key), n: position + 1 }) : t("hidden", { n: position + 1 })
              }
              onClick={() => flip(icon.key, !on)}
            >
              <span className="q">?</span>
              <span className="a" style={{ color: COLORS[iconIndex % COLORS.length] }}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d={icon.d} />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
      <p className={cn("fg-done", complete && "on")} role="status">
        {complete ? t("done") : ""}
      </p>
      <div className="fg-act">
        <button type="button" className="fg-btn a" onClick={flipAll}>
          {complete ? t("hideAll") : t("flipAll")}
        </button>
        <button type="button" className="fg-btn b" onClick={shuffle}>
          {t("shuffle")}
        </button>
      </div>
    </div>
  );
}
