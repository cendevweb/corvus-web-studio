"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { getPathname } from "./navigation";
import { routing, type Locale, type Pathname } from "./routing";

export interface InternalRoute {
  /** Internal (French) pathname template, e.g. "/jeux/[slug]". */
  pathname: Pathname;
  params: Record<string, string>;
  /** False when the URL matches no known route (404). */
  known: boolean;
}

const TEMPLATES = (Object.keys(routing.pathnames) as Pathname[]).map((pathname) => ({
  pathname,
  parts: pathname.split("/").filter(Boolean),
}));

function match(segments: string[]): InternalRoute {
  for (const { pathname, parts } of TEMPLATES) {
    if (parts.length !== segments.length) continue;
    const params: Record<string, string> = {};
    const ok = parts.every((part, index) => {
      const segment = segments[index]!;
      if (part.startsWith("[") && part.endsWith("]")) {
        params[part.slice(1, -1)] = segment;
        return true;
      }
      return part === segment;
    });
    if (ok) return { pathname, params, known: true };
  }
  return { pathname: "/", params: {}, known: false };
}

/**
 * The current route as an internal pathname template + params.
 *
 * Built from the layout segments (the real folders under `app/[locale]`) rather than from the URL,
 * so it is identical during static prerendering and in the browser, whatever the locale prefix
 * or translated pathname (`/en/games/fastr` → "/jeux/[slug]", { slug: "fastr" }).
 * Must be called from a component rendered by the `[locale]` layout (the Header is).
 */
export function useInternalRoute(): InternalRoute {
  const segments = useSelectedLayoutSegments().filter((segment) => !segment.startsWith("("));
  return match(segments);
}

/** URL of the current page in a given language (`/jeux/fastr` ↔ `/en/games/fastr`). */
export function useLocalizedPath(): (locale: Locale) => string {
  const { pathname, params } = useInternalRoute();
  return (locale) =>
    getPathname({
      // @ts-expect-error -- `pathname` and `params` come from the same route template, so they match.
      href: { pathname, params },
      locale,
    });
}
