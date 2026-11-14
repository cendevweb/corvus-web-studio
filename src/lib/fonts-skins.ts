import { Electrolize, Pixelify_Sans, Poppins, Titan_One } from "next/font/google";

/**
 * Fonts used only by the game skins (see src/styles/skins.css).
 * Importing this module from a component is what makes Next.js ship these fonts
 * on that route: keep it out of the root layout.
 */
const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  preload: false,
  variable: "--font-pixelify",
});

const electrolize = Electrolize({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-electrolize",
});

const titan = Titan_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--font-titan",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-poppins",
});

export const skinFontVariables = {
  "one-piexel": pixelify.variable,
  fastr: electrolize.variable,
  iconic: `${poppins.variable} ${titan.variable}`,
} as const;

/** Every skin font at once (pages that mix several skins, e.g. the home page). */
export const allSkinFontVariables = Object.values(skinFontVariables).join(" ");
