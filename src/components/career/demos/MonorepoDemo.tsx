"use client";

import { useRef, useState, type CSSProperties } from "react";
import type { CareerDemoContent } from "@content/career-demos";
import { Segmented, useVisibility } from "./shared";

type State = "before" | "after";

/** Scattered position (a*, tilt) and tidy position (b*) of each repository, in % of the stage. */
const REPOS = [
  { name: "web-app", ax: 3, ay: 8, tilt: -3, bx: 5, by: 26, color: "#F2B84B" },
  { name: "admin", ax: 37, ay: 20, tilt: 2, bx: 36.5, by: 26, color: "#FF6B7A" },
  { name: "api", ax: 70, ay: 6, tilt: -1.5, bx: 68, by: 26, color: "#3DDC97" },
  { name: "ui-kit", ax: 6, ay: 58, tilt: 2.5, bx: 5, by: 65, color: "#FF6B7A" },
  { name: "config", ax: 36, ay: 68, tilt: -2, bx: 36.5, by: 65, color: "#F2B84B" },
  { name: "workers", ax: 71, ay: 55, tilt: 3, bx: 68, by: 65, color: "#F2B84B" },
] as const;

/** Case 03: six drifting repositories converge into one monorepo. Plays once when scrolled into view. */
export function MonorepoDemo({ t }: { t: CareerDemoContent<"monorepo"> }) {
  const [state, setState] = useState<State>("before");
  const root = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  const touched = useRef(false);

  useVisibility(root, (visible) => {
    if (!visible || played.current) return;
    played.current = true;
    setTimeout(() => {
      if (!touched.current) setState("after");
    }, 900);
  });

  return (
    <div className="d3" data-s={state} ref={root}>
      <div className="d-top">
        <Segmented
          label={t.stateLabel}
          value={state}
          onChange={(next) => {
            touched.current = true;
            setState(next);
          }}
          options={[
            { value: "before", label: t.before },
            { value: "after", label: t.after },
          ]}
        />
        <span className="d-note">{t.note}</span>
      </div>

      <div className="d3-stage" role="img" aria-label={t.diagramLabel}>
        <svg className="d3-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M16 20 51 30M51 30 84 18M16 20 20 68M51 30 50 76M84 18 85 66M20 68 50 76M50 76 85 66M16 20 50 76M84 18 20 68" />
        </svg>
        <div className="d3-frame">
          <b>monorepo/</b>
        </div>
        <span className="d3-dir" style={{ top: "12%" }}>
          apps/
        </span>
        <span className="d3-dir" style={{ top: "51%" }}>
          packages/
        </span>
        {REPOS.map((repo, index) => (
          <span
            className="repo"
            key={repo.name}
            style={
              {
                "--ax": repo.ax,
                "--ay": repo.ay,
                "--rt": `${repo.tilt}deg`,
                "--bx": repo.bx,
                "--by": repo.by,
                "--dl": `${index * 50}ms`,
                "--ci": repo.color,
              } as CSSProperties
            }
          >
            <i />
            {repo.name}
          </span>
        ))}
      </div>

      <p className="d3-leg d-note">
        <span className="av">
          <i />
          {t.legendBefore}
        </span>
        <span className="ap">
          <i />
          {t.legendAfter}
        </span>
      </p>
    </div>
  );
}
