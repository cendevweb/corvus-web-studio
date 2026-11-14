import { getFormatter, getTranslations } from "next-intl/server";
import { getGame } from "@content/games";
import type { Locale } from "@/i18n/routing";
import type { NewsMeta } from "@/lib/news";
import type { NewsCardData } from "./NewsCard";

const STUDIO_COLOR = "#B1A0FF";

/**
 * Resolves a news item into display-ready card data (labels, formatted date, game colour).
 * `compact` prefers the shorter `teaser` wording when the article defines one (home page).
 */
export async function toNewsCards(
  items: readonly NewsMeta[],
  locale: Locale,
  { compact = false }: { compact?: boolean } = {},
): Promise<NewsCardData[]> {
  const t = await getTranslations({ locale, namespace: "news" });
  const format = await getFormatter({ locale });

  return items.map((item) => {
    const game = item.game === "studio" ? undefined : getGame(item.game);
    return {
      slug: item.slug,
      game: item.game,
      gameName: game?.name ?? t("studio"),
      color: game?.colors.tag ?? STUDIO_COLOR,
      dateIso: item.date,
      dateLabel: format.dateTime(new Date(`${item.date}T12:00:00Z`), {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      title: (compact && item.teaser?.title) || item.title,
      excerpt: (compact && item.teaser?.excerpt) || item.excerpt,
      kind: item.upcoming ? t("upcoming") : t(`types.${item.type}`),
      isVideo: item.type === "video",
      cta: t(`cta.${item.type}`),
      cover: item.cover,
      coverAlt: item.coverAlt,
    };
  });
}
