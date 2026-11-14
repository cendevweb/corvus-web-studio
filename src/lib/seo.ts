import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { site } from "@content/site";

type Href = Parameters<typeof getPathname>[0]["href"];

const OG_LOCALES: Record<Locale, string> = { fr: "fr_FR", en: "en_US" };

/** Absolute URL of an internal route for a locale (`/jeux` → `https://…/en/games`). */
export function absoluteUrl(href: Href, locale: Locale): string {
  const pathname = getPathname({ href, locale });
  return `${site.url}${pathname === "/" ? "" : pathname}` || site.url;
}

/** hreflang map for a route, including `x-default` (French). */
export function languageAlternates(href: Href): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) languages[locale] = absoluteUrl(href, locale);
  languages["x-default"] = absoluteUrl(href, routing.defaultLocale);
  return languages;
}

export interface PageSeo {
  locale: Locale;
  /** Internal (French) pathname, e.g. "/jeux" or { pathname: "/jeux/[slug]", params: { slug } }. */
  href: Href;
  title: string;
  description: string;
  /** Use the title as-is instead of the "%s · Corvus Web Studio" template. */
  absoluteTitle?: boolean;
  /** Overrides the default Open Graph image. */
  image?: { url: string; width?: number; height?: number; alt?: string };
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
}

/**
 * Per-page metadata helper: title, description, canonical, hreflang, Open Graph and Twitter card.
 *
 *   export async function generateMetadata({ params }) {
 *     const { locale } = await params;
 *     const t = await getTranslations({ locale, namespace: "meta.games" });
 *     return buildMetadata({ locale, href: "/jeux", title: t("title"), description: t("description") });
 *   }
 */
export function buildMetadata(page: PageSeo): Metadata {
  const url = absoluteUrl(page.href, page.locale);
  const image = page.image ?? { ...site.ogImage, alt: site.name };
  const fullTitle = page.absoluteTitle ? page.title : `${page.title} · ${site.name}`;

  return {
    title: page.absoluteTitle ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: url, languages: languageAlternates(page.href) },
    openGraph: {
      type: page.type ?? "website",
      url,
      siteName: site.name,
      title: fullTitle,
      description: page.description,
      locale: OG_LOCALES[page.locale],
      alternateLocale: routing.locales.filter((l) => l !== page.locale).map((l) => OG_LOCALES[l]),
      images: [image],
      ...(page.type === "article" && page.publishedTime ? { publishedTime: page.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: page.description,
      images: [image.url],
    },
    ...(page.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
