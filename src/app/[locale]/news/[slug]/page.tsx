import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { routing } from "@/i18n/routing";
import { getNewsBySlug, getNewsSlugs } from "@/lib/news";
import { resolveLocale } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

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

/**
 * Skeleton route: to be integrated from the validated mockup (pages-a/news-article).
 * `article.body` holds the raw Markdown; the renderer is still to be chosen (MDX or remark).
 */
export default async function NewsArticlePage({ params }: { params: Params }) {
  const locale = await resolveLocale(params);
  const article = getNewsBySlug(locale, (await params).slug);
  if (!article) notFound();
  const t = await getTranslations({ locale, namespace: "pages.article" });

  return <PagePlaceholder title={article.title} lede={`${article.excerpt} ${t("lede")}`} />;
}
