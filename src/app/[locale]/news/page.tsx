import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Link } from "@/i18n/navigation";
import { getAllNews } from "@/lib/news";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.news" });
  return buildMetadata({ locale, href: "/news", title: t("title"), description: t("description") });
}

/** Skeleton route: to be integrated from the validated mockup (pages-a/news). Content: content/news/<locale>/*.md. */
export default async function NewsPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "pages.news" });
  return (
    <PagePlaceholder title={t.rich("title", { em: (chunks) => <em>{chunks}</em> })} lede={t("lede")}>
      <ul className="mt-8 grid max-w-[44em] gap-2">
        {getAllNews(locale).map((item) => (
          <li key={item.slug}>
            <Link className="link" href={{ pathname: "/news/[slug]", params: { slug: item.slug } }}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </PagePlaceholder>
  );
}
