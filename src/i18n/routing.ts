import { defineRouting } from "next-intl/routing";

/**
 * French is the default locale and is served without a prefix (`/`),
 * English lives under `/en` with translated pathnames.
 * Keys are the internal (French) pathnames: always link with those.
 */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  // `/` must always be the French page (static, cacheable); visitors switch with the FR/EN toggle.
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/jeux": { fr: "/jeux", en: "/games" },
    "/jeux/[slug]": { fr: "/jeux/[slug]", en: "/games/[slug]" },
    "/news": "/news",
    "/news/[slug]": "/news/[slug]",
    "/parcours": { fr: "/parcours", en: "/career" },
    "/nid": { fr: "/nid", en: "/nest" },
    "/services": "/services",
    "/a-propos": { fr: "/a-propos", en: "/about" },
    "/contact": "/contact",
    "/mentions-legales": { fr: "/mentions-legales", en: "/legal-notice" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathname = keyof typeof routing.pathnames;
/** Pathnames without dynamic segments (usable as plain `href`). */
export type StaticPathname = Exclude<Pathname, `${string}[${string}`>;
