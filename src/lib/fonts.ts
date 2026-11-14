import { Bricolage_Grotesque, Instrument_Serif, Jersey_15 } from "next/font/google";

/**
 * Studio typography (kept exactly as in the validated mockups):
 * - Bricolage Grotesque: headings and body
 * - Instrument Serif italic: iridescent accent words
 * - Jersey 15: pixel accent (labels, counters, eyebrows)
 * Game-skin fonts live in ./fonts-skins.ts and are only loaded where a skin is rendered.
 */
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-bricolage",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-instrument",
});

export const jersey = Jersey_15({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-jersey",
});

/** Class names to put on <html> so the CSS variables are available everywhere. */
export const baseFontVariables = [
  bricolage.variable,
  instrumentSerif.variable,
  jersey.variable,
].join(" ");
