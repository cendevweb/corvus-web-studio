import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/routing";

type Values = Record<string, string | number | Date>;
type RichValues = Record<string, string | number | Date | ((chunks: ReactNode) => ReactNode)>;

/** Translator of a page namespace (`messages/<locale>/<ns>.json`). */
export interface PageTranslator {
  (key: string, values?: Values): string;
  rich(key: string, values?: RichValues): ReactNode;
  raw(key: string): unknown;
  has(key: string): boolean;
}

/**
 * `getTranslations` for the per-page message files.
 * `src/i18n/types.d.ts` only describes `messages/fr.json`, so the keys of the page files are not
 * known to the type checker: this helper is the single place where that check is relaxed.
 */
export async function getPageTranslations(locale: Locale, namespace: string): Promise<PageTranslator> {
  const t = await getTranslations({ locale, namespace: namespace as never });
  return t as unknown as PageTranslator;
}
