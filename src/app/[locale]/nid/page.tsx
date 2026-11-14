import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.nest" });
  return buildMetadata({ locale, href: "/nid", title: t("title"), description: t("description") });
}

/** Skeleton route: to be integrated from the validated mockup (pages-a/nid). */
export default async function NestPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "pages.nest" });
  return <PagePlaceholder title={t.rich("title", { em: (chunks) => <em>{chunks}</em> })} lede={t("lede")} />;
}
