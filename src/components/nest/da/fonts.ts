import {
  Anton,
  Archivo,
  Cinzel,
  Courier_Prime,
  Inter,
  JetBrains_Mono,
  Montserrat,
  Newsreader,
  Nunito,
  Pacifico,
  Syncopate,
  VT323,
  Yellowtail,
  Zhi_Mang_Xing,
} from "next/font/google";
import type { DaFontId } from "@content/da";

/**
 * Typefaces of the DA generator. Imported only by the generator, so only the Nid page declares them;
 * `preload: false` and the browser's lazy font loading mean a face is downloaded the first time a
 * DA actually uses it. All are Google Fonts under the SIL Open Font License: none of them is the
 * official typeface of a referenced work.
 */
const anton = Anton({ subsets: ["latin"], weight: "400", display: "swap", preload: false, variable: "--da-f-anton" });
const yellowtail = Yellowtail({ subsets: ["latin"], weight: "400", display: "swap", preload: false, variable: "--da-f-yellowtail" });
const inter = Inter({ subsets: ["latin"], display: "swap", preload: false, variable: "--da-f-inter" });
const newsreader = Newsreader({ subsets: ["latin"], display: "swap", preload: false, variable: "--da-f-newsreader" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], display: "swap", preload: false, variable: "--da-f-jetbrains" });
const syncopate = Syncopate({ subsets: ["latin"], weight: "700", display: "swap", preload: false, variable: "--da-f-syncopate" });
const cinzel = Cinzel({ subsets: ["latin"], display: "swap", preload: false, variable: "--da-f-cinzel" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", display: "swap", preload: false, variable: "--da-f-vt323" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], display: "swap", preload: false, variable: "--da-f-archivo" });
const nunito = Nunito({ subsets: ["latin"], display: "swap", preload: false, variable: "--da-f-nunito" });
const montserrat = Montserrat({ subsets: ["latin"], display: "swap", preload: false, variable: "--da-f-montserrat" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", display: "swap", preload: false, variable: "--da-f-pacifico" });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap", preload: false, variable: "--da-f-courier" });
const zhimang = Zhi_Mang_Xing({ subsets: ["latin"], weight: "400", display: "swap", preload: false, variable: "--da-f-zhimang" });

export interface DaFont {
  /** Family name, as written in the exported CSS. */
  name: string;
  /** Self-hosted family used by the preview. */
  css: string;
  fallback: string;
  /** How the family is requested from the Google Fonts CSS API in the export. */
  google: "static" | "weights" | "width";
}

export const DA_FONTS: Readonly<Record<DaFontId, DaFont>> = {
  anton: { name: "Anton", css: "var(--da-f-anton)", fallback: "Impact, \"Arial Narrow\", sans-serif", google: "static" },
  yellowtail: { name: "Yellowtail", css: "var(--da-f-yellowtail)", fallback: "\"Brush Script MT\", cursive", google: "static" },
  inter: { name: "Inter", css: "var(--da-f-inter)", fallback: "system-ui, sans-serif", google: "weights" },
  newsreader: { name: "Newsreader", css: "var(--da-f-newsreader)", fallback: "Georgia, serif", google: "weights" },
  jetbrains: { name: "JetBrains Mono", css: "var(--da-f-jetbrains)", fallback: "ui-monospace, monospace", google: "weights" },
  syncopate: { name: "Syncopate", css: "var(--da-f-syncopate)", fallback: "\"Arial Black\", sans-serif", google: "weights" },
  cinzel: { name: "Cinzel", css: "var(--da-f-cinzel)", fallback: "\"Trajan Pro\", Georgia, serif", google: "weights" },
  vt323: { name: "VT323", css: "var(--da-f-vt323)", fallback: "ui-monospace, monospace", google: "static" },
  archivo: { name: "Archivo", css: "var(--da-f-archivo)", fallback: "\"Helvetica Neue\", Arial, sans-serif", google: "width" },
  nunito: { name: "Nunito", css: "var(--da-f-nunito)", fallback: "\"Segoe UI\", system-ui, sans-serif", google: "weights" },
  montserrat: { name: "Montserrat", css: "var(--da-f-montserrat)", fallback: "\"Helvetica Neue\", Arial, sans-serif", google: "weights" },
  pacifico: { name: "Pacifico", css: "var(--da-f-pacifico)", fallback: "\"Brush Script MT\", cursive", google: "static" },
  courier: { name: "Courier Prime", css: "var(--da-f-courier)", fallback: "\"Courier New\", monospace", google: "weights" },
  zhimang: { name: "Zhi Mang Xing", css: "var(--da-f-zhimang)", fallback: "\"Brush Script MT\", cursive", google: "static" },
};

/** Class names that declare every generator font variable (put them on the generator's root). */
export const daFontVariables = [
  anton,
  yellowtail,
  inter,
  newsreader,
  jetbrains,
  syncopate,
  cinzel,
  vt323,
  archivo,
  nunito,
  montserrat,
  pacifico,
  courier,
  zhimang,
]
  .map((font) => font.variable)
  .join(" ");
