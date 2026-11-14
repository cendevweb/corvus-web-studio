/** Headings, table of contents and lead paragraph of a news article written in Markdown. */

export interface HeadingParts {
  /** Small label above the title ("Roster"). */
  kicker?: string;
  title: string;
  /** Shorter wording for the table of contents. */
  short?: string;
}

export interface TocEntry {
  id: string;
  label: string;
}

/**
 * A level-2 heading may carry a kicker and a short label, separated by pipes:
 *   `## Les 12 nouveaux combattants`
 *   `## Roster | Les 12 nouveaux combattants`
 *   `## Roster | Les 12 nouveaux combattants | Les 12 combattants`
 */
export function parseHeading(text: string): HeadingParts {
  const parts = text
    .split(/\s+\|\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 3) return { kicker: parts[0], title: parts[1]!, short: parts[2] };
  if (parts.length === 2) return { kicker: parts[0], title: parts[1]! };
  return { title: parts[0] ?? text.trim() };
}

export function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** Gives every heading a unique id, in document order. */
export function createSlugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text) => {
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count + 1}` : base;
  };
}

const stripInline = (text: string) =>
  text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\\([\\`*_{}[\]()#+\-.!|])/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();

function level2Headings(body: string): Array<{ index: number; text: string }> {
  const headings: Array<{ index: number; text: string }> = [];
  let fence: string | null = null;
  let index = 0;
  for (const line of body.split("\n")) {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = marker[0]!;
      else if (marker[0] === fence) fence = null;
    } else if (!fence) {
      const match = /^##\s+(.+?)\s*#*\s*$/.exec(line);
      if (match) headings.push({ index, text: stripInline(match[1]!) });
    }
    index += line.length + 1;
  }
  return headings;
}

/** Table of contents: one entry per level-2 heading, with the ids the renderer will produce. */
export function extractToc(body: string): TocEntry[] {
  const slug = createSlugger();
  return level2Headings(body).map(({ text }) => {
    const { title, short } = parseHeading(text);
    const label = short ?? title;
    return { id: slug(label), label };
  });
}

/**
 * In a structured article (with level-2 headings) the text before the first heading is the lead,
 * shown in the header. Short posts have no lead: their whole body is the content.
 */
export function splitLead(body: string): { lead: string; content: string } {
  const first = level2Headings(body)[0];
  if (!first) return { lead: "", content: body };
  return { lead: body.slice(0, first.index).trim(), content: body.slice(first.index) };
}

/** Rough reading time, in minutes (200 words per minute). */
export function readingMinutes(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
