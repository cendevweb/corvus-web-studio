import type { Metadata } from "next";
import Image from "next/image";
import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getGame } from "@content/games";
import { site } from "@content/site";
import { ArticleBody, InlineMarkdown } from "@/components/news/ArticleBody";
import { ArticleToc } from "@/components/news/ArticleToc";
import { CopyAction } from "@/components/news/CopyAction";
import { articleReadingTime, splitTitle, STUDIO_COLOR, typo } from "@/components/news/feed-data";
import { LineIcon } from "@/components/news/icons";
import { ReadingBar } from "@/components/news/ReadingBar";
import { VideoFrame } from "@/components/news/VideoFrame";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { getPathname, Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { skinFontVariables } from "@/lib/fonts-skins";
import { publicImageSize } from "@/lib/image-size";
import { extractToc, splitLead } from "@/lib/markdown/outline";
import { parseVideo } from "@/lib/markdown/video";
import { organizationRef, personRef } from "@/lib/jsonld";
import { getAllNews, getNewsBySlug, getNewsSlugs, type NewsArticle } from "@/lib/news";
import { resolveLocale } from "@/lib/page";
import { getPageTranslations } from "@/lib/page-messages";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import "@/styles/pages/news.css";

type Params = Promise<{ locale: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getNewsSlugs().map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const article = getNewsBySlug(locale, (await params).slug);
  if (!article) return {};
  return buildMetadata({
    locale,
    href: { pathname: "/news/[slug]", params: { slug: article.slug } },
    title: article.title,
    description: article.excerpt,
    type: "article",
    publishedTime: article.date,
    image: article.cover ? { url: article.cover, alt: article.coverAlt } : undefined,
  });
}

type RelatedReason = "sequel" | "sequelPatch" | "sameGameVideo" | "sameGame" | "elsewhere" | "latest";

/** Three articles to read next: the direct follow-up, another one on the same game, one from elsewhere. */
function pickRelated(article: NewsArticle, all: NewsArticle[]): Array<{ item: NewsArticle; reason: RelatedReason }> {
  const others = all.filter((item) => item.slug !== article.slug);
  const picked: Array<{ item: NewsArticle; reason: RelatedReason }> = [];
  const add = (item: NewsArticle | undefined, reason: RelatedReason) => {
    if (item && picked.length < 3 && !picked.some((entry) => entry.item.slug === item.slug)) picked.push({ item, reason });
  };
  const sameGame = others.filter((item) => item.game === article.game);
  // `all` is sorted from newest to oldest: the follow-up is the oldest of the newer ones.
  const sequel = sameGame.filter((item) => item.date > article.date).at(-1);
  add(sequel, article.type === "patch-note" ? "sequelPatch" : "sequel");
  const other = sameGame.find((item) => item.slug !== sequel?.slug);
  add(other, other?.type === "video" ? "sameGameVideo" : "sameGame");
  add(
    others.find((item) => item.game !== article.game),
    "elsewhere",
  );
  for (const item of others) add(item, item.game === article.game ? "sameGame" : "latest");
  return picked;
}

export default async function NewsArticlePage({ params }: { params: Params }) {
  const locale = await resolveLocale(params);
  const article = getNewsBySlug(locale, (await params).slug);
  if (!article) notFound();

  const t = await getPageTranslations(locale, "newsPage.article");
  const news = await getTranslations({ locale, namespace: "news" });
  const format = await getFormatter({ locale });

  const game = article.game === "studio" ? undefined : getGame(article.game);
  const gameName = game?.name ?? news("studio");
  const color = game?.colors.tag ?? STUDIO_COLOR;
  const when = (iso: string) => new Date(`${iso}T12:00:00Z`);
  const longDate = format.dateTime(when(article.date), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const shortDate = (iso: string) =>
    format.dateTime(when(iso), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  const title = typo(article.title, locale);
  const [lead, accent] = splitTitle(title);
  const shortTitle = lead.replace(/[\s ]?:$/, "");
  const { lead: intro, content } = splitLead(article.body);
  const toc = extractToc(content);
  const url = absoluteUrl({ pathname: "/news/[slug]", params: { slug: article.slug } }, locale);

  const video = parseVideo(article.video);
  const cover = article.cover ? publicImageSize(article.cover) : null;
  const cutouts = (article.hero?.cutouts ?? []).flatMap((src) => {
    const size = publicImageSize(src);
    return size ? [{ src, ...size }] : [];
  });
  const isArt = Boolean(article.hero && cutouts.length > 0);
  const posterClass = `poster ${isArt ? "is-art" : "is-cover"}`;
  const poster = (
    <>
      {isArt
        ? cutouts.map((cutout, index) => (
            <Image
              key={cutout.src}
              className={["p-l", "p-r", "p-c"][index] ?? "p-c"}
              src={cutout.src}
              width={cutout.width}
              height={cutout.height}
              alt={index === cutouts.length - 1 ? (article.hero?.alt ?? "") : ""}
              sizes="(min-width: 760px) 420px, 50vw"
              // The whole hero is above the fold; the front cutout is the LCP candidate.
              loading="eager"
              fetchPriority={index === cutouts.length - 1 ? "high" : "auto"}
            />
          ))
        : article.cover &&
          cover && (
            <Image
              src={article.cover}
              width={cover.width}
              height={cover.height}
              alt={article.coverAlt ?? ""}
              sizes="(min-width: 1240px) 1160px, 100vw"
              loading="eager"
              fetchPriority="high"
            />
          )}
      {article.hero && (
        <span className="poster-t" aria-hidden="true">
          {article.hero.title}
          {article.hero.label && <small>{article.hero.label}</small>}
        </span>
      )}
      {video && (
        <span className="play" aria-hidden="true">
          <Icon name="play" />
          {t("playVideo").toUpperCase()}
        </span>
      )}
    </>
  );

  const all = getAllNews(locale);
  const related = pickRelated(article, all);
  const next = all.filter((item) => item.date > article.date || (item.date === article.date && item.slug > article.slug)).at(-1);
  const newsPath = getPathname({ href: "/news", locale });
  const copyLabels = { label: t("copyLink"), copiedLabel: t("copied") };

  return (
    <div className={`pg-article ${article.game === "one-piexel" ? skinFontVariables["one-piexel"] : ""}`} data-game={article.game}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: article.title,
          description: article.excerpt,
          datePublished: article.date,
          inLanguage: locale,
          mainEntityOfPage: url,
          image: article.cover ? `${site.url}${article.cover}` : undefined,
          author: personRef,
          publisher: organizationRef,
        }}
      />
      <ReadingBar target=".pg-article .prose" />
      <article>
        <header className="ah">
          <div className="wrap">
            <Reveal as="nav" className="crumb" aria-label={t("breadcrumb")}>
              <Link href="/news">{t("news")}</Link>
              <span aria-hidden="true">/</span>
              <a href={`${newsPath}#${article.game}`}>{gameName}</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{shortTitle}</span>
            </Reveal>
            <div className="ah-in">
              <Reveal as="p" className="a-meta">
                <span className="kind">{news(`types.${article.type}`)}</span>
                <span className="n-tag" style={{ "--c": color } as CSSProperties}>
                  <i aria-hidden="true" />
                  {gameName}
                </span>
                <time dateTime={article.date}>{longDate}</time>
                <span>{t("readingTime", { n: articleReadingTime(article) })}</span>
              </Reveal>
              <Reveal as="h1" delay={60}>
                {lead}
                {accent && (
                  <>
                    {" "}
                    <em>{accent}</em>
                  </>
                )}
              </Reveal>
              <Reveal as="p" className="chapo" delay={120}>
                {intro ? <InlineMarkdown>{typo(intro, locale)}</InlineMarkdown> : typo(article.excerpt, locale)}
              </Reveal>
              <Reveal className="by" delay={180}>
                <div className="by-who">
                  <span className="by-av">
                    <Image src="/images/brand/corbeau-logo.png" width={51} height={38} alt="" />
                  </span>
                  <span>
                    <b>{site.author.name}</b>
                    {game ? t("creator", { game: game.name }) : t("studio")}
                  </span>
                </div>
                <span className="by-sep" />
                <CopyAction source={{ page: true }} ariaLabel={t("copyLinkLabel")} {...copyLabels} />
              </Reveal>
            </div>
            {(isArt || (article.cover && cover)) && (
              <Reveal as="figure" className="hero-fig">
                {video ? (
                  <VideoFrame video={video} label={t("playHero", { title: article.title })} className={posterClass}>
                    {poster}
                  </VideoFrame>
                ) : (
                  <div className={posterClass}>{poster}</div>
                )}
                {article.hero?.caption && <figcaption>{article.hero.caption}</figcaption>}
              </Reveal>
            )}
          </div>
        </header>

        <div className={`wrap a-grid${toc.length ? "" : " no-toc"}`}>
          {toc.length > 0 && (
            <aside className="a-side">
              <ArticleToc entries={toc} label={t("toc")} />
              <div className="toc-x">
                <Link href="/news">
                  <LineIcon name="back" />
                  {t("allNews")}
                </Link>
                <span>{t("published", { date: shortDate(article.date) })}</span>
              </div>
            </aside>
          )}

          <div className="prose">
            <ArticleBody
              markdown={content}
              labels={{
                copy: t("copy"),
                copied: t("copied"),
                copyCode: t("copyCode"),
                copyChanges: t("copyChanges"),
                playVideo: t("playVideo"),
                video: t("video"),
                changelog: `${gameName} · ${shortDate(article.date)}`,
              }}
            />

            <Reveal as="footer" className="a-end">
              {article.cta && (
                <div className="playbox">
                  <p>
                    {article.cta.title}
                    {article.cta.note && <small>{article.cta.note}</small>}
                  </p>
                  {(article.cta.href ?? game?.url) && (
                    <a className="op-btn" href={article.cta.href ?? game?.url} target="_blank" rel="noopener">
                      <Icon name="play" />
                      {article.cta.label ?? t("play")}
                    </a>
                  )}
                </div>
              )}
              <div className="share">
                <span>{t("share")}</span>
                <CopyAction source={{ page: true }} {...copyLabels} />
                <a
                  className="sh"
                  href={`https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noopener"
                  aria-label={t("shareX")}
                >
                  <Icon name="x" />
                </a>
                <a
                  className="sh"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener"
                  aria-label={t("shareLinkedIn")}
                >
                  <Icon name="linkedin" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </article>

      <section className="sec rel" aria-labelledby="h-rel">
        <div className="wrap">
          <div className="sec-hd">
            <Reveal>
              <span className="sec-n">{t("related.kicker")}</span>
              <h2 id="h-rel">{t.rich("related.title", { em: (chunks) => <em>{chunks}</em> })}</h2>
            </Reveal>
            <Reveal>
              <Link className="link" href="/news">
                {t("allNews")}
                <Icon name="arrow" />
              </Link>
            </Reveal>
          </div>
          <div className="news">
            {related.map(({ item, reason }, index) => (
              <RelatedCard
                key={item.slug}
                item={item}
                locale={locale}
                delay={index * 60}
                date={shortDate(item.date)}
                kind={news(`types.${item.type}`)}
                studio={news("studio")}
                why={t(`related.${reason}`)}
              />
            ))}
          </div>
          <Reveal as="nav" className="pn" aria-label={t("nav.label")}>
            <Link href="/news">
              <small>
                <LineIcon name="back" />
                {t("nav.back")}
              </small>
              <b>{t("allNews")}</b>
            </Link>
            {next && (
              <Link className="nx" href={{ pathname: "/news/[slug]", params: { slug: next.slug } }}>
                <small>
                  {t("nav.next")}
                  <Icon name="arrow" />
                </small>
                <b>{splitTitle(typo(next.title, locale))[0].replace(/[\s ]?:$/, "")}</b>
              </Link>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function RelatedCard({
  item,
  locale,
  delay,
  date,
  kind,
  studio,
  why,
}: {
  item: NewsArticle;
  locale: Locale;
  delay: number;
  date: string;
  kind: string;
  studio: string;
  why: string;
}) {
  const game = item.game === "studio" ? undefined : getGame(item.game);
  const size = item.cover ? publicImageSize(item.cover) : null;
  return (
    <Reveal as="article" className="n" delay={delay}>
      <div className="n-img">
        {item.cover && size && (
          <Image
            src={item.cover}
            width={size.width}
            height={size.height}
            alt=""
            sizes="(min-width: 1240px) 380px, (min-width: 860px) 33vw, 100vw"
          />
        )}
        <span className="n-kind">{kind}</span>
      </div>
      <div className="n-b">
        <p className="n-meta">
          <span className="n-tag" style={{ "--c": game?.colors.tag ?? STUDIO_COLOR } as CSSProperties}>
            <i aria-hidden="true" />
            {game?.name ?? studio}
          </span>
          <time dateTime={item.date}>{date}</time>
        </p>
        <h3>
          <Link href={{ pathname: "/news/[slug]", params: { slug: item.slug } }}>{typo(item.title, locale)}</Link>
        </h3>
        <p>{typo(item.teaser?.excerpt ?? item.excerpt, locale)}</p>
        <p className="rel-why">{why}</p>
      </div>
    </Reveal>
  );
}
