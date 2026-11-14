import { Fragment, type ReactNode } from "react";

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

/**
 * Renders the light markup of the game texts (content/games.ts):
 * `*accent*` → <em>, `**strong**` → <strong>, `` `code` `` → <code>.
 */
export function rich(text: string): ReactNode {
  return text.split(TOKEN).map((part, index) => {
    if (part.startsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}
