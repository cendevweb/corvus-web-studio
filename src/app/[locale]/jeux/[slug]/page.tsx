import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { games, getGame } from "@content/games";
import {
  GameChallenge,
  GameHero,
  GameNews,
  GamePitch,
  GamePlay,
  GameRole,
  GameShots,
  OtherGames,
} from "@/components/games/GameSections";
import { toNewsCards } from "@/components/news/card-data";
import { JsonLd } from "@/components/ui/JsonLd";
import { routing } from "@/i18n/routing";
import { videoGameJsonLd } from "@/lib/jsonld";
import { getNewsByGame } from "@/lib/news";
import { resolveLocale } from "@/lib/page";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

type Params = Promise<{ locale: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => games.map((game) => ({ locale, slug: game.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const game = getGame((await params).slug);
  if (!game) return {};
  return buildMetadata({
    locale,
    href: { pathname: "/jeux/[slug]", params: { slug: game.slug } },
    title: game.seo.title[locale],
    description: game.seo.description[locale],
    image: { url: game.media.poster.src, alt: game.media.poster.alt[locale] },
  });
}

/** Game page: hero in the game's skin, pitch, screenshots, challenge + playable demo, role, news, play, other games. */
export default async function GamePage({ params }: { params: Params }) {
  const locale = await resolveLocale(params);
  const game = getGame((await params).slug);
  if (!game) notFound();

  const nav = await getTranslations({ locale, namespace: "nav" });
  const cards = await toNewsCards(getNewsByGame(locale, game.slug).slice(0, 3), locale);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: nav("games"), item: absoluteUrl("/jeux", locale) },
      {
        "@type": "ListItem",
        position: 2,
        name: game.name,
        item: absoluteUrl({ pathname: "/jeux/[slug]", params: { slug: game.slug } }, locale),
      },
    ],
  };

  return (
    <div className={`gp gp-${game.skin}`}>
      <JsonLd data={[videoGameJsonLd(game, locale), breadcrumb]} />
      <GameHero game={game} locale={locale} />
      <GamePitch game={game} locale={locale} />
      <GameShots game={game} locale={locale} />
      <GameChallenge game={game} locale={locale} />
      <GameRole game={game} locale={locale} />
      <GameNews game={game} locale={locale} cards={cards} />
      <GamePlay game={game} locale={locale} />
      <OtherGames game={game} locale={locale} />
    </div>
  );
}
