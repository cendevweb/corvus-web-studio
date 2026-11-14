import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { games } from "@content/games";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Link } from "@/i18n/navigation";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.games" });
  return buildMetadata({ locale, href: "/jeux", title: t("title"), description: t("description") });
}

/** Skeleton route: list of the three games (no dedicated mockup; reuse the home cards and the game pages' minis). */
export default async function GamesPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "pages.games" });
  return (
    <PagePlaceholder title={t.rich("title", { em: (chunks) => <em>{chunks}</em> })} lede={t("lede")}>
      <ul className="mt-8 flex flex-wrap gap-3">
        {games.map((game) => (
          <li key={game.slug}>
            <Link className="chip" href={{ pathname: "/jeux/[slug]", params: { slug: game.slug } }}>
              {game.name}
            </Link>
          </li>
        ))}
      </ul>
    </PagePlaceholder>
  );
}
