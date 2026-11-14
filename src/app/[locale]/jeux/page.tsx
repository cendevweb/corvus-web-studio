import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { games } from "@content/games";
import { GamesList } from "@/components/games/GamesList";
import { JsonLd } from "@/components/ui/JsonLd";
import { videoGameJsonLd } from "@/lib/jsonld";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import "@/styles/pages/games.css";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.games" });
  return buildMetadata({ locale, href: "/jeux", title: t("title"), description: t("description") });
}

/** Games list: One Piexel as the showcase, then Iconic and Fastr (same cards as the home page). */
export default async function GamesPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.games" });
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("title"),
    url: absoluteUrl("/jeux", locale),
    itemListElement: games.map((game, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: videoGameJsonLd(game, locale),
    })),
  };

  return (
    <>
      <JsonLd data={list} />
      <GamesList />
    </>
  );
}
