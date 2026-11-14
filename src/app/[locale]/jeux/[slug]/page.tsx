import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { games, getGame } from "@content/games";
import { JsonLd } from "@/components/ui/JsonLd";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { routing } from "@/i18n/routing";
import { videoGameJsonLd } from "@/lib/jsonld";
import { resolveLocale } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

type Params = Promise<{ locale: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => games.map((game) => ({ locale, slug: game.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const game = getGame((await params).slug);
  if (!game) return {};
  const t = await getTranslations({ locale, namespace: "meta.game" });
  return buildMetadata({
    locale,
    href: { pathname: "/jeux/[slug]", params: { slug: game.slug } },
    title: game.name,
    description: t("description", { name: game.name, pitch: game.pitch.card[locale] }),
    image: { url: game.media.poster.src, alt: game.media.poster.alt[locale] },
  });
}

/** Skeleton route: to be integrated from the validated mockups (pages-a/jeu-<slug>). Content: content/games.ts. */
export default async function GamePage({ params }: { params: Params }) {
  const locale = await resolveLocale(params);
  const game = getGame((await params).slug);
  if (!game) notFound();
  const t = await getTranslations({ locale, namespace: "pages.game" });

  return (
    <>
      <JsonLd data={videoGameJsonLd(game, locale)} />
      <PagePlaceholder
        title={
          <>
            {game.name}
            <br />
            <em>{game.tagline.page[locale].replace(/^> /, "")}</em>
          </>
        }
        lede={`${game.pitch.page[locale]} ${t("lede", { name: game.name })}`}
      />
    </>
  );
}
