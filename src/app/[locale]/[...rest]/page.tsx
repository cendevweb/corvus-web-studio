import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { resolveLocale, type LocaleParams } from "@/lib/page";

/** Title of the localized 404 (the page itself is app/[locale]/not-found.tsx). */
export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.notFound" });
  return { title: t("title"), description: t("description"), robots: { index: false, follow: false } };
}

/** Any unknown path under a locale renders the localized 404 (app/[locale]/not-found.tsx). */
export default function CatchAllPage() {
  notFound();
}
