import type { MetadataRoute } from "next";
import { games } from "@content/games";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getAllNews } from "@/lib/news";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

type Href = Parameters<typeof getPathname>[0]["href"];

const STATIC_ROUTES: Array<{ href: Href; priority: number }> = [
  { href: "/", priority: 1 },
  { href: "/jeux", priority: 0.9 },
  { href: "/services", priority: 0.7 },
  { href: "/news", priority: 0.7 },
  { href: "/parcours", priority: 0.8 },
  { href: "/nid", priority: 0.6 },
  { href: "/a-propos", priority: 0.5 },
  { href: "/contact", priority: 0.6 },
  { href: "/mentions-legales", priority: 0.1 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (href: Href, priority: number, lastModified?: string): MetadataRoute.Sitemap =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(href, locale),
      priority,
      ...(lastModified ? { lastModified } : {}),
      alternates: { languages: languageAlternates(href) },
    }));

  return [
    ...STATIC_ROUTES.flatMap((route) => entry(route.href, route.priority)),
    ...games.flatMap((game) => entry({ pathname: "/jeux/[slug]", params: { slug: game.slug } }, 0.9)),
    ...getAllNews(routing.defaultLocale).flatMap((item) =>
      entry({ pathname: "/news/[slug]", params: { slug: item.slug } }, 0.5, item.date),
    ),
  ];
}
