import { getFormatter, getTranslations } from "next-intl/server";
import { getGame } from "@content/games";
import type { Locale } from "@/i18n/routing";
import { publicImageSize } from "@/lib/image-size";
import { readingMinutes } from "@/lib/markdown/outline";
import type { NewsArticle } from "@/lib/news";
import { getPageTranslations } from "@/lib/page-messages";

export const STUDIO_COLOR = "#B1A0FF";

/** Display-ready data of a publication on the news page (resolved on the server). */
export interface FeedItem {
  slug: string;
  /** Filter key: game slug or "studio". */
  game: string;
  gameName: string;
  color: string;
  /** Skin of the thumbnail frame. */
  skin: "op" | "fa" | "ic" | "st";
  dateIso: string;
  /** "21" */
  day: string;
  /** "nov. 2026" */
  monthYear: string;
  /** "14 nov. 2026" */
  dateLabel: string;
  /** "2026-11", groups the list. */
  monthKey: string;
  /** "Novembre 2026" */
  monthLabel: string;
  title: string;
  /** Title split at its colon: the second half is set in the accent typeface. */
  titleParts: [string, string | null];
  excerpt: string;
  /** Badge over the image ("PATCH NOTE"). */
  flag: string;
  /** Same, in sentence case for the meta line ("Patch note"). */
  kind: string;
  isVideo: boolean;
  upcoming: boolean;
  upcomingLabel: string;
  readingLabel?: string;
  tags: string[];
  cover?: { src: string; width: number; height: number; alt: string };
  highlights: string[];
  ctaLabel?: string;
}

const date = (iso: string) => new Date(`${iso}T12:00:00Z`);
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** French typography: no line break before a colon, semicolon, question or exclamation mark. */
export function typo(text: string, locale: Locale): string {
  return locale === "fr" ? text.replace(/ ([:;?!%»])/g, " $1").replace(/« /g, "« ") : text;
}

/** "Patch note du 18 octobre : 12 nouveaux combattants" → ["Patch note du 18 octobre :", "12 nouveaux combattants"]. */
export function splitTitle(title: string): [string, string | null] {
  const match = /^(.+?[\s ]?:)\s+(.+)$/.exec(title);
  return match ? [match[1]!, match[2]!] : [title, null];
}

export async function toFeedItems(items: readonly NewsArticle[], locale: Locale): Promise<FeedItem[]> {
  const news = await getTranslations({ locale, namespace: "news" });
  const t = await getPageTranslations(locale, "newsPage");
  const format = await getFormatter({ locale });

  return items.map((item) => {
    const game = item.game === "studio" ? undefined : getGame(item.game);
    const when = date(item.date);
    const size = item.cover ? publicImageSize(item.cover) : null;
    const title = typo(item.title, locale);
    return {
      slug: item.slug,
      game: item.game,
      gameName: game?.name ?? news("studio"),
      color: game?.colors.tag ?? STUDIO_COLOR,
      skin: game?.skin ?? "st",
      dateIso: item.date,
      day: format.dateTime(when, { day: "numeric", timeZone: "UTC" }),
      monthYear: format.dateTime(when, { month: "short", year: "numeric", timeZone: "UTC" }),
      dateLabel: format.dateTime(when, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
      monthKey: item.date.slice(0, 7),
      monthLabel: capitalize(format.dateTime(when, { month: "long", year: "numeric", timeZone: "UTC" })),
      title,
      titleParts: splitTitle(title),
      excerpt: typo(item.excerpt, locale),
      flag: news(`types.${item.type}`),
      kind: t(`kinds.${item.type}`),
      isVideo: item.type === "video",
      upcoming: item.upcoming,
      upcomingLabel: news("upcoming"),
      // Only long reads announce their reading time in the list.
      readingLabel: item.readingTime && item.readingTime >= 3 ? t("list.readingTime", { n: item.readingTime }) : undefined,
      tags: item.tags,
      cover:
        item.cover && size
          ? { src: item.cover, width: size.width, height: size.height, alt: item.coverAlt ?? "" }
          : undefined,
      highlights: item.highlights,
      ctaLabel: item.ctaLabel,
    };
  });
}

/** Reading time of an article: the frontmatter value, or an estimate from its body. */
export const articleReadingTime = (article: NewsArticle): number => article.readingTime ?? readingMinutes(article.body);
