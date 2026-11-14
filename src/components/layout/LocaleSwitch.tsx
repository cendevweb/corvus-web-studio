"use client";

import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { useLocalizedPath } from "@/i18n/use-route";

const NAMES: Record<Locale, string> = { fr: "Français", en: "English" };

/** FR/EN selector: plain links to the same page in the other language. */
export function LocaleSwitch() {
  const t = useTranslations("header");
  const current = useLocale();
  const localizedPath = useLocalizedPath();

  return (
    <div className="lang" role="group" aria-label={t("language")}>
      {routing.locales.map((locale) => (
        <NextLink
          key={locale}
          href={localizedPath(locale)}
          hrefLang={locale}
          lang={locale}
          aria-label={`${NAMES[locale]} (${locale.toUpperCase()})`}
          aria-current={locale === current ? "true" : undefined}
          scroll={false}
        >
          {locale.toUpperCase()}
        </NextLink>
      ))}
    </div>
  );
}
