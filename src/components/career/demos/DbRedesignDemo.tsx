"use client";

import { useState } from "react";
import type { CareerDemoContent } from "@content/career-demos";
import { cn } from "@/lib/cn";
import { Segmented } from "./shared";

type State = "before" | "after";
type ColumnKind = "k" | "fk" | "w" | undefined;
type Column = readonly [name: string, kind?: ColumnKind];

/** Generic schema: table and column names are made up. */
const LEGACY_COLUMNS: readonly Column[] = [
  ["id", "k"],
  ["email"],
  ["first_name"],
  ["last_name"],
  ["company_name", "w"],
  ["company_country", "w"],
  ["is_admin", "w"],
  ["is_editor", "w"],
  ["brand_1", "w"],
  ["brand_2", "w"],
  ["brand_3", "w"],
  ["prefs_json", "w"],
];

const TABLES: ReadonlyArray<{ name: string; columns: readonly Column[] }> = [
  { name: "users", columns: [["id", "k"], ["email"], ["created_at"]] },
  { name: "memberships", columns: [["user_id", "fk"], ["org_id", "fk"], ["role_id", "fk"]] },
  { name: "orgs", columns: [["id", "k"], ["name"], ["country"]] },
  { name: "profiles", columns: [["user_id", "fk"], ["locale"], ["prefs"]] },
  { name: "roles", columns: [["id", "k"], ["label"], ["scope"]] },
  { name: "brands", columns: [["id", "k"], ["org_id", "fk"], ["name"]] },
];

/** Relations, drawn in % of the 3 × 2 grid. */
const LINKS = [
  { from: "users", to: "memberships", x1: 16.6, y1: 25, x2: 50, y2: 25 },
  { from: "memberships", to: "orgs", x1: 50, y1: 25, x2: 83.4, y2: 25 },
  { from: "users", to: "profiles", x1: 16.6, y1: 25, x2: 16.6, y2: 75 },
  { from: "memberships", to: "roles", x1: 50, y1: 25, x2: 50, y2: 75 },
  { from: "orgs", to: "brands", x1: 83.4, y1: 25, x2: 83.4, y2: 75 },
] as const;

function Columns({ columns }: { columns: readonly Column[] }) {
  return (
    <ul>
      {columns.map(([name, kind]) => (
        <li className={kind} key={name}>
          {name}
        </li>
      ))}
    </ul>
  );
}

/** Case 05: a catch-all table before, six normalised tables after. Hovering a table highlights its relations. */
export function DbRedesignDemo({ t }: { t: CareerDemoContent<"db-redesign"> }) {
  const [state, setState] = useState<State>("after");
  const [hovered, setHovered] = useState<string | null>(null);

  const related = new Set<string>();
  if (hovered) {
    related.add(hovered);
    for (const link of LINKS) {
      if (link.from === hovered) related.add(link.to);
      if (link.to === hovered) related.add(link.from);
    }
  }

  return (
    <div className="d5" data-s={state}>
      <div className="d-top">
        <Segmented
          label={t.stateLabel}
          value={state}
          onChange={setState}
          options={[
            { value: "before", label: t.before },
            { value: "after", label: t.after },
          ]}
        />
        <span className="d-note">{t.note}</span>
      </div>

      <div className="d5-st">
        <div className="d5-p d5-av" role="img" aria-label={t.beforeLabel}>
          <div className="tb tb-big">
            <b>users</b>
            <Columns columns={LEGACY_COLUMNS} />
          </div>
          <ul className="d5-warn">
            {t.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>

        <div className="d5-p d5-ap">
          <div
            className={cn("erd", hovered && "hov")}
            role="img"
            aria-label={t.afterLabel}
            onPointerLeave={() => setHovered(null)}
          >
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {LINKS.map((link) => (
                <line
                  key={`${link.from}-${link.to}`}
                  x1={link.x1}
                  y1={link.y1}
                  x2={link.x2}
                  y2={link.y2}
                  className={cn(hovered && (link.from === hovered || link.to === hovered) && "hl")}
                />
              ))}
            </svg>
            {TABLES.map((table) => (
              <div
                className={cn("tb", related.has(table.name) && "hl")}
                key={table.name}
                onPointerEnter={() => setHovered(table.name)}
              >
                <b>{table.name}</b>
                <Columns columns={table.columns} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
