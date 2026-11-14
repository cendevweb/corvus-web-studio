import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale, StaticPathname } from "@/i18n/routing";

/**
 * French typography: non-breaking space before `: ; ? !` and inside « guillemets ».
 * Content files keep plain spaces so they stay easy to edit.
 */
export function typo(text: string, locale: Locale): string {
  if (locale !== "fr") return text;
  return text.replace(/ ([:;?!»])/g, " $1").replace(/« /g, "« ");
}

/** `[label](href)` · `**bold**` · `[… à confirmer]` / `[… to be confirmed]` */
const TOKEN = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|(\[[^\]]*(?:à confirmer|to be confirmed)\])/g;

/**
 * Light inline markup for career content:
 * - `[label](#anchor)` in-page link, `[label](/route)` internal link (French pathname);
 * - `**bold**` iridescent highlight;
 * - `[chiffre à confirmer]` markers, shown as dashed amber chips until the figure is known.
 */
export function RichText({ text, locale }: { text: string; locale: Locale }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(TOKEN)) {
    const [raw, label, href, bold, marker] = match;
    const index = match.index;
    if (index > cursor) nodes.push(typo(text.slice(cursor, index), locale));
    if (label && href) {
      nodes.push(
        href.startsWith("#") ? (
          <a key={index} href={href}>
            {typo(label, locale)}
          </a>
        ) : (
          <Link key={index} href={href as StaticPathname}>
            {typo(label, locale)}
          </Link>
        ),
      );
    } else if (bold) {
      nodes.push(<strong key={index}>{bold.replace(/ /g, " ")}</strong>);
    } else if (marker) {
      nodes.push(
        <span className="tbc" key={index}>
          {marker}
        </span>,
      );
    }
    cursor = index + raw.length;
  }
  if (cursor < text.length) nodes.push(typo(text.slice(cursor), locale));
  return <>{nodes}</>;
}
