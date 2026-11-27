import { l, type Localized } from "./types";

/**
 * Nid experiment 07: the art-direction (DA) generator.
 *
 * The grammar comes from the TikTok videos about Claude, its skills and its workflows (hook in 1.5 s,
 * word-by-word captions, UI windows that tilt in on a spring); each universe dresses it with a hype
 * topic of the moment. Universes only *evoke* their references: no logo, character, official font or
 * image is reproduced, and the works cited are references, without affiliation.
 *
 * Every universe offers 3 palettes, 2 type pairings, 3 textures, 2 motion signatures, 2 layouts and
 * 4 hooks: the generator (src/components/nest/da/engine.ts) picks one of each with a seeded PRNG.
 */

export type DaUniverseId = "heatwave" | "dunesday" | "liminal" | "aero" | "y2016" | "brutal" | "ink" | "terminal";

export type DaFontId =
  | "anton"
  | "yellowtail"
  | "inter"
  | "newsreader"
  | "jetbrains"
  | "syncopate"
  | "cinzel"
  | "vt323"
  | "archivo"
  | "nunito"
  | "montserrat"
  | "pacifico"
  | "courier"
  | "zhimang";

export type DaCaption = "pill" | "bold" | "outline" | "glow" | "wide" | "osd" | "glossy" | "bar" | "redact" | "brush";

export type DaTextureId =
  | "grain"
  | "heat"
  | "scanlines"
  | "dots"
  | "paper"
  | "dust"
  | "vignette"
  | "vhs"
  | "bubbles"
  | "gloss"
  | "memphis"
  | "leak"
  | "concrete"
  | "halftone"
  | "inkwash";

export type DaSignatureId =
  | "freeze"
  | "phonk"
  | "bubble"
  | "zoom"
  | "reveal"
  | "clash"
  | "vhs"
  | "flicker"
  | "gloss"
  | "corrupt"
  | "boomerang"
  | "sticker"
  | "slam"
  | "echo"
  | "slash"
  | "seal";

export type DaSiteLayout = "center" | "split" | "poster" | "editorial";
export type DaVideoLayout = "center" | "low" | "split" | "letterbox";
export type DaRole = "bg" | "surface" | "ink" | "accent" | "accent2" | "glow";

export const DA_ROLES: readonly DaRole[] = ["bg", "surface", "ink", "accent", "accent2", "glow"];

export interface DaPalette {
  name: Localized;
  colors: Readonly<Record<DaRole, string>>;
}

export interface DaTypeRole {
  font: DaFontId;
  weight: number;
  upper?: boolean;
  /** Letter spacing, in em. */
  tracking?: number;
  /** Width axis (Archivo only), in %. */
  width?: number;
}

export interface DaType {
  name: Localized;
  display: DaTypeRole;
  body: DaTypeRole;
  accent: DaTypeRole;
  caption: DaCaption;
}

export interface DaSpring {
  stiffness: number;
  damping: number;
  mass?: number;
}

export interface DaMotion {
  name: Localized;
  signature: DaSignatureId;
  /** Entrance spring, in Remotion's terms (stiffness, damping, mass). */
  spring: DaSpring;
  /** UI easing (cubic-bezier). */
  ease: readonly [number, number, number, number];
  /** Durations in ms: entrance, exit, stagger between words or items. */
  durations: { in: number; out: number; stagger: number };
  /** Tempo: the preview loop lasts 16 beats, scenes cut on the beat. */
  bpm: number;
  cut: Localized;
  transitions: Localized<string[]>;
}

export interface DaLayout {
  name: Localized;
  site: DaSiteLayout;
  video: DaVideoLayout;
  cue: Localized;
}

export interface DaUniverse {
  id: DaUniverseId;
  /** Two-character prefix of the shareable code ("HW-0K7"). */
  code: string;
  name: Localized;
  /** What it refers to, with the date that makes it hype now. */
  ref: Localized;
  why: Localized;
  keywords: Localized<string[]>;
  palettes: readonly DaPalette[];
  type: readonly DaType[];
  textures: readonly DaTextureId[];
  motion: readonly DaMotion[];
  layouts: readonly DaLayout[];
  /** Corner radii the generator can pick from, in px. */
  radii: readonly number[];
  /** Hook lines (scene 1); the others run as subtitles in scenes 2 and 3. `*word*` is the highlighted word. */
  hooks: Localized<string[]>;
  /** Demo card of scene 2: title, three rows, a meta label. */
  card: { title: Localized; rows: Localized<string[]>; meta: Localized };
  /** Texts of the signature scene. */
  sig: { title: Localized; sub: Localized };
  cta: Localized;
  sound: Localized<string[]>;
  do: Localized<string[]>;
  dont: Localized<string[]>;
  /** Prompt fragments for image and video models, in English (they follow it best). */
  prompt: { subject: string; style: string };
}

export interface DaTexture {
  name: Localized;
  note: Localized;
}

export const daTextures: Readonly<Record<DaTextureId, DaTexture>> = {
  grain: { name: l("Grain argentique", "Film grain"), note: l("Bruit fin sur toute l'image", "Fine noise over the whole frame") },
  heat: { name: l("Brume de chaleur", "Heat haze"), note: l("Ondulations au-dessus de l'horizon", "Ripples above the horizon") },
  scanlines: { name: l("Lignes de balayage", "Scanlines"), note: l("Trame horizontale d'écran", "Horizontal screen pattern") },
  dots: { name: l("Grille de points", "Dot grid"), note: l("Points réguliers, façon canevas", "Regular dots, canvas style") },
  paper: { name: l("Papier", "Paper"), note: l("Fibres douces, teinte chaude", "Soft fibres, warm tint") },
  dust: { name: l("Poussière", "Dust"), note: l("Particules qui dérivent lentement", "Slowly drifting particles") },
  vignette: { name: l("Vignettage", "Vignette"), note: l("Bords assombris, regard au centre", "Darkened edges, eye on the centre") },
  vhs: { name: l("Bande VHS", "VHS tape"), note: l("Bruit, bavure et saut de piste", "Noise, bleed and tracking jumps") },
  bubbles: { name: l("Bulles", "Bubbles"), note: l("Sphères brillantes qui montent", "Glossy rising spheres") },
  gloss: { name: l("Vernis brillant", "Gloss"), note: l("Reflet blanc en haut des formes", "White highlight on top of shapes") },
  memphis: { name: l("Confettis Memphis", "Memphis confetti"), note: l("Zigzags, ronds et triangles", "Zigzags, dots and triangles") },
  leak: { name: l("Fuite de lumière", "Light leak"), note: l("Halo orangé sur un bord", "Orange glow on one edge") },
  concrete: { name: l("Béton brut", "Raw concrete"), note: l("Taches et coffrage", "Stains and formwork") },
  halftone: { name: l("Trame offset", "Halftone"), note: l("Points d'imprimerie", "Print dots") },
  inkwash: { name: l("Lavis d'encre", "Ink wash"), note: l("Encre diluée en nappes", "Diluted ink in pools") },
};

/** Spring of the word-by-word captions in the creator videos (Remotion: damping 14, stiffness 180). */
const SPRING_UI = { stiffness: 180, damping: 14 } as const;

export const daUniverses: readonly DaUniverse[] = [
  {
    id: "heatwave",
    code: "HW",
    name: l("Heatwave", "Heatwave"),
    ref: l(
      "GTA VI · sorti le 19 nov. 2026 · 3,79 milliards de dollars en 24 h",
      "GTA VI · out Nov 19, 2026 · $3.79 billion in 24 hours",
    ),
    why: l(
      "Une Floride de fiction, des couchers de soleil saturés, des vidéos verticales façon réseaux sociaux : la DA la plus commentée du mois.",
      "A fictional Florida, saturated sunsets, social-style vertical clips: the most talked-about look of the month.",
    ),
    keywords: l(
      ["coucher de soleil", "néon", "palmiers", "chaleur", "cavale", "téléphone vertical"],
      ["sunset", "neon", "palm trees", "heat", "on the run", "vertical phone"],
    ),
    palettes: [
      {
        name: l("Coucher de soleil", "Sunset"),
        colors: { bg: "#1A0B2E", surface: "#2D1247", ink: "#FFF3E6", accent: "#FF3D8B", accent2: "#FF9E3D", glow: "#39E4D0" },
      },
      {
        name: l("Nuit néon", "Neon night"),
        colors: { bg: "#070B1F", surface: "#131B3D", ink: "#EAF6FF", accent: "#FF2E97", accent2: "#00E5FF", glow: "#B6FF3B" },
      },
      {
        name: l("Plein soleil", "High noon"),
        colors: { bg: "#FFF1DD", surface: "#FFDDB0", ink: "#1E1030", accent: "#FF4F6D", accent2: "#00A3B4", glow: "#FFC23D" },
      },
    ],
    type: [
      {
        name: l("Affiche de casse", "Heist poster"),
        display: { font: "anton", weight: 400, upper: true, tracking: 0.01 },
        body: { font: "inter", weight: 500 },
        accent: { font: "yellowtail", weight: 400 },
        caption: "outline",
      },
      {
        name: l("Néon de plage", "Beach neon"),
        display: { font: "archivo", weight: 900, upper: true, tracking: -0.02, width: 62 },
        body: { font: "inter", weight: 500 },
        accent: { font: "yellowtail", weight: 400 },
        caption: "glow",
      },
    ],
    textures: ["grain", "heat", "scanlines"],
    motion: [
      {
        name: l("Freeze-frame + carton", "Freeze-frame + name card"),
        signature: "freeze",
        spring: { stiffness: 210, damping: 15 },
        ease: [0.2, 0.9, 0.1, 1],
        durations: { in: 480, out: 220, stagger: 70 },
        bpm: 98,
        cut: l(
          "Coupe franche sur le temps fort, gel d'image au 9e temps avec un carton nominatif en biais.",
          "Hard cut on the downbeat, freeze-frame on beat 9 with a slanted name card.",
        ),
        transitions: l(
          ["coupe franche", "gel + flash blanc", "carton en biais", "zoom lent sur le coucher de soleil"],
          ["hard cut", "freeze + white flash", "slanted name card", "slow push on the sunset"],
        ),
      },
      {
        name: l("Edit phonk", "Phonk edit"),
        signature: "phonk",
        spring: { stiffness: 320, damping: 18 },
        ease: [0.7, 0, 0.2, 1],
        durations: { in: 260, out: 160, stagger: 40 },
        bpm: 140,
        cut: l(
          "Deux zooms punch par mesure, un flash d'une image sur chaque coup de basse, secousse caméra.",
          "Two punch-in zooms per bar, a one-frame flash on every bass hit, camera shake.",
        ),
        transitions: l(
          ["zoom punch", "flash 1 image", "secousse caméra", "aberration chromatique"],
          ["punch-in zoom", "one-frame flash", "camera shake", "chromatic aberration"],
        ),
      },
    ],
    layouts: [
      {
        name: l("Plein cadre cinéma", "Cinema full-bleed"),
        site: "poster",
        video: "letterbox",
        cue: l(
          "Bandes noires 2,39:1 sur la vidéo, image plein cadre, titre en bas à gauche.",
          "2.39:1 black bars on the video, full-bleed image, title bottom left.",
        ),
      },
      {
        name: l("Écran partagé", "Split screen"),
        site: "split",
        video: "split",
        cue: l(
          "Plan vertical en haut, réaction en bas, sous-titre posé sur la couture.",
          "Vertical shot on top, reaction below, caption sitting on the seam.",
        ),
      },
    ],
    radii: [0, 6, 14],
    hooks: l(
      [
        "Personne ne roule au pas sous ces *palmiers*.",
        "Un casse, deux complices, *zéro* plan B.",
        "Le soleil se couche, la ville se *réveille*.",
        "Cette vidéo *verticale* va mal finir.",
      ],
      [
        "Nobody drives slow under these *palms*.",
        "One heist, two partners, *no* plan B.",
        "The sun goes down, the city *wakes* up.",
        "This *vertical* clip is about to go wrong.",
      ],
    ),
    card: {
      title: l("@front.de.mer", "@the.waterfront"),
      rows: l(
        ["Plan vertical, 20 h 46", "2,4 M de vues en une nuit", "Sirènes au loin"],
        ["Vertical shot, 8:46 pm", "2.4M views overnight", "Sirens in the distance"],
      ),
      meta: l("EN DIRECT", "LIVE"),
    },
    sig: { title: l("Le\u00a0casse", "The\u00a0heist"), sub: l("20 h 46 · front de mer", "8:46 pm · waterfront") },
    cta: l("Prendre la route", "Hit the road"),
    sound: l(
      ["Basse saturée sur le hook", "Synthé années 80 sur les plans de coucher de soleil", "Une demi-seconde de silence avant le gel d'image"],
      ["Saturated bass on the hook", "80s synth over the sunset shots", "Half a second of silence before the freeze"],
    ),
    do: l(
      ["Dégradés de coucher de soleil francs, du rose à l'orange", "Grain et chaleur visibles, comme filmé au téléphone"],
      ["Bold sunset gradients, pink to orange", "Visible grain and heat, as if shot on a phone"],
    ),
    dont: l(
      ["Logos, personnages, armes ou typo du jeu", "Du néon partout : un accent néon par plan suffit"],
      ["The game's logos, characters, weapons or type", "Neon everywhere: one neon accent per shot is enough"],
    ),
    prompt: {
      subject:
        "neon-soaked coastal city at golden hour, palm silhouettes, wet asphalt reflections, vertical phone-footage framing",
      style: "saturated sunset grade from magenta to orange, 35mm grain, heat haze, high contrast, cinematic crime caper",
    },
  },
  {
    id: "dunesday",
    code: "DD",
    name: l("Dunesday", "Dunesday"),
    ref: l(
      "Dune : Troisième partie × Avengers : Doomsday, le même jour au cinéma : le 18 déc. 2026",
      "Dune: Part Three × Avengers: Doomsday, same day in theatres: Dec 18, 2026",
    ),
    why: l(
      "Le choc de décembre, baptisé en janvier par Robert Downey Jr. et Timothée Chalamet : le sable contre l'acier.",
      "December's clash, named in January by Robert Downey Jr. and Timothée Chalamet: sand against steel.",
    ),
    keywords: l(
      ["sable", "acier", "monumental", "IMAX", "lenteur", "affrontement"],
      ["sand", "steel", "monumental", "IMAX", "slowness", "showdown"],
    ),
    palettes: [
      {
        name: l("Sable", "Sand"),
        colors: { bg: "#120D08", surface: "#2A1D12", ink: "#F1E6D2", accent: "#D9893B", accent2: "#8C5A2B", glow: "#F5C77E" },
      },
      {
        name: l("Acier", "Steel"),
        colors: { bg: "#0B0F0E", surface: "#1A2220", ink: "#E3EAE6", accent: "#5BE37D", accent2: "#7D8C87", glow: "#C9F5D4" },
      },
      {
        name: l("Choc", "Clash"),
        colors: { bg: "#14110D", surface: "#26211A", ink: "#F3EBDD", accent: "#E08A3C", accent2: "#4FD675", glow: "#FFFFFF" },
      },
    ],
    type: [
      {
        name: l("Large et lent", "Wide and slow"),
        display: { font: "syncopate", weight: 700, upper: true, tracking: 0.16 },
        body: { font: "archivo", weight: 400, width: 112 },
        accent: { font: "archivo", weight: 600, upper: true, tracking: 0.3, width: 125 },
        caption: "wide",
      },
      {
        name: l("Monument", "Monument"),
        display: { font: "cinzel", weight: 700, upper: true, tracking: 0.08 },
        body: { font: "archivo", weight: 400, width: 100 },
        accent: { font: "syncopate", weight: 700, upper: true, tracking: 0.24 },
        caption: "wide",
      },
    ],
    textures: ["dust", "grain", "vignette"],
    motion: [
      {
        name: l("Révélation lente", "Slow reveal"),
        signature: "reveal",
        spring: { stiffness: 60, damping: 20 },
        ease: [0.65, 0, 0.35, 1],
        durations: { in: 1400, out: 900, stagger: 160 },
        bpm: 84,
        cut: l(
          "Fondus lents de 1,4 s, une seule coupe sèche : celle du titre.",
          "Slow 1.4 s fades, a single hard cut: the title.",
        ),
        transitions: l(
          ["fondu au noir lent", "lettres qui se resserrent", "travelling avant imperceptible"],
          ["slow fade to black", "letters closing in", "barely visible push-in"],
        ),
      },
      {
        name: l("Choc frontal", "Head-on clash"),
        signature: "clash",
        spring: { stiffness: 260, damping: 22 },
        ease: [0.85, 0, 0.15, 1],
        durations: { in: 360, out: 240, stagger: 50 },
        bpm: 120,
        cut: l(
          "Écran coupé en diagonale, les deux camps se percutent sur le premier temps de la mesure 3.",
          "Screen split diagonally, both sides collide on the first beat of bar 3.",
        ),
        transitions: l(
          ["volets en diagonale", "impact + flash", "secousse", "titre « VS »"],
          ["diagonal wipes", "impact + flash", "shake", "“VS” title"],
        ),
      },
    ],
    layouts: [
      {
        name: l("Format IMAX", "IMAX frame"),
        site: "poster",
        video: "letterbox",
        cue: l(
          "Bandes 1,90:1, titre centré très espacé, beaucoup de vide autour.",
          "1.90:1 bars, centred and widely spaced title, lots of empty space.",
        ),
      },
      {
        name: l("Monolithe central", "Central monolith"),
        site: "center",
        video: "center",
        cue: l(
          "Un seul élément vertical au centre, le texte dessous, symétrie stricte.",
          "One vertical element in the centre, text below, strict symmetry.",
        ),
      },
    ],
    radii: [0, 0, 2],
    hooks: l(
      [
        "Le 18 décembre, le *sable* contre l'acier.",
        "Deux épopées, un *seul* soir.",
        "Choisir un *camp* avant minuit.",
        "Le désert n'a jamais été aussi *bruyant*.",
      ],
      ["December 18: *sand* against steel.", "Two epics, *one* night.", "Pick a *side* before midnight.", "The desert has never been this *loud*."],
    ),
    card: {
      title: l("IMAX · 18.12.26", "IMAX · 12.18.26"),
      rows: l(["Salle 1 : le sable", "Salle 2 : l'acier", "Séance de minuit"], ["Screen 1: sand", "Screen 2: steel", "Midnight show"]),
      meta: l("COMPLET", "SOLD OUT"),
    },
    sig: { title: l("18.12", "12.18"), sub: l("Le sable contre l'acier", "Sand against steel") },
    cta: l("Réserver", "Book"),
    sound: l(
      ["Drone grave continu", "Impact « braam » sur le titre", "Vent et sable entre les plans"],
      ["Continuous low drone", "“Braam” hit on the title", "Wind and sand between shots"],
    ),
    do: l(
      ["Beaucoup de vide autour de très grands titres espacés", "Un seul geste par plan, lent"],
      ["Lots of empty space around huge, widely spaced titles", "One slow gesture per shot"],
    ),
    dont: l(
      ["Casques, vers, armures ou logos des films", "Des transitions rapides hors du choc final"],
      ["The films' helmets, worms, armour or logos", "Fast transitions outside the final clash"],
    ),
    prompt: {
      subject:
        "colossal monolith standing in an endless desert at dawn, tiny human silhouette, dust in the air, a cold steel structure cutting the horizon",
      style: "monumental minimalism, ochre and bone against gunmetal green, anamorphic wide shot, IMAX framing, slow cinematic motion",
    },
  },
  {
    id: "liminal",
    code: "LM",
    name: l("Liminal", "Liminal"),
    ref: l(
      "Backrooms (A24, 2026), premier film du studio à passer 100 M$ aux États-Unis, et la vague Poolrooms de novembre",
      "Backrooms (A24, 2026), the studio's first film past $100M in the US, and November's Poolrooms wave",
    ),
    why: l(
      "Couloirs vides, néons qui grésillent, caméscope qui tourne seul : l'esthétique de l'inquiétant familier.",
      "Empty corridors, buzzing fluorescents, a camcorder rolling on its own: the aesthetic of the uncanny familiar.",
    ),
    keywords: l(
      ["néon blafard", "moquette humide", "caméscope", "VHS", "vide", "écho"],
      ["pale fluorescent", "damp carpet", "camcorder", "VHS", "emptiness", "echo"],
    ),
    palettes: [
      {
        name: l("Niveau 0", "Level 0"),
        colors: { bg: "#D8C77A", surface: "#E9DCA2", ink: "#1E1A0C", accent: "#6B5E1E", accent2: "#FFF7CF", glow: "#FF3B30" },
      },
      {
        name: l("Poolrooms", "Poolrooms"),
        colors: { bg: "#E6F3F5", surface: "#FFFFFF", ink: "#0E2A33", accent: "#1F9FB8", accent2: "#9FE1EA", glow: "#FFB238" },
      },
      {
        name: l("Veille de nuit", "Night shift"),
        colors: { bg: "#0D110C", surface: "#1A2017", ink: "#E9F0D8", accent: "#B9D36A", accent2: "#56663B", glow: "#FF3B30" },
      },
    ],
    type: [
      {
        name: l("Caméscope", "Camcorder"),
        display: { font: "vt323", weight: 400, upper: true, tracking: 0.04 },
        body: { font: "archivo", weight: 400, width: 100 },
        accent: { font: "vt323", weight: 400, upper: true },
        caption: "osd",
      },
      {
        name: l("Signalétique", "Signage"),
        display: { font: "archivo", weight: 700, tracking: -0.02, width: 100 },
        body: { font: "archivo", weight: 400, width: 100 },
        accent: { font: "vt323", weight: 400, upper: true },
        caption: "osd",
      },
    ],
    textures: ["vhs", "scanlines", "grain"],
    motion: [
      {
        name: l("Bande VHS", "VHS tape"),
        signature: "vhs",
        spring: { stiffness: 120, damping: 26 },
        ease: [0.4, 0, 0.6, 1],
        durations: { in: 300, out: 300, stagger: 120 },
        bpm: 90,
        cut: l(
          "Plan séquence qui dérive, un saut de piste VHS toutes les quatre mesures.",
          "A drifting long take, a VHS tracking jump every four bars.",
        ),
        transitions: l(
          ["saut de piste", "rembobinage", "bavure des couleurs", "horodatage qui saute"],
          ["tracking jump", "rewind", "colour bleed", "skipping timestamp"],
        ),
      },
      {
        name: l("Néon qui grésille", "Buzzing fluorescent"),
        signature: "flicker",
        spring: { stiffness: 90, damping: 30 },
        ease: [0.5, 0, 0.5, 1],
        durations: { in: 200, out: 600, stagger: 200 },
        bpm: 76,
        cut: l(
          "Coupes au noir sur les clignotements, jamais sur la musique.",
          "Cuts to black on the flickers, never on the music.",
        ),
        transitions: l(
          ["coupure au noir", "clignotement", "travelling avant pendant le noir"],
          ["cut to black", "flicker", "push-in during the blackout"],
        ),
      },
    ],
    layouts: [
      {
        name: l("Point de fuite", "Vanishing point"),
        site: "center",
        video: "center",
        cue: l(
          "Couloir en perspective centrale, texte petit dans un coin, beaucoup de mur.",
          "One-point perspective corridor, small text in a corner, lots of wall.",
        ),
      },
      {
        name: l("Viseur", "Viewfinder"),
        site: "editorial",
        video: "low",
        cue: l(
          "Habillage de caméscope : REC en haut à gauche, horodatage en bas à droite.",
          "Camcorder overlay: REC top left, timestamp bottom right.",
        ),
      },
    ],
    radii: [0, 2, 4],
    hooks: l(
      ["Ce couloir n'a pas de *fin*.", "Le néon *grésille* depuis 1996.", "Niveau 0. *Aucune* sortie.", "L'eau est tiède. Il n'y a *personne*."],
      ["This corridor has no *end*.", "The light has *buzzed* since 1996.", "Level 0. *No* exit.", "The water is warm. *Nobody* is here."],
    ),
    card: {
      title: l("REC ● 00:03:14", "REC ● 00:03:14"),
      rows: l(["Couloir B-12", "Néon à 60 Hz", "Aucun signal"], ["Corridor B-12", "60 Hz fluorescent", "No signal"]),
      meta: l("SP · BATT ▮▮▯", "SP · BATT ▮▮▯"),
    },
    sig: { title: l("Niveau\u00a00", "Level\u00a00"), sub: l("Aucune sortie", "No exit") },
    cta: l("Entrer", "Enter"),
    sound: l(
      ["Bourdonnement de néon à 60 Hz", "Pas étouffés sur la moquette", "Réverbération de piscine vide"],
      ["60 Hz fluorescent hum", "Muffled steps on carpet", "Empty pool reverb"],
    ),
    do: l(
      ["Cadres vides et symétriques, éclairage plat", "L'horodatage et le REC comme seule interface"],
      ["Empty, symmetrical frames, flat lighting", "Timestamp and REC as the only interface"],
    ),
    dont: l(
      ["Créatures, sang ou jump scares", "Couleurs saturées : tout reste délavé"],
      ["Creatures, blood or jump scares", "Saturated colours: everything stays washed out"],
    ),
    prompt: {
      subject:
        "endless empty office corridor with mono-yellow wallpaper and damp carpet under humming fluorescent panels, or an empty tiled pool hall with still warm water",
      style: "found-footage camcorder look, VHS noise, timestamp overlay, flat fluorescent light, liminal and uncanny, low saturation",
    },
  },
  {
    id: "aero",
    code: "AE",
    name: l("Aero", "Aero"),
    ref: l(
      "Frutiger Aero et sa version sombre, « Frutiger Evil », remontés sur TikTok cet automne",
      "Frutiger Aero and its dark twin, “Frutiger Evil”, back on TikTok this autumn",
    ),
    why: l(
      "Verre poli, bulles, ciel bleu et herbe trop verte : l'optimisme technologique des années 2000, et sa version qui tourne mal.",
      "Polished glass, bubbles, blue skies and too-green grass: 2000s tech optimism, and its version that goes wrong.",
    ),
    keywords: l(
      ["verre poli", "bulles", "ciel bleu", "brillance", "aqua", "nostalgie 2007"],
      ["polished glass", "bubbles", "blue sky", "gloss", "aqua", "2007 nostalgia"],
    ),
    palettes: [
      {
        name: l("Aqua", "Aqua"),
        colors: { bg: "#CDEFFF", surface: "#FFFFFF", ink: "#06324A", accent: "#0C8FD6", accent2: "#5CCB3F", glow: "#FFFFFF" },
      },
      {
        name: l("Aurore", "Dawn"),
        colors: { bg: "#EFE6FF", surface: "#FFFFFF", ink: "#2A1F4A", accent: "#6C5CF5", accent2: "#2EC4B6", glow: "#FFE3F1" },
      },
      {
        name: l("Evil", "Evil"),
        colors: { bg: "#031417", surface: "#0B2A2E", ink: "#D8FFF8", accent: "#19E3C1", accent2: "#B4FF3A", glow: "#FF2E6E" },
      },
    ],
    type: [
      {
        name: l("Interface 2007", "2007 interface"),
        display: { font: "nunito", weight: 800, tracking: -0.01 },
        body: { font: "nunito", weight: 500 },
        accent: { font: "nunito", weight: 700 },
        caption: "glossy",
      },
      {
        name: l("Verre fin", "Thin glass"),
        display: { font: "inter", weight: 300, tracking: -0.03 },
        body: { font: "inter", weight: 400 },
        accent: { font: "nunito", weight: 700 },
        caption: "glossy",
      },
    ],
    textures: ["bubbles", "gloss", "grain"],
    motion: [
      {
        name: l("Bulles et reflets", "Bubbles and gloss"),
        signature: "gloss",
        spring: { stiffness: 140, damping: 12 },
        ease: [0.34, 1.56, 0.64, 1],
        durations: { in: 600, out: 300, stagger: 90 },
        bpm: 104,
        cut: l(
          "Fondus enchaînés doux, un reflet de lumière traverse chaque titre.",
          "Soft cross-fades, a light sweep crosses every title.",
        ),
        transitions: l(
          ["fondu enchaîné", "reflet qui traverse", "bulles qui montent", "rebond doux"],
          ["cross-fade", "light sweep", "rising bubbles", "soft bounce"],
        ),
      },
      {
        name: l("Corruption", "Corruption"),
        signature: "corrupt",
        spring: { stiffness: 200, damping: 10 },
        ease: [0.9, 0, 0.1, 1],
        durations: { in: 300, out: 120, stagger: 40 },
        bpm: 128,
        cut: l(
          "Tout est propre pendant deux mesures, puis l'image se corrompt d'un coup.",
          "Everything is clean for two bars, then the image corrupts at once.",
        ),
        transitions: l(
          ["glitch par bandes", "inversion des couleurs", "bulles qui noircissent"],
          ["band glitch", "colour inversion", "bubbles turning dark"],
        ),
      },
    ],
    layouts: [
      {
        name: l("Fenêtre flottante", "Floating window"),
        site: "split",
        video: "center",
        cue: l(
          "Fenêtres en verre qui flottent sur un ciel, coins très arrondis, reflet en haut.",
          "Glass windows floating over a sky, very round corners, highlight on top.",
        ),
      },
      {
        name: l("Bureau d'accueil", "Desktop"),
        site: "center",
        video: "low",
        cue: l(
          "Grand ciel en fond, widgets en bas, typographie fine et aérée.",
          "Big sky behind, widgets at the bottom, light and airy type.",
        ),
      },
    ],
    radii: [16, 22, 28],
    hooks: l(
      ["Le futur avait l'air plus *propre* avant.", "Bulles, ciel *bleu*, verre poli.", "Quelque chose *cloche* dans l'aquarium.", "Mise à jour *installée*. Redémarrage…"],
      ["The future used to look *cleaner*.", "Bubbles, *blue* sky, polished glass.", "Something is *wrong* in the aquarium.", "Update *installed*. Restarting…"],
    ),
    card: {
      title: l("Météo", "Weather"),
      rows: l(["Ciel dégagé", "Bulles : 98 %", "Mise à jour disponible"], ["Clear sky", "Bubbles: 98%", "Update available"]),
      meta: l("24°", "75°"),
    },
    sig: { title: l("Bienvenue", "Welcome"), sub: l("Tout va bien. Vraiment.", "Everything is fine. Really.") },
    cta: l("Découvrir", "Explore"),
    sound: l(
      ["Carillon de démarrage cristallin", "Bulles et clapotis", "Nappe de synthé aérienne, glitchée dans la version Evil"],
      ["Crystal start-up chime", "Bubbles and lapping water", "Airy synth pad, glitched in the Evil version"],
    ),
    do: l(
      ["Dégradés brillants, reflet en haut des formes", "Nature et technologie dans le même cadre"],
      ["Glossy gradients, highlight on top of shapes", "Nature and technology in the same frame"],
    ),
    dont: l(
      ["Logos de systèmes d'exploitation ou de marques", "Coins carrés et aplats mats"],
      ["Operating-system or brand logos", "Square corners and flat matte fills"],
    ),
    prompt: {
      subject: "glossy glass interface bubbles floating over a bright blue sky and lush green hills, water droplets, lens flare",
      style: "Frutiger Aero, mid-2000s glossy UI, skeuomorphic glass, aqua and grass green, soft bloom, clean 3D render",
    },
  },
  {
    id: "y2016",
    code: "16",
    name: l("2016", "2016"),
    ref: l(
      "La tendance « 2026 is the new 2016 », partie fin décembre 2025 et présente toute l'année",
      "The “2026 is the new 2016” trend, started late December 2025 and around all year",
    ),
    why: l(
      "Filtres chien et couronne de fleurs, selfies surexposés, filtre Valencia, rose millennial : internet rejoue son année préférée.",
      "Dog and flower-crown filters, overexposed selfies, the Valencia filter, millennial pink: the internet replays its favourite year.",
    ),
    keywords: l(
      ["rose millennial", "filtre chaud", "boomerang", "stickers", "flat design", "insouciance"],
      ["millennial pink", "warm filter", "boomerang", "stickers", "flat design", "carefree"],
    ),
    palettes: [
      {
        name: l("Rose millennial", "Millennial pink"),
        colors: { bg: "#F7D6D0", surface: "#FFF1EE", ink: "#2B2235", accent: "#E8577A", accent2: "#7E97C9", glow: "#FFE66D" },
      },
      {
        name: l("Filtre chaud", "Warm filter"),
        colors: { bg: "#F3E2C7", surface: "#FFF6E9", ink: "#3A2A1E", accent: "#D9654A", accent2: "#6FA58A", glow: "#F2CC8F" },
      },
      {
        name: l("Jaune story", "Story yellow"),
        colors: { bg: "#FFE600", surface: "#FFFFFF", ink: "#141414", accent: "#FF3D7F", accent2: "#2D7FDB", glow: "#7CF5FF" },
      },
    ],
    type: [
      {
        name: l("Startup 2016", "2016 startup"),
        display: { font: "montserrat", weight: 800, upper: true, tracking: 0.04 },
        body: { font: "montserrat", weight: 400 },
        accent: { font: "pacifico", weight: 400 },
        caption: "bar",
      },
      {
        name: l("Script hipster", "Hipster script"),
        display: { font: "pacifico", weight: 400 },
        body: { font: "montserrat", weight: 500 },
        accent: { font: "montserrat", weight: 700, upper: true, tracking: 0.12 },
        caption: "bar",
      },
    ],
    textures: ["memphis", "leak", "grain"],
    motion: [
      {
        name: l("Boomerang", "Boomerang"),
        signature: "boomerang",
        spring: { stiffness: 300, damping: 14 },
        ease: [0.68, -0.55, 0.27, 1.55],
        durations: { in: 400, out: 400, stagger: 80 },
        bpm: 118,
        cut: l(
          "Chaque plan rejoué à l'endroit puis à l'envers, en boucle de 6 secondes.",
          "Every shot played forwards then backwards, in a 6-second loop.",
        ),
        transitions: l(
          ["aller-retour", "zoom rebond", "étincelles", "boucle de 6 s"],
          ["back and forth", "bounce zoom", "sparkles", "6 s loop"],
        ),
      },
      {
        name: l("Stickers", "Stickers"),
        signature: "sticker",
        spring: { stiffness: 260, damping: 11 },
        ease: [0.34, 1.56, 0.64, 1],
        durations: { in: 350, out: 200, stagger: 110 },
        bpm: 124,
        cut: l(
          "Les stickers tombent sur le temps, la flèche « swipe up » rebondit à la fin.",
          "Stickers land on the beat, the “swipe up” arrow bounces at the end.",
        ),
        transitions: l(["sticker qui tombe", "rebond", "flèche swipe up"], ["sticker drop", "bounce", "swipe-up arrow"]),
      },
    ],
    layouts: [
      {
        name: l("Story", "Story"),
        site: "center",
        video: "center",
        cue: l(
          "Bandeau de légende translucide au tiers de l'écran, stickers autour du sujet.",
          "Translucent caption strip at one third of the screen, stickers around the subject.",
        ),
      },
      {
        name: l("Grille de photos", "Photo grid"),
        site: "editorial",
        video: "low",
        cue: l(
          "Photos carrées en grille de trois, coins arrondis, légendes en script.",
          "Square photos in a grid of three, rounded corners, script captions.",
        ),
      },
    ],
    radii: [8, 14, 24],
    hooks: l(
      ["On est en *2016* et tout va bien.", "Filtre chien, jean slim, *zéro* souci.", "La meilleure année d'internet *revient*.", "Swipe up pour retourner en *2016*."],
      ["It's *2016* and everything is fine.", "Dog filter, skinny jeans, *no* worries.", "The internet's best year is *back*.", "Swipe up to go back to *2016*."],
    ),
    card: {
      title: l("Story · il y a 2 h", "Story · 2 h ago"),
      rows: l(
        ["Filtre couronne de fleurs", "Boomerang au bord de l'eau", "Playlist été 2016"],
        ["Flower-crown filter", "Boomerang by the water", "Summer 2016 playlist"],
      ),
      meta: l("Vu par 214", "Seen by 214"),
    },
    sig: { title: l("Meilleure année", "Best year ever"), sub: l("#retour2016", "#throwback2016") },
    cta: l("Swipe up", "Swipe up"),
    sound: l(
      ["Tropical house à 118 BPM", "Bruit d'obturateur de téléphone", "Pop de bulle sur chaque sticker"],
      ["Tropical house at 118 BPM", "Phone shutter sound", "Bubble pop on every sticker"],
    ),
    do: l(
      ["Couleurs pastel surexposées, flou léger", "Stickers et doodles à la main autour du sujet"],
      ["Overexposed pastel colours, slight blur", "Hand-drawn stickers and doodles around the subject"],
    ),
    dont: l(
      ["Logos d'applications ou filtres de marque reproduits", "Typo trop sérieuse ou noir et blanc"],
      ["App logos or copied branded filters", "Over-serious type or black and white"],
    ),
    prompt: {
      subject: "overexposed pastel selfie scene with hand-drawn doodles and stickers, flower crown, instant-photo frame",
      style: "2016 social media aesthetic, warm faded filter, millennial pink and serenity blue, flat design shapes, light leaks, playful",
    },
  },
  {
    id: "brutal",
    code: "CR",
    name: l("Brutalisme paranormal", "Paranormal brutalism"),
    ref: l(
      "Control Resonant (Remedy, 24 sept. 2026), nommé jeu de l'année aux Game Awards du 10 déc.",
      "Control Resonant (Remedy, Sept 24, 2026), Game of the Year nominee at the Dec 10 Game Awards",
    ),
    why: l(
      "Béton brut, grille suisse, dossiers caviardés et objets qui flottent : une DA de bureau administratif hanté.",
      "Raw concrete, a Swiss grid, redacted files and floating objects: the look of a haunted government office.",
    ),
    keywords: l(
      ["béton", "grille suisse", "caviardage", "rouge signal", "lévitation", "administratif"],
      ["concrete", "Swiss grid", "redaction", "signal red", "levitation", "bureaucratic"],
    ),
    palettes: [
      {
        name: l("Béton", "Concrete"),
        colors: { bg: "#B9B7B1", surface: "#D3D1CB", ink: "#111111", accent: "#D7261E", accent2: "#2A2A2A", glow: "#FFFFFF" },
      },
      {
        name: l("Dossier", "File"),
        colors: { bg: "#EFE9DC", surface: "#FFFFFF", ink: "#151515", accent: "#C8102E", accent2: "#6F6A60", glow: "#FFD400" },
      },
      {
        name: l("Rémanence", "Afterimage"),
        colors: { bg: "#0B0B0C", surface: "#19191B", ink: "#EDEDED", accent: "#FF2A1F", accent2: "#2FE3FF", glow: "#FFFFFF" },
      },
    ],
    type: [
      {
        name: l("Signalétique d'État", "State signage"),
        display: { font: "archivo", weight: 900, upper: true, tracking: -0.02, width: 100 },
        body: { font: "archivo", weight: 400, width: 100 },
        accent: { font: "courier", weight: 400 },
        caption: "redact",
      },
      {
        name: l("Machine à écrire", "Typewriter"),
        display: { font: "archivo", weight: 800, upper: true, tracking: -0.01, width: 62 },
        body: { font: "courier", weight: 400 },
        accent: { font: "courier", weight: 700, upper: true },
        caption: "redact",
      },
    ],
    textures: ["concrete", "halftone", "grain"],
    motion: [
      {
        name: l("Carton de lieu", "Location card"),
        signature: "slam",
        spring: { stiffness: 400, damping: 30 },
        ease: [0.9, 0, 0.1, 1],
        durations: { in: 180, out: 120, stagger: 30 },
        bpm: 100,
        cut: l(
          "Coupe sèche sur un carton de lieu plein cadre, tenu exactement deux temps.",
          "Hard cut to a full-frame location card, held for exactly two beats.",
        ),
        transitions: l(
          ["coupe sèche", "carton plein cadre", "filet rouge", "noir d'une image"],
          ["hard cut", "full-frame card", "red rule", "one-frame black"],
        ),
      },
      {
        name: l("Écho rouge", "Red echo"),
        signature: "echo",
        spring: { stiffness: 100, damping: 9 },
        ease: [0.45, 0, 0.55, 1],
        durations: { in: 700, out: 500, stagger: 120 },
        bpm: 88,
        cut: l(
          "Le titre se dédouble en rouge et en cyan, les objets flottent en boucle lente.",
          "The title splits into red and cyan copies, objects float in a slow loop.",
        ),
        transitions: l(["dédoublement", "lévitation", "fondu de rémanence"], ["doubling", "levitation", "afterimage fade"]),
      },
    ],
    layouts: [
      {
        name: l("Grille suisse", "Swiss grid"),
        site: "editorial",
        video: "center",
        cue: l(
          "Grille de 12 colonnes visible, titre énorme aligné à gauche, filets rouges.",
          "Visible 12-column grid, huge left-aligned title, red rules.",
        ),
      },
      {
        name: l("Dossier ouvert", "Open file"),
        site: "split",
        video: "low",
        cue: l(
          "Document à gauche, image à droite, lignes caviardées comme motif.",
          "Document on the left, image on the right, redacted lines as a pattern.",
        ),
      },
    ],
    radii: [0, 0, 0],
    hooks: l(
      ["Le bâtiment change de *forme* la nuit.", "Dossier 07 : ne pas *lire* à voix haute.", "Le béton se *souvient* de tout.", "Cet objet n'aurait pas dû *bouger*."],
      ["The building changes *shape* at night.", "File 07: do not *read* aloud.", "Concrete *remembers* everything.", "That object should not have *moved*."],
    ),
    card: {
      title: l("BUREAU · DOSSIER 07", "BUREAU · FILE 07"),
      rows: l(["Objet : lampe de bureau", "Statut : altéré", "Accès : niveau 4"], ["Item: desk lamp", "Status: altered", "Access: level 4"]),
      meta: l("CLASSÉ", "CLASSIFIED"),
    },
    sig: { title: l("Secteur\u00a07", "Sector\u00a07"), sub: l("Bureau · niveau −12", "Bureau · level −12") },
    cta: l("Ouvrir le dossier", "Open the file"),
    sound: l(
      ["Larsen grave qui monte", "Tampon et machine à écrire", "Silence total sur les cartons de lieu"],
      ["Rising low feedback", "Rubber stamp and typewriter", "Total silence on location cards"],
    ),
    do: l(
      ["Typo énorme, alignée à gauche, en capitales", "Une seule couleur vive : le rouge"],
      ["Huge, left-aligned, upper-case type", "A single vivid colour: red"],
    ),
    dont: l(["Logos, symboles ou personnages du jeu", "Arrondis et dégradés"], ["The game's logos, symbols or characters", "Rounded corners and gradients"]),
    prompt: {
      subject: "brutalist concrete atrium with floating office objects, red warning lines, redacted documents pinned to a wall",
      style: "paranormal brutalism, Swiss typographic grid, signal red accent, harsh overhead light, film grain, uncanny stillness",
    },
  },
  {
    id: "ink",
    code: "PB",
    name: l("Encre et lame", "Ink & Blade"),
    ref: l(
      "Phantom Blade Zero (S-Game, 9 sept. 2026), nommé jeu de l'année aux Game Awards",
      "Phantom Blade Zero (S-Game, Sept 9, 2026), Game of the Year nominee at the Game Awards",
    ),
    why: l(
      "Le « kungfupunk » : lavis d'encre, papier de riz, sceaux rouges et coups de lame d'une seule image.",
      "“Kungfupunk”: ink wash, rice paper, red seals and single-frame blade strikes.",
    ),
    keywords: l(["encre", "papier de riz", "sceau rouge", "lame", "brume", "silence"], ["ink", "rice paper", "red seal", "blade", "mist", "silence"]),
    palettes: [
      {
        name: l("Encre", "Ink"),
        colors: { bg: "#EFE7D6", surface: "#F8F3E8", ink: "#111010", accent: "#B3201A", accent2: "#3B3A36", glow: "#C9A24A" },
      },
      {
        name: l("Laque", "Lacquer"),
        colors: { bg: "#0C0A0A", surface: "#1A1514", ink: "#F1E7D3", accent: "#E0362A", accent2: "#C9A24A", glow: "#FFFFFF" },
      },
      {
        name: l("Brume", "Mist"),
        colors: { bg: "#C9CEC8", surface: "#DDE1DB", ink: "#141815", accent: "#A3221B", accent2: "#56625A", glow: "#F2F4EF" },
      },
    ],
    type: [
      {
        name: l("Pinceau", "Brush"),
        display: { font: "zhimang", weight: 400 },
        body: { font: "newsreader", weight: 400 },
        accent: { font: "cinzel", weight: 600, upper: true, tracking: 0.2 },
        caption: "brush",
      },
      {
        name: l("Gravure", "Engraving"),
        display: { font: "cinzel", weight: 700, upper: true, tracking: 0.12 },
        body: { font: "newsreader", weight: 400 },
        accent: { font: "zhimang", weight: 400 },
        caption: "brush",
      },
    ],
    textures: ["inkwash", "paper", "grain"],
    motion: [
      {
        name: l("Coup de lame", "Blade strike"),
        signature: "slash",
        spring: { stiffness: 500, damping: 28 },
        ease: [1, 0, 0, 1],
        durations: { in: 140, out: 500, stagger: 40 },
        bpm: 92,
        cut: l(
          "Ralenti, silence, puis une coupe en diagonale d'une seule image.",
          "Slow motion, silence, then a single-frame diagonal cut.",
        ),
        transitions: l(["ralenti", "trait de lame", "image fendue", "retour au calme"], ["slow motion", "blade line", "split frame", "back to stillness"]),
      },
      {
        name: l("Sceau d'encre", "Ink seal"),
        signature: "seal",
        spring: { stiffness: 160, damping: 18 },
        ease: [0.22, 1, 0.36, 1],
        durations: { in: 900, out: 400, stagger: 140 },
        bpm: 80,
        cut: l(
          "L'encre s'étend comme une tache, le sceau rouge tombe sur le dernier temps.",
          "The ink spreads like a stain, the red seal lands on the last beat.",
        ),
        transitions: l(["tache d'encre", "fondu au papier", "sceau qui tombe"], ["ink blot", "fade to paper", "seal landing"]),
      },
    ],
    layouts: [
      {
        name: l("Rouleau vertical", "Vertical scroll"),
        site: "editorial",
        video: "center",
        cue: l(
          "Titre vertical à droite, beaucoup de papier vide, sceau rouge en bas.",
          "Vertical title on the right, lots of empty paper, red seal at the bottom.",
        ),
      },
      {
        name: l("Duel", "Duel"),
        site: "split",
        video: "split",
        cue: l(
          "Deux masses d'encre face à face, la ligne de coupe en diagonale au milieu.",
          "Two masses of ink facing each other, the cut line running diagonally between them.",
        ),
      },
    ],
    radii: [0, 2, 6],
    hooks: l(
      ["Une lame, une goutte d'encre, un *seul* coup.", "Le *silence* avant la coupe.", "Le maître ne frappe *qu'une* fois.", "L'encre n'a pas fini de *sécher*."],
      ["One blade, one drop of ink, *one* strike.", "The *silence* before the cut.", "The master strikes only *once*.", "The ink is not *dry* yet."],
    ),
    card: {
      title: l("Premier mouvement", "First form"),
      rows: l(["Respirer", "Attendre", "Trancher"], ["Breathe", "Wait", "Strike"]),
      meta: l("武", "武"),
    },
    sig: { title: l("Un seul coup", "One strike"), sub: l("武 · l'art martial", "武 · the martial way") },
    cta: l("Dégainer", "Draw"),
    sound: l(
      ["Presque rien, puis le sifflement de la lame", "Cordes pincées en fond", "Impact sec sur le sceau"],
      ["Near silence, then the hiss of the blade", "Plucked strings underneath", "Dry hit on the seal"],
    ),
    do: l(
      ["Du papier vide, de la retenue, un seul rouge", "Des gestes très lents coupés par un mouvement d'une image"],
      ["Empty paper, restraint, a single red", "Very slow gestures cut by a single-frame move"],
    ),
    dont: l(
      ["Personnages, armes ou calligraphies du jeu", "Des caractères chinois décoratifs choisis sans connaître leur sens"],
      ["The game's characters, weapons or calligraphy", "Decorative Chinese characters picked without knowing their meaning"],
    ),
    prompt: {
      subject: "lone swordsman silhouette in a misty courtyard rendered in ink wash, a single red seal stamp, ink splashes",
      style: "kungfupunk, sumi-e ink wash on rice paper, blood red accent, gold leaf flecks, stark contrast, slow motion then a sharp strike",
    },
  },
  {
    id: "terminal",
    code: "TC",
    name: l("Terminal crème", "Cream terminal"),
    ref: l(
      "Les vidéos TikTok sur Claude, ses skills et ses workflows (Claude Code × Remotion, 2026) : la grammaire de départ",
      "TikTok videos about Claude, its skills and workflows (Claude Code × Remotion, 2026): the starting grammar",
    ),
    why: l(
      "Hook en 1,5 s, sous-titres mot à mot, fenêtres d'interface qui basculent sur un ressort, papier crème et terre cuite.",
      "A 1.5 s hook, word-by-word captions, UI windows tilting in on a spring, cream paper and terracotta.",
    ),
    keywords: l(
      ["papier crème", "terre cuite", "terminal", "mot à mot", "checklist", "chaleureux"],
      ["cream paper", "terracotta", "terminal", "word by word", "checklist", "warm"],
    ),
    palettes: [
      {
        name: l("Crème", "Cream"),
        colors: { bg: "#F5F1E8", surface: "#FFFDF7", ink: "#1A1915", accent: "#C96442", accent2: "#5B8DC2", glow: "#788C5D" },
      },
      {
        name: l("Ardoise", "Slate"),
        colors: { bg: "#1A1915", surface: "#26251F", ink: "#F5F1E8", accent: "#E08A68", accent2: "#8DB4DE", glow: "#A3B57E" },
      },
      {
        name: l("Bulle bleue", "Blue bubble"),
        colors: { bg: "#FAF8F3", surface: "#FFFFFF", ink: "#141413", accent: "#0A6FE0", accent2: "#C96442", glow: "#FFD24D" },
      },
    ],
    type: [
      {
        name: l("Éditorial chaleureux", "Warm editorial"),
        display: { font: "newsreader", weight: 600, tracking: -0.02 },
        body: { font: "inter", weight: 500 },
        accent: { font: "jetbrains", weight: 500 },
        caption: "pill",
      },
      {
        name: l("Créateur IA", "AI creator"),
        display: { font: "inter", weight: 800, tracking: -0.04 },
        body: { font: "inter", weight: 500 },
        accent: { font: "jetbrains", weight: 500 },
        caption: "bold",
      },
    ],
    textures: ["dots", "paper", "grain"],
    motion: [
      {
        name: l("Pop mot à mot", "Word-by-word pop"),
        signature: "bubble",
        spring: SPRING_UI,
        ease: [0.23, 1, 0.32, 1],
        durations: { in: 420, out: 160, stagger: 90 },
        bpm: 112,
        cut: l(
          "Un nouveau plan toutes les 0,5 à 1 s, 2 à 4 mots par sous-titre, un seul mot surligné.",
          "A new shot every 0.5–1 s, 2 to 4 words per caption, a single highlighted word.",
        ),
        transitions: l(
          ["pop sur ressort", "bulle de surlignage", "curseur qui clique", "fondu de 4 images"],
          ["spring pop", "highlight bubble", "clicking cursor", "4-frame fade"],
        ),
      },
      {
        name: l("Fenêtre inclinée", "Tilted window"),
        signature: "zoom",
        spring: { stiffness: 140, damping: 16 },
        ease: [0.16, 1, 0.3, 1],
        durations: { in: 640, out: 200, stagger: 60 },
        bpm: 96,
        cut: l(
          "Fenêtre en perspective (rotateX 14°, rotateY −10°), puis zoom sur le détail qui compte.",
          "Window in perspective (rotateX 14°, rotateY −10°), then a zoom on the detail that matters.",
        ),
        transitions: l(["bascule 3D", "zoom sur un détail", "anneau de focus", "fond qui s'assombrit"], ["3D tilt", "zoom on a detail", "focus ring", "dimmed background"]),
      },
    ],
    layouts: [
      {
        name: l("Sous-titres au centre", "Centre captions"),
        site: "center",
        video: "center",
        cue: l(
          "Sous-titres à 55 % de la hauteur, jamais dans les 10 % du haut ni les 20 % du bas.",
          "Captions at 55% of the height, never in the top 10% or the bottom 20%.",
        ),
      },
      {
        name: l("Écran partagé 50/50", "50/50 split"),
        site: "split",
        video: "split",
        cue: l(
          "Capture d'interface en haut, visage en bas, sous-titre centré sur la couture.",
          "UI capture on top, face below, caption centred on the seam.",
        ),
      },
    ],
    radii: [10, 14, 20],
    hooks: l(
      ["Cette skill fait le travail de *trois* outils.", "Claude a monté cette vidéo. *Pas* moi.", "Trois étapes, *zéro* After Effects.", "Le workflow que *personne* ne montre."],
      ["This skill does the job of *three* tools.", "Claude edited this video. *Not* me.", "Three steps, *zero* After Effects.", "The workflow *nobody* shows."],
    ),
    card: {
      title: l("~/projets/da", "~/projects/da"),
      rows: l(["Palette générée", "Typo choisie", "Motion calée sur le tempo"], ["Palette generated", "Type picked", "Motion locked to the tempo"]),
      meta: l("Génération…", "Generating…"),
    },
    sig: { title: l("Skill installée", "Skill installed"), sub: l("3 étapes · 0 After Effects", "3 steps · 0 After Effects") },
    cta: l("Lancer la skill", "Run the skill"),
    sound: l(
      ["Clic de clavier mécanique sous le terminal", "Whoosh doux à chaque fenêtre", "Électro légère, sans voix"],
      ["Mechanical keyboard clicks under the terminal", "Soft whoosh on every window", "Light electronic music, no voice"],
    ),
    do: l(
      ["Montrer de vraies interfaces qui bougent sur chaque mot", "Un seul mot surligné par sous-titre"],
      ["Show real interfaces moving on every word", "A single highlighted word per caption"],
    ),
    dont: l(
      ["Le logo de Claude ou d'Anthropic", "Plus de quatre mots à l'écran en même temps"],
      ["The Claude or Anthropic logo", "More than four words on screen at once"],
    ),
    prompt: {
      subject: "a tilted terminal window and UI cards floating over warm cream paper, a cursor clicking a highlighted keyword",
      style: "warm editorial minimalism, terracotta accent, soft shadows, serif headline, monospace details, clean 9:16 motion graphics",
    },
  },
];

export const getUniverse = (id: DaUniverseId): DaUniverse => daUniverses.find((universe) => universe.id === id)!;
