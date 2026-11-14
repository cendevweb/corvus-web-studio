import type { ReactNode } from "react";

/**
 * Tiny syntax highlighter for the short JS/CSS snippets shown on the site (Nid, news articles).
 * Four token kinds only: comments, strings, keywords, numbers (`.tk-c`, `.tk-s`, `.tk-k`, `.tk-n`).
 * No dependency: a full highlighter would weigh more than every snippet of the site together.
 */
const TOKEN =
  /(\/\/.*|\/\*[\s\S]*?\*\/)|('[^'\n]*'|"[^"\n]*"|`[^`]*`)|\b(const|let|return|if|else|new|function|export|import|from|for|while|await|async)\b|(@media|=>)|\b(\d+(?:\.\d+)?(?:ms|px|deg|s|%)?)\b/g;

export function highlight(source: string): ReactNode[] {
  const out: ReactNode[] = [];
  let index = 0;
  for (const match of source.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    if (start > index) out.push(source.slice(index, start));
    const kind = match[1] ? "c" : match[2] ? "s" : match[3] || match[4] ? "k" : "n";
    out.push(
      <span key={start} className={`tk-${kind}`}>
        {match[0]}
      </span>,
    );
    index = start + match[0].length;
  }
  if (index < source.length) out.push(source.slice(index));
  return out;
}
