import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";

export type LocaleParams = Promise<{ locale: string }>;

/**
 * First line of every page/layout under `app/[locale]`: validates the locale segment
 * and enables static rendering for next-intl.
 */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return locale;
}

export const localeStaticParams = () => routing.locales.map((locale) => ({ locale }));
