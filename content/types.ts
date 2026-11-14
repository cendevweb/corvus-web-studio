/** Shared content types. Content is bilingual: every user-facing string is a `Localized` pair. */
export type Locale = "fr" | "en";

export type Localized<T = string> = Readonly<Record<Locale, T>>;

/** Shorthand to declare a localized value: `l("Jouer", "Play")`. */
export const l = <T = string>(fr: T, en: T): Localized<T> => ({ fr, en });

/** Resolve a localized value for a locale. */
export const pick = <T>(value: Localized<T>, locale: Locale): T => value[locale];

export interface Figure {
  /** Displayed as-is when a string (e.g. "60 Hz"), or per locale when formats differ ("175 000+" / "175,000+"). */
  value: string | Localized;
  label: Localized;
}

export const figureValue = (value: Figure["value"], locale: Locale): string =>
  typeof value === "string" ? value : value[locale];
