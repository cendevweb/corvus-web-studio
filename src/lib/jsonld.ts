import { figureValue } from "@content/types";
import type { Game } from "@content/games";
import { site, socials } from "@content/site";
import type { Locale } from "@/i18n/routing";
import { absoluteUrl } from "./seo";

/** schema.org helpers. Render the result with <JsonLd data={…} /> (components/ui/JsonLd.tsx). */

type JsonLdObject = Record<string, unknown>;

const personId = `${site.url}/#person`;
const orgId = `${site.url}/#organization`;

const publicSocialUrls = () => socials.flatMap((s) => (s.url ? [s.url] : []));

export function personJsonLd(locale: Locale): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId,
    name: site.author.name,
    jobTitle: site.author.jobTitle[locale],
    url: absoluteUrl("/a-propos", locale),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.author.city,
      addressCountry: site.author.country,
    },
    worksFor: { "@id": orgId },
    sameAs: publicSocialUrls(),
  };
}

export function organizationJsonLd(locale: Locale): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
    name: site.name,
    url: absoluteUrl("/", locale),
    logo: `${site.url}/images/brand/corbeau-logo.png`,
    founder: { "@id": personId },
    sameAs: publicSocialUrls(),
  };
}

export function websiteJsonLd(locale: Locale): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: absoluteUrl("/", locale),
    inLanguage: locale,
    publisher: { "@id": orgId },
  };
}

export function videoGameJsonLd(game: Game, locale: Locale): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    description: game.pitch.page[locale],
    url: game.url,
    mainEntityOfPage: absoluteUrl({ pathname: "/jeux/[slug]", params: { slug: game.slug } }, locale),
    image: `${site.url}${game.media.poster.src}`,
    genre: game.genre[locale],
    gamePlatform: ["Web browser", "Desktop", "Mobile"],
    operatingSystem: "Any",
    applicationCategory: "Game",
    playMode: game.slug === "iconic" ? "SinglePlayer" : "MultiPlayer",
    inLanguage: locale,
    author: { "@id": personId },
    publisher: { "@id": orgId },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", availability: "https://schema.org/InStock" },
    ...(game.media.trailer
      ? {
          trailer: {
            "@type": "VideoObject",
            name: `${game.name} — trailer`,
            description: game.pitch.card[locale],
            contentUrl: `${site.url}${game.media.trailer.src}`,
            thumbnailUrl: `${site.url}${game.media.poster.src}`,
          },
        }
      : {}),
    additionalProperty: game.kpis.map((kpi) => ({
      "@type": "PropertyValue",
      name: kpi.label[locale],
      value: figureValue(kpi.value, locale),
    })),
  };
}
