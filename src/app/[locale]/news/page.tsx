import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { games } from "@content/games";
import { getSocial, type SocialId } from "@content/site";
import { toFeedItems } from "@/components/news/feed-data";
import { LineIcon } from "@/components/news/icons";
import { NewsExplorer, type NewsFilterOption } from "@/components/news/NewsExplorer";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { getAllNews } from "@/lib/news";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { getPageTranslations } from "@/lib/page-messages";
import { buildMetadata } from "@/lib/seo";
import "@/styles/pages/news.css";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.news" });
  return buildMetadata({ locale, href: "/news", title: t("title"), description: t("description") });
}

const FOLLOW: SocialId[] = ["youtube", "github", "x", "tiktok"];

export default async function NewsPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getPageTranslations(locale, "newsPage");
  const news = await getTranslations({ locale, namespace: "news" });
  const format = await getFormatter({ locale });

  const all = getAllNews(locale);
  const feed = await toFeedItems(all, locale);
  const featured = feed.find((item) => all.find((a) => a.slug === item.slug)?.featured) ?? null;
  const rows = feed.filter((item) => item !== featured);

  const longDate = (iso: string) =>
    format.dateTime(new Date(`${iso}T12:00:00Z`), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const countOf = (key: string) => feed.filter((item) => item.game === key).length;
  const gameFilters = games
    .map((game) => ({ key: game.slug as string, label: game.name, color: game.colors.tag, count: countOf(game.slug) }))
    .filter((filter) => filter.count > 0)
    // Busiest game first, then the one that published most recently.
    .sort(
      (a, b) =>
        b.count - a.count ||
        feed.findIndex((item) => item.game === a.key) - feed.findIndex((item) => item.game === b.key),
    );
  const studioCount = countOf("studio");
  const filters: NewsFilterOption[] = [
    { key: "all", label: news("filterAll"), count: feed.length, summary: t("count", { count: feed.length }) },
    ...gameFilters.map((filter) => ({
      ...filter,
      summary: `${t("count", { count: filter.count })} · ${filter.label}`,
    })),
    ...(studioCount
      ? [
          {
            key: "studio",
            label: news("studio"),
            count: studioCount,
            color: "#B1A0FF",
            summary: `${t("count", { count: studioCount })} · ${news("studio")}`,
          },
        ]
      : []),
  ];

  const latest = feed.find((item) => !item.upcoming) ?? feed[0];
  const oldest = all[all.length - 1];
  const youtube = getSocial("youtube");

  return (
    <div className="pg-news">
      <section className="ph">
        <div className="wrap ph-grid">
          <div>
            <Reveal as="p" className="eyebrow">
              <i aria-hidden="true" />
              {t("eyebrow", { count: feed.length, games: gameFilters.length })}
            </Reveal>
            <Reveal as="h1" delay={60}>
              {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
            </Reveal>
            <Reveal as="p" className="lede" delay={120}>
              {t("lede")}
            </Reveal>
          </div>
          <Reveal className="ph-side" delay={180}>
            {youtube.url && (
              <a className="btn btn-ghost btn-sm" href={youtube.url} target="_blank" rel="noopener">
                <Icon name="youtube" />
                {t("youtube")}
              </a>
            )}
            {latest && (
              <p className="ph-last">
                {t("last")} <b>{latest.dateLabel}</b>
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <NewsExplorer
        filters={filters}
        featured={featured}
        items={rows}
        labels={{
          filterLabel: t("filterLabel"),
          featuredLabel: t("featured.label"),
          featuredFlag: t("featured.flag"),
          program: t("featured.program"),
          watch: t("featured.watch"),
          read: t("featured.read"),
          gameLink: t("featured.gameLink"),
          listTitle: t("list.title"),
          end: oldest ? t("list.end", { date: longDate(oldest.date) }) : "",
          top: t("list.top"),
        }}
      />

      <section className="sec sub-sec" aria-label={t("subscribe.label")}>
        <div className="wrap sub">
          <Reveal className="card sub-c sub-nl">
            <span className="sub-badge soon">{t("subscribe.letter.badge")}</span>
            <h2>{t.rich("subscribe.letter.title", { em: (chunks) => <em>{chunks}</em> })}</h2>
            <p>{t("subscribe.letter.text")}</p>
            <form noValidate>
              <fieldset className="nl" disabled aria-describedby="nl-note">
                <label htmlFor="nl-mail">{t("subscribe.letter.field")}</label>
                <div className="nl-row">
                  <input id="nl-mail" type="email" autoComplete="email" placeholder={t("subscribe.letter.placeholder")} />
                  <button className="btn btn-main" type="submit">
                    {t("subscribe.letter.button")}
                  </button>
                </div>
              </fieldset>
            </form>
            <p className="nl-note" id="nl-note">
              <LineIcon name="clock" />
              <span>{t("subscribe.letter.note")}</span>
            </p>
          </Reveal>
          <Reveal className="card sub-c sub-fo" delay={60}>
            <span className="sub-badge">{t("subscribe.follow.badge")}</span>
            <h2>{t("subscribe.follow.title")}</h2>
            <ul className="fo">
              {FOLLOW.map((id) => {
                const social = getSocial(id);
                if (!social.url) return null;
                return (
                  <li key={id}>
                    <a href={social.url} target="_blank" rel="noopener">
                      <Icon name={id as "youtube" | "github" | "x" | "tiktok"} />
                      <span>
                        <b>{social.label}</b>
                        <small>{t(`subscribe.follow.${id}`)}</small>
                      </span>
                      <Icon name="arrow" className="go" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
