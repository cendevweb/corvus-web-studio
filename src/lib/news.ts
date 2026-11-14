import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { isGameSlug, type GameSlug } from "@content/games";
import type { Locale } from "@content/types";

/**
 * News loader: reads `content/news/<locale>/<slug>.md` (frontmatter + Markdown body).
 * Server-only (uses the file system at build time). See content/news/README.md for the schema.
 */

export const NEWS_TYPES = ["patch-note", "devlog", "announcement", "behind-the-scenes", "video"] as const;
export type NewsType = (typeof NEWS_TYPES)[number];
export type NewsGame = GameSlug | "studio";

export interface NewsMeta {
  slug: string;
  locale: Locale;
  title: string;
  excerpt: string;
  game: NewsGame;
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  type: NewsType;
  cover?: string;
  coverAlt?: string;
  /** Minutes. */
  readingTime?: number;
  /** Announces something that is not released yet. */
  upcoming: boolean;
  /** Highlighted on the news page. */
  featured: boolean;
  /** Position among the home page cards. */
  home?: number;
  tags: string[];
  video?: string;
  /** Shorter wording for compact cards. */
  teaser?: { title?: string; excerpt?: string };
  /** Short programme shown on the featured card of the news page. */
  highlights: string[];
  /** Wording of the main button on the featured card ("Regarder le Direct"). */
  ctaLabel?: string;
  /** Illustrated poster replacing the cover at the top of the article. */
  hero?: NewsHero;
  /** Call to action closing the article ("Kaido attend." + play button). */
  cta?: NewsCta;
}

export interface NewsHero {
  /** Big pixel title drawn on the poster. */
  title: string;
  label?: string;
  caption?: string;
  alt?: string;
  /** Cut-out illustrations, in order: left, right, centre (front). */
  cutouts: string[];
}

export interface NewsCta {
  title: string;
  note?: string;
  label?: string;
  /** Defaults to the game's URL. */
  href?: string;
}

export interface NewsArticle extends NewsMeta {
  /** Raw Markdown body. */
  body: string;
}

const NEWS_DIR = path.join(process.cwd(), "content", "news");
const cache = new Map<Locale, NewsArticle[]>();

function fail(file: string, message: string): never {
  throw new Error(`[news] ${file}: ${message}`);
}

function toIsoDate(value: unknown, file: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return fail(file, "`date` must be an ISO date (YYYY-MM-DD)");
}

function parse(file: string, locale: Locale): NewsArticle {
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const str = (key: string): string => {
    const value: unknown = data[key];
    if (typeof value !== "string" || !value.trim()) fail(file, `missing \`${key}\``);
    return value;
  };
  const optStr = (key: string): string | undefined =>
    typeof data[key] === "string" && data[key] ? (data[key] as string) : undefined;

  const game = str("game");
  if (game !== "studio" && !isGameSlug(game)) fail(file, `unknown game "${game}"`);
  const type = str("type");
  if (!(NEWS_TYPES as readonly string[]).includes(type)) fail(file, `unknown type "${type}"`);
  if (str("lang") !== locale) fail(file, `\`lang\` must be "${locale}"`);

  const teaser = data.teaser as { title?: unknown; excerpt?: unknown } | undefined;
  const text = (value: unknown): string | undefined => (typeof value === "string" && value ? value : undefined);
  const strings = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);
  const hero = data.hero as Record<string, unknown> | undefined;
  const cta = data.cta as Record<string, unknown> | undefined;

  return {
    slug: path.basename(file, path.extname(file)),
    locale,
    title: str("title"),
    excerpt: str("excerpt"),
    game: game as NewsGame,
    date: toIsoDate(data.date, file),
    type: type as NewsType,
    cover: optStr("cover"),
    coverAlt: optStr("coverAlt"),
    readingTime: typeof data.readingTime === "number" ? data.readingTime : undefined,
    upcoming: data.upcoming === true,
    featured: data.featured === true,
    home: typeof data.home === "number" ? data.home : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    video: optStr("video"),
    teaser: teaser
      ? {
          title: typeof teaser.title === "string" ? teaser.title : undefined,
          excerpt: typeof teaser.excerpt === "string" ? teaser.excerpt : undefined,
        }
      : undefined,
    highlights: strings(data.highlights),
    ctaLabel: optStr("ctaLabel"),
    hero:
      hero && text(hero.title)
        ? {
            title: text(hero.title)!,
            label: text(hero.label),
            caption: text(hero.caption),
            alt: text(hero.alt),
            cutouts: strings(hero.cutouts),
          }
        : undefined,
    cta:
      cta && text(cta.title)
        ? { title: text(cta.title)!, note: text(cta.note), label: text(cta.label), href: text(cta.href) }
        : undefined,
    body: content.trim(),
  };
}

/** Every publication of a locale, most recent first. */
export function getAllNews(locale: Locale): NewsArticle[] {
  const cached = cache.get(locale);
  if (cached) return cached;
  const dir = path.join(NEWS_DIR, locale);
  const items = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((name) => /\.mdx?$/.test(name) && name.toLowerCase() !== "readme.md")
        .map((name) => parse(path.join(dir, name), locale))
        .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
    : [];
  cache.set(locale, items);
  return items;
}

export function getNewsBySlug(locale: Locale, slug: string): NewsArticle | undefined {
  return getAllNews(locale).find((item) => item.slug === slug);
}

export function getNewsByGame(locale: Locale, game: NewsGame): NewsArticle[] {
  return getAllNews(locale).filter((item) => item.game === game);
}

/** Cards curated for the home page (`home: 1..n` in the frontmatter), falling back to the latest ones. */
export function getHomeNews(locale: Locale, count = 3): NewsArticle[] {
  const all = getAllNews(locale);
  const curated = all
    .filter((item) => item.home !== undefined)
    .sort((a, b) => (a.home ?? 0) - (b.home ?? 0));
  const rest = all.filter((item) => item.home === undefined);
  return [...curated, ...rest].slice(0, count);
}

export function getNewsSlugs(): string[] {
  return getAllNews("fr").map((item) => item.slug);
}
