import { daUniverses, type DaRole, type DaSpring, type DaTypeRole, type DaUniverse } from "@content/da";
import { DA_FONTS } from "./fonts";

/**
 * Engine of the DA generator: picks, shareable codes, springs and colour maths.
 * Pure functions only (no DOM), shared by the preview, the board and the exports.
 */

export type DaFormat = "video" | "site";
export type DaFacet = "palette" | "type" | "texture" | "motion" | "layout";
export const DA_FACETS: readonly DaFacet[] = ["palette", "type", "texture", "motion", "layout"];

export interface DaPick {
  palette: number;
  type: number;
  texture: number;
  motion: number;
  layout: number;
  hook: number;
  grain: number;
  radius: number;
}

export interface Da {
  universe: DaUniverse;
  pick: DaPick;
  /** Shareable code: universe prefix + the picks packed in base 36 ("HW-0K7"). */
  code: string;
}

/** Grain opacity levels. */
export const GRAIN = [0.05, 0.09, 0.14] as const;

const KEYS: readonly (keyof DaPick)[] = ["palette", "type", "texture", "motion", "layout", "hook", "grain", "radius"];

const radix = (universe: DaUniverse): number[] => [
  universe.palettes.length,
  universe.type.length,
  universe.textures.length,
  universe.motion.length,
  universe.layouts.length,
  universe.hooks.fr.length,
  GRAIN.length,
  universe.radii.length,
];

export function encode(universe: DaUniverse, pick: DaPick): string {
  const sizes = radix(universe);
  const packed = KEYS.reduce((n, key, index) => n * sizes[index]! + pick[key], 0);
  return `${universe.code}-${packed.toString(36).toUpperCase().padStart(3, "0")}`;
}

export const makeDa = (universe: DaUniverse, pick: DaPick): Da => ({ universe, pick, code: encode(universe, pick) });

/** Reads a code back ("hw-0k7" works too). Returns null when it does not describe a DA. */
export function decode(code: string): Da | null {
  const match = /^([a-z0-9]{2})-([a-z0-9]{1,5})$/i.exec(code.trim());
  if (!match) return null;
  const universe = daUniverses.find((item) => item.code === match[1]!.toUpperCase());
  if (!universe) return null;
  const sizes = radix(universe);
  let packed = parseInt(match[2]!, 36);
  if (!Number.isFinite(packed) || packed >= sizes.reduce((a, b) => a * b, 1)) return null;
  const pick = {} as DaPick;
  for (let index = KEYS.length - 1; index >= 0; index--) {
    pick[KEYS[index]!] = packed % sizes[index]!;
    packed = Math.floor(packed / sizes[index]!);
  }
  return makeDa(universe, pick);
}

/** First DA shown (static, so the server and the browser render the same thing). */
export const initialDa = (): Da =>
  makeDa(daUniverses[0]!, { palette: 0, type: 0, texture: 0, motion: 0, layout: 0, hook: 0, grain: 1, radius: 1 });

/**
 * New DA in a universe. Locked facets keep their previous pick; grain follows the texture lock and
 * the corner radius follows the layout lock. Never returns the exact same DA twice in a row.
 */
export function rollDa(
  universe: DaUniverse,
  previous: DaPick | null,
  locks: ReadonlySet<DaFacet>,
  random: () => number = Math.random,
): Da {
  const sizes = radix(universe);
  const pickOne = (index: number) => Math.floor(random() * sizes[index]!);
  const keep = (facet: DaFacet) => previous !== null && locks.has(facet);
  for (let attempt = 0; attempt < 8; attempt++) {
    const pick: DaPick = {
      palette: keep("palette") ? previous!.palette : pickOne(0),
      type: keep("type") ? previous!.type : pickOne(1),
      texture: keep("texture") ? previous!.texture : pickOne(2),
      motion: keep("motion") ? previous!.motion : pickOne(3),
      layout: keep("layout") ? previous!.layout : pickOne(4),
      hook: pickOne(5),
      grain: keep("texture") ? previous!.grain : pickOne(6),
      radius: keep("layout") ? previous!.radius : pickOne(7),
    };
    if (!previous || KEYS.some((key) => pick[key] !== previous[key])) return makeDa(universe, pick);
  }
  return makeDa(universe, { ...previous!, hook: (previous!.hook + 1) % sizes[5]! });
}

/** Everything a DA resolves to, read once. */
export function resolve(da: Da) {
  const { universe, pick } = da;
  const palette = universe.palettes[pick.palette]!;
  const type = universe.type[pick.type]!;
  const motion = universe.motion[pick.motion]!;
  const layout = universe.layouts[pick.layout]!;
  return {
    palette,
    colors: palette.colors,
    type,
    texture: universe.textures[pick.texture]!,
    motion,
    layout,
    grain: GRAIN[pick.grain]!,
    radius: universe.radii[pick.radius]!,
    hookIndex: pick.hook,
  };
}

/* ───────── Captions ───────── */

export interface CaptionWord {
  text: string;
  /** Highlighted word (`*word*` in the content). */
  hl: boolean;
}

export const parseLine = (line: string): CaptionWord[] =>
  line
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => ({ text: token.replace(/\*/g, ""), hl: token.includes("*") }));

/** Social-video subtitles: 2 to 3 words on screen at a time. */
export function chunkLine(words: CaptionWord[], size = 3): CaptionWord[][] {
  const chunks: CaptionWord[][] = [];
  for (let index = 0; index < words.length; index += size) chunks.push(words.slice(index, index + size));
  // Avoid a lonely last word.
  const last = chunks[chunks.length - 1];
  if (chunks.length > 1 && last && last.length === 1) chunks[chunks.length - 2]!.push(...chunks.pop()!);
  return chunks;
}

/* ───────── Springs ───────── */

export interface SpringCurve {
  /** Time to settle, in seconds. */
  duration: number;
  /** Position samples from 0 to 1 (overshoot included), evenly spaced in time. */
  values: number[];
  /** Highest position reached (1.15 = 15% overshoot). */
  peak: number;
}

/**
 * Damped spring from 0 to 1 (same physics as Remotion's `spring()`), integrated at 240 Hz until it
 * settles, then resampled: the samples become a CSS `linear()` easing.
 */
export function springCurve({ stiffness, damping, mass = 1 }: DaSpring, samples = 36): SpringCurve {
  const dt = 1 / 240;
  let x = 0;
  let v = 0;
  let t = 0;
  let peak = 0;
  const xs = [0];
  while (t < 3) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    t += dt;
    xs.push(x);
    peak = Math.max(peak, x);
    if (t > 0.05 && Math.abs(x - 1) < 0.002 && Math.abs(v) < 0.02) break;
  }
  const values: number[] = [];
  for (let index = 0; index <= samples; index++) {
    const at = Math.min(xs.length - 1, Math.round(((index / samples) * t) / dt));
    values.push(xs[at]!);
  }
  values[0] = 0;
  values[samples] = 1;
  return { duration: t, values, peak };
}

const round = (value: number, digits = 3) => Number(value.toFixed(digits));

export const springToLinear = (curve: SpringCurve): string => `linear(${curve.values.map((value) => round(value)).join(", ")})`;

export const cubic = (ease: readonly [number, number, number, number]): string => `cubic-bezier(${ease.map((value) => round(value, 2)).join(", ")})`;

/* ───────── Colours ───────── */

const channels = (hex: string): [number, number, number] => {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16)) as [number, number, number];
};

export const rgb = (hex: string): string => channels(hex).join(", ");

export function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, from 1 to 21. */
export function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
}

export const contrastGrade = (ratio: number): "AAA" | "AA" | "AA18" | "—" =>
  ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA18" : "—";

/** The most readable of the candidates on a background. */
export const readableOn = (background: string, candidates: readonly string[]): string =>
  candidates.reduce((best, candidate) => (contrast(background, candidate) > contrast(background, best) ? candidate : best));

export function mix(a: string, b: string, weight: number): string {
  const ca = channels(a);
  const cb = channels(b);
  return `#${ca
    .map((channel, index) => Math.round(channel * (1 - weight) + cb[index]! * weight).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
}

/* ───────── CSS custom properties ───────── */

const stack = (role: DaTypeRole) => {
  const font = DA_FONTS[role.font];
  return `${font.css}, ${font.fallback}`;
};

/** Custom properties that dress the preview (and that `da.css` exports with real font names). */
export function daStyle(da: Da): Record<string, string> {
  const { colors, type, motion, grain, radius } = resolve(da);
  const spring = springCurve(motion.spring);
  const beat = 60 / motion.bpm;
  const typeVars = (prefix: string, role: DaTypeRole) => ({
    [`--da-${prefix}`]: stack(role),
    [`--da-${prefix}-weight`]: String(role.weight),
    [`--da-${prefix}-case`]: role.upper ? "uppercase" : "none",
    [`--da-${prefix}-tracking`]: `${role.tracking ?? 0}em`,
    [`--da-${prefix}-width`]: `${role.width ?? 100}%`,
  });
  return {
    ...colorVars(colors),
    ...typeVars("display", type.display),
    ...typeVars("body", type.body),
    ...typeVars("type-accent", type.accent),
    "--da-radius": `${radius}px`,
    "--da-grain": String(grain),
    "--da-ease": cubic(motion.ease),
    "--da-spring": springToLinear(spring),
    "--da-in": `${motion.durations.in}ms`,
    "--da-out": `${motion.durations.out}ms`,
    "--da-stagger": `${motion.durations.stagger}ms`,
    "--da-beat": `${round(beat)}s`,
  };
}

export function colorVars(colors: Readonly<Record<DaRole, string>>): Record<string, string> {
  const darkBg = luminance(colors.bg) < luminance(colors.ink);
  return {
    /* Darker and lighter of background and ink: silhouettes and highlights of the scenes. */
    "--da-deep": darkBg ? colors.bg : colors.ink,
    "--da-pale": darkBg ? colors.ink : colors.bg,
    "--da-bg": colors.bg,
    "--da-surface": colors.surface,
    "--da-ink": colors.ink,
    "--da-accent": colors.accent,
    "--da-accent-2": colors.accent2,
    "--da-glow": colors.glow,
    "--da-ink-rgb": rgb(colors.ink),
    "--da-bg-rgb": rgb(colors.bg),
    "--da-muted": mix(colors.ink, colors.bg, 0.32),
    "--da-on-accent": readableOn(colors.accent, [colors.ink, colors.bg, "#FFFFFF", "#111111"]),
    "--da-on-accent-2": readableOn(colors.accent2, [colors.ink, colors.bg, "#FFFFFF", "#111111"]),
  };
}

/** Length of the preview loop: 16 beats (4 bars), in seconds. */
export const loopSeconds = (bpm: number) => (16 * 60) / bpm;
