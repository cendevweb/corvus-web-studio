import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

type Values = Record<string, string | number>;
type RichValues = Record<string, string | number | ((chunks: ReactNode) => ReactNode)>;

/** Translator of the `gamesPage` namespace (messages/<locale>/games.json). */
export interface GamesT {
  (key: string, values?: Values): string;
  rich(key: string, values?: RichValues): ReactNode;
}

/**
 * `useTranslations` for the games pages. The per-page message files are merged at runtime
 * (src/i18n/request.ts) but are not part of the typed `Messages`, hence the loose typing here.
 */
export function useGamesT(scope?: string): GamesT {
  const namespace = scope ? `gamesPage.${scope}` : "gamesPage";
  return useTranslations(namespace as never) as unknown as GamesT;
}
