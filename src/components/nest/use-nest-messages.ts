"use client";

import { useTranslations } from "next-intl";

type NestTranslator = (key: string, values?: Record<string, string | number>) => string;

/**
 * Translations of the Nid page (`messages/<locale>/nest.json`) for client components.
 * The page message files are not part of the typed `Messages` (see src/i18n/types.d.ts),
 * so the key check is relaxed here, in one place.
 */
export function useNestMessages(scope: string): NestTranslator {
  return useTranslations(`nestPage.${scope}` as never) as unknown as NestTranslator;
}
