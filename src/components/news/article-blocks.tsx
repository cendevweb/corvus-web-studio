import type { CSSProperties, ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Rich blocks of a news article, written in Markdown as fenced code blocks:
 *
 *   ```roster Les 12 nouveaux combattants
 *   Arlong
 *   Kaido | 1250 PV
 *   ```
 *
 * One line per entry, fields separated by ` | `. See content/news/README.md.
 * An unknown block name simply renders as a code block.
 */

const ICONS: Record<string, { viewBox: string; body: ReactNode }> = {
  shield: {
    viewBox: "0 0 44 44",
    body: (
      <>
        <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" d="M22 5 37 10v11c0 9-6 15-15 18C13 36 7 30 7 21V10z" />
        <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="m15 22 5 5 9-10" />
      </>
    ),
  },
  armor: {
    viewBox: "0 0 44 44",
    body: (
      <>
        <rect x="8" y="8" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M2 16h6M2 28h6M36 22h6M16 22h12" />
      </>
    ),
  },
  clock: {
    viewBox: "0 0 44 44",
    body: (
      <>
        <circle cx="22" cy="24" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M22 16v8l5 4M17 4h10" />
      </>
    ),
  },
  break: {
    viewBox: "0 0 44 44",
    body: (
      <>
        <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" d="M6 14h32v16H6z" />
        <path fill="currentColor" d="M6 14h16v16H6z" opacity=".35" />
        <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="m24 6-4 12h6l-4 12" />
      </>
    ),
  },
  star: {
    viewBox: "0 0 44 44",
    body: (
      <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" d="m22 5 5.2 11 12 1.4-8.9 8.200 2.400 11.900L22 31.600 11.300 37.500l2.400-11.900-8.900-8.200 12-1.400z" />
    ),
  },
  bolt: {
    viewBox: "0 0 44 44",
    body: <path fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" d="M25 4 9 25h10l-3 15 19-23H24z" />,
  },
  keyboard: {
    viewBox: "0 0 40 30",
    body: (
      <>
        <rect x="2" y="6" width="36" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M8 12h2M14 12h2M20 12h2M26 12h2M32 12h0M11 18h18" />
      </>
    ),
  },
  touch: {
    viewBox: "0 0 40 30",
    body: (
      <>
        <rect x="12" y="2" width="16" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="17" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  gamepad: {
    viewBox: "0 0 40 30",
    body: (
      <>
        <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" d="M11 7h18c5 0 8 6 9 13 .5 4-3 6-6 3l-4-4H12l-4 4c-3 3-6.500 1-6-3C3 13 6 7 11 7Z" />
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M10 13h6M13 10v6M27 12h0M30 15h0" />
      </>
    ),
  },
  desktop: {
    viewBox: "0 0 40 30",
    body: (
      <>
        <rect x="4" y="3" width="32" height="19" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M14 27h12M20 22v5" />
      </>
    ),
  },
};

function BlockIcon({ name }: { name: string }) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg viewBox={icon.viewBox} aria-hidden="true" focusable="false">
      {icon.body}
    </svg>
  );
}

const rows = (source: string): string[][] =>
  source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+\|\s+/).map((cell) => cell.trim()));

/** `Name | note`: a grid of names, highlighted when they carry a note. */
function Roster({ source, label }: { source: string; label?: string }) {
  return (
    <Reveal as="ul" className="roster" aria-label={label}>
      {rows(source).map(([name, note], index) => (
        <li key={`${name}-${index}`} data-n={String(index + 1).padStart(2, "0")} className={note ? "hi" : undefined}>
          <span>{name}</span>
          {note && <small>{note}</small>}
        </li>
      ))}
    </Reveal>
  );
}

/** `icon | Title | text`: illustrated cards. */
function Cards({ source }: { source: string }) {
  return (
    <Reveal as="ul" className="mech">
      {rows(source).map((cells, index) => {
        const [icon, title, text] = cells.length >= 3 ? cells : ["", cells[0], cells[1]];
        return (
          <li key={`${title}-${index}`} className={icon && ICONS[icon] ? undefined : "no-ico"}>
            {icon && <BlockIcon name={icon} />}
            <b>{title}</b>
            <p>{text}</p>
          </li>
        );
      })}
    </Reveal>
  );
}

/** `icon | Label`: small tiles in a row. */
function Tiles({ source }: { source: string }) {
  return (
    <Reveal as="ul" className="pads">
      {rows(source).map((cells, index) => {
        const [icon, label] = cells.length >= 2 ? cells : ["", cells[0]];
        return (
          <li key={`${label}-${index}`}>
            {icon && <BlockIcon name={icon} />}
            {label}
          </li>
        );
      })}
    </Reveal>
  );
}

/** `key: value` lines (`steps`, `start`, `end`, `note`, `alt`): a rising bar chart between two labelled ends. */
function Ladder({ source }: { source: string }) {
  const fields = new Map<string, string>();
  for (const line of source.split("\n")) {
    const match = /^\s*(\w+)\s*:\s*(.+?)\s*$/.exec(line);
    if (match) fields.set(match[1]!, match[2]!);
  }
  const steps = Math.max(2, Math.min(16, Number(fields.get("steps")) || 9));
  const end = (value: string | undefined) => (value ?? "").split(/\s+\|\s+/);
  const [startName, startValue] = end(fields.get("start"));
  const [endName, endValue] = end(fields.get("end"));
  const note = fields.get("note");

  return (
    <Reveal className="ladder" role="img" aria-label={fields.get("alt") ?? note}>
      <div
        className="ladder-bars"
        aria-hidden="true"
        style={{ "--steps": steps, gridTemplateColumns: `repeat(${steps}, 1fr)` } as CSSProperties}
      >
        {Array.from({ length: steps }, (_, index) => (
          <i key={index} style={{ "--i": index } as CSSProperties} />
        ))}
      </div>
      <div className="ladder-x" aria-hidden="true">
        <span>
          {startName}
          <b>{startValue}</b>
        </span>
        <span>
          {endName}
          <b>{endValue}</b>
        </span>
      </div>
      {note && <p className="ladder-n">{note}</p>}
    </Reveal>
  );
}

/** Renders a fenced block by name, or `null` when the name is not a known block. */
export function renderBlock(name: string, source: string, meta?: string): ReactNode | null {
  switch (name) {
    case "roster":
      return <Roster source={source} label={meta} />;
    case "cards":
      return <Cards source={source} />;
    case "tiles":
      return <Tiles source={source} />;
    case "ladder":
      return <Ladder source={source} />;
    default:
      return null;
  }
}
