"use client";

import { useState } from "react";
import type { CareerDemoContent } from "@content/career-demos";
import { cn } from "@/lib/cn";

const RULES = ["top", "live", "out"] as const;
type Rule = (typeof RULES)[number];

/** Case 02: if/then rules toggled on the left, a player card that reacts on the right. */
export function EntityBuilderDemo({ t }: { t: CareerDemoContent<"entity-builder"> }) {
  const [active, setActive] = useState<Record<Rule, boolean>>({ top: true, live: false, out: false });
  const toggle = (rule: Rule) => setActive((state) => ({ ...state, [rule]: !state[rule] }));

  return (
    <div className="d2">
      <div>
        <p className="d-note pv-cap">
          <span>{t.rulesTitle}</span>
          <span>{t.rulesHint}</span>
        </p>
        <ul className="rules">
          {RULES.map((rule) => (
            <li className={cn("rule", active[rule] && "on")} key={rule}>
              <p>
                <b>{t.ifLabel}</b>
                <span>{t.rules[rule].condition}</span>
              </p>
              <p>
                <b>{t.thenLabel}</b>
                {t.rules[rule].effect}
              </p>
              <button
                type="button"
                className="sw"
                role="switch"
                aria-checked={active[rule]}
                aria-label={t.rules[rule].toggle}
                onClick={() => toggle(rule)}
              >
                <i />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="d-note pv-cap">
          <span>{t.previewTitle}</span>
          <span>{t.previewHint}</span>
        </p>
        <div
          className={cn("pv", active.top && !active.out && "is-top", active.live && "is-live", active.out && "is-out")}
          aria-live="polite"
        >
          <div className="pv-top">
            <span className="pv-av" aria-hidden="true">
              {t.player.initials}
            </span>
            <div>
              <b>{t.player.name}</b>
              <span>{t.player.role}</span>
            </div>
          </div>
          <p className="pv-badges">
            <em className={cn("b-top", active.top && "show")}>{t.badges.top}</em>
            <em className={cn("b-out", active.out && "show")}>{t.badges.out}</em>
          </p>
          <div className="pv-stats">
            <div>
              <b>{active.top ? t.player.goals.top : t.player.goals.base}</b>
              <span>{t.player.goalsLabel}</span>
            </div>
            {t.player.stats.map((stat) => (
              <div key={stat.label}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="pv-live">
            <div>
              <p>
                <b>
                  <i />
                  {t.liveLabel}
                </b>
                <span>{t.liveScore}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
