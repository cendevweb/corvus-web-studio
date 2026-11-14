import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { games } from "@content/games";
import { CareerSection } from "@/components/home/CareerSection";
import { ContactSection } from "@/components/home/ContactSection";
import { FeaturedGames } from "@/components/home/FeaturedGames";
import { Hero } from "@/components/home/Hero";
import { NestSection } from "@/components/home/NestSection";
import { NewsSection } from "@/components/home/NewsSection";
import { toNewsCards } from "@/components/news/card-data";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { organizationJsonLd, personJsonLd, videoGameJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { getHomeNews } from "@/lib/news";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return buildMetadata({
    locale,
    href: "/",
    title: t("title"),
    description: t("description"),
    absoluteTitle: true,
  });
}

export default async function HomePage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "home.news" });
  const news = await getTranslations({ locale, namespace: "news" });
  const cards = await toNewsCards(getHomeNews(locale), locale, { compact: true });

  const filters = [
    { key: "all", label: news("filterAll") },
    ...games.map((game) => ({ key: game.slug as string, label: game.name, color: game.colors.tag })),
  ];
  const emptyMessages = Object.fromEntries(games.map((game) => [game.slug, t("empty", { game: game.name })]));

  return (
    <>
      <JsonLd
        data={[
          websiteJsonLd(locale),
          organizationJsonLd(locale),
          personJsonLd(locale),
          ...games.map((game) => videoGameJsonLd(game, locale)),
        ]}
      />
      <Hero />
      <FeaturedGames />
      <NewsSection
        heading={
          <SectionHeading
            kicker={t("kicker")}
            title={t.rich("title", { em: (chunks) => <em>{chunks}</em>, br: () => <br /> })}
          />
        }
        filters={filters}
        filterLabel={t("filterLabel")}
        items={cards}
        emptyMessages={emptyMessages}
        emptyLink={
          <Link className="link" href="/news">
            {t("emptyLink")}
            <Icon name="arrow" />
          </Link>
        }
      />
      <CareerSection />
      <NestSection />
      <ContactSection />
    </>
  );
}
