import type { DaCaption, DaSignatureId } from "@content/da";
import { cubic, resolve, springCurve, springToLinear, type Da, type DaFormat } from "./engine";

/**
 * Motion timeline of the preview: a 16-beat loop at the DA's tempo, four scenes of four beats
 * (hook, demo, signature, CTA). Everything runs on the Web Animations API with keyframes written
 * in beats, so the spring entrances (CSS `linear()` from the DA's spring) keep their exact length.
 *
 * The preview declares what moves with data attributes (`data-a="pop" data-at="2.5"`) and names the
 * pieces of the signature scene (`data-k="title"`); this module turns them into animations.
 * Only `transform` and `opacity` are animated.
 */

export const BEATS = 16;
export type DaSceneId = "hook" | "demo" | "signature" | "cta";
export const DA_SCENES: readonly { id: DaSceneId; at: number }[] = [
  { id: "hook", at: 0 },
  { id: "demo", at: 4 },
  { id: "signature", at: 8 },
  { id: "cta", at: 12 },
];

/** Signatures whose scenes cross-fade; the others cut on the beat. */
const SOFT: ReadonlySet<DaSignatureId> = new Set(["reveal", "gloss", "echo", "seal", "vhs"]);

export interface Timing {
  beatMs: number;
  loopMs: number;
  /** Entrance spring as a CSS easing, and the time it takes to settle, in beats. */
  spring: string;
  springB: number;
  ease: string;
  inB: number;
  outB: number;
  staggerB: number;
  soft: boolean;
  signature: DaSignatureId;
  caption: DaCaption;
}

export function timing(da: Da): Timing {
  const { motion, type } = resolve(da);
  const beatMs = 60000 / motion.bpm;
  const curve = springCurve(motion.spring);
  const beats = (ms: number) => ms / beatMs;
  return {
    beatMs,
    loopMs: beatMs * BEATS,
    spring: springToLinear(curve),
    springB: beats(Math.min(curve.duration * 1000, 1500)),
    ease: cubic(motion.ease),
    inB: beats(motion.durations.in),
    outB: beats(motion.durations.out),
    staggerB: beats(motion.durations.stagger),
    soft: SOFT.has(motion.signature),
    signature: motion.signature,
    caption: type.caption,
  };
}

/** Rounded beat value for a data attribute. */
export const beatAttr = (beat: number) => String(Number(beat.toFixed(3)));

/* ───────── Keyframes in beats ───────── */

interface Pose {
  o?: number;
  /** Translation, in % of the element's own box. */
  x?: number;
  y?: number;
  s?: number;
  sx?: number;
  sy?: number;
  r?: number;
  rx?: number;
  ry?: number;
  kx?: number;
}

/** A pose at a beat. `e` is the easing used to reach it; "step" holds the previous pose and jumps. */
export interface Key extends Pose {
  at: number;
  e?: string;
}

type Full = Required<Pose>;
const NEUTRAL: Full = { o: 1, x: 0, y: 0, s: 1, sx: 1, sy: 1, r: 0, rx: 0, ry: 0, kx: 0 };
const PROPS = ["o", "x", "y", "s", "sx", "sy", "r", "rx", "ry", "kx"] as const;

function transform(pose: Full, used: ReadonlySet<string>): string {
  const parts: string[] = [];
  if (used.has("rx") || used.has("ry")) parts.push("perspective(900px)");
  if (used.has("x") || used.has("y")) parts.push(`translate(${pose.x}%, ${pose.y}%)`);
  if (used.has("rx")) parts.push(`rotateX(${pose.rx}deg)`);
  if (used.has("ry")) parts.push(`rotateY(${pose.ry}deg)`);
  if (used.has("r")) parts.push(`rotate(${pose.r}deg)`);
  if (used.has("s")) parts.push(`scale(${pose.s})`);
  if (used.has("sx") || used.has("sy")) parts.push(`scale(${pose.sx}, ${pose.sy})`);
  if (used.has("kx")) parts.push(`skewX(${pose.kx}deg)`);
  return parts.join(" ");
}

export function keyframes(keys: readonly Key[]): Keyframe[] {
  const sorted = [...keys].sort((a, b) => a.at - b.at);
  const used = new Set<string>();
  for (const key of sorted) for (const prop of PROPS) if (prop !== "o" && key[prop] !== undefined) used.add(prop);
  const hasOpacity = sorted.some((key) => key.o !== undefined);

  let pose: Full = { ...NEUTRAL };
  const frames: { at: number; e?: string; pose: Full }[] = [];
  for (const key of sorted) {
    const at = Math.min(BEATS, Math.max(0, key.at));
    const next = { ...pose };
    for (const prop of PROPS) if (key[prop] !== undefined) next[prop] = key[prop]!;
    if (!frames.length && at > 0) frames.push({ at: 0, pose: next });
    if (key.e === "step" && frames.length) frames.push({ at, pose: frames[frames.length - 1]!.pose });
    frames.push({ at, e: key.e, pose: next });
    pose = next;
  }
  if (!frames.length) frames.push({ at: 0, pose });
  if (frames[frames.length - 1]!.at < BEATS) frames.push({ at: BEATS, pose });

  return frames.map((frame, index) => {
    const next = frames[index + 1];
    const keyframe: Keyframe = { offset: frame.at / BEATS, easing: next?.e && next.e !== "step" ? next.e : "linear" };
    if (hasOpacity) keyframe.opacity = frame.pose.o;
    if (used.size) keyframe.transform = transform(frame.pose, used);
    return keyframe;
  });
}

/* ───────── Building blocks ───────── */

type Ease = "spring" | "ease" | "step";

/** Starting poses of the entrances, by name (`data-from`). */
const FROM: Record<string, { pose: Pose; ease: Ease }> = {
  up: { pose: { o: 0, y: 42, s: 0.84 }, ease: "spring" },
  slam: { pose: { o: 0, s: 1.5 }, ease: "spring" },
  zoom: { pose: { o: 0, s: 1.28 }, ease: "spring" },
  left: { pose: { o: 0, x: -26 }, ease: "spring" },
  ink: { pose: { o: 0, s: 1.14, r: -4 }, ease: "spring" },
  drop: { pose: { o: 0, s: 1.8, r: -18 }, ease: "spring" },
  tilt: { pose: { o: 0, rx: 34, ry: -28, y: 24, s: 0.88 }, ease: "spring" },
  far: { pose: { o: 0, s: 0.5 }, ease: "spring" },
  card: { pose: { o: 0, y: 30, s: 0.9 }, ease: "spring" },
  rise: { pose: { o: 0, y: 30 }, ease: "ease" },
  fade: { pose: { o: 0 }, ease: "ease" },
  cut: { pose: { o: 0 }, ease: "step" },
};

/** Resting poses other than neutral (`data-rest`). */
const REST: Record<string, Pose> = {
  tilted: { rx: 12, ry: -10, r: -3 },
};

/** Entrance of the caption words, by caption style. */
export const CAPTION_FROM: Readonly<Record<DaCaption, string>> = {
  pill: "up",
  bold: "up",
  outline: "slam",
  glow: "zoom",
  wide: "fade",
  osd: "cut",
  glossy: "up",
  bar: "fade",
  redact: "left",
  brush: "ink",
};

/** Hidden until `at`, enters, then leaves at `out` (a cut, or a fade on soft DAs). */
function pop(t: Timing, from: Pose, ease: Ease, at: number, out: number | null, rest: Pose = {}): Key[] {
  const target: Pose = { o: 1, ...Object.fromEntries(Object.keys(from).map((prop) => [prop, NEUTRAL[prop as keyof Full]])), ...rest };
  const length = ease === "spring" ? t.springB : ease === "ease" ? Math.max(t.inB, 0.35) : 0;
  const end = out === null ? at + length : Math.max(at + 0.01, Math.min(at + length, out - 0.02));
  const keys: Key[] = [
    { at: 0, ...from },
    { at, ...from },
    { at: ease === "step" ? at : end, ...target, e: ease === "spring" ? t.spring : ease === "ease" ? t.ease : "step" },
  ];
  if (out !== null && out < BEATS) {
    if (t.soft) keys.push({ at: out }, { at: Math.min(BEATS, out + Math.max(t.outB, 0.2)), o: 0, e: t.ease });
    else keys.push({ at: out, o: 0, e: "step" });
  }
  return keys;
}

function sceneKeys(t: Timing, w0: number, w1: number): Key[] {
  const fade = t.soft ? Math.min(Math.max(t.outB, 0.3), 1) : 0;
  if (!fade) {
    if (w0 === 0) return [{ at: 0, o: 1 }, { at: w1, o: 0, e: "step" }];
    if (w1 >= BEATS) return [{ at: 0, o: 0 }, { at: w0, o: 1, e: "step" }];
    return [{ at: 0, o: 0 }, { at: w0, o: 1, e: "step" }, { at: w1, o: 0, e: "step" }];
  }
  const keys: Key[] = w0 === 0 ? [{ at: 0, o: 1 }] : [{ at: 0, o: 0 }, { at: w0 }, { at: w0 + fade, o: 1, e: "linear" }];
  if (w1 >= BEATS) keys.push({ at: BEATS - fade, o: 1 }, { at: BEATS, o: 0, e: "linear" });
  else keys.push({ at: w1 }, { at: w1 + fade, o: 0, e: "linear" });
  return keys;
}

/** Visible all along except between `w0` and `w1` (the copy of a site hero during the signature). */
function gapKeys(t: Timing, w0: number, w1: number): Key[] {
  const fade = Math.min(Math.max(t.outB, 0.25), 0.8);
  return [{ at: 0, o: 1 }, { at: w0 - fade }, { at: w0, o: 0, e: t.ease }, { at: w1 }, { at: w1 + fade, o: 1, e: t.ease }];
}

/** A flash on each beat given. */
const flashKeys = (beats: readonly number[]): Key[] => [
  { at: 0, o: 0 },
  ...beats.flatMap((beat): Key[] => [
    { at: beat, o: 0.92, e: "step" },
    { at: beat + 0.3, o: 0, e: "linear" },
  ]),
];

/** A short camera shake starting at `at`, in % of the frame. */
const shake = (at: number, force = 2.4): Key[] => [
  { at: 0, x: 0, y: 0 },
  { at, x: force, y: -force * 0.6, e: "step" },
  { at: at + 0.1, x: -force * 0.8, y: force * 0.5 },
  { at: at + 0.2, x: force * 0.5, y: -force * 0.3 },
  { at: at + 0.3, x: -force * 0.25, y: force * 0.15 },
  { at: at + 0.45, x: 0, y: 0 },
];

type Track = readonly [Element | null, Key[]];

/* ───────── Signatures (scene 3, beats 8 to 12) ───────── */

interface SignaturePlan {
  tracks: Track[];
  flashes?: number[];
  /** Extra camera move during the scene (nested in the base camera). */
  cam?: Key[];
}

function signaturePlan(t: Timing, root: Element, q: (key: string) => Element | null): SignaturePlan {
  const W = 8;
  const tracks: Track[] = [];
  const add = (key: string, keys: Key[]) => tracks.push([q(key), keys]);
  const all = (key: string) => [...root.querySelectorAll(`[data-k="${key}"]`)];
  const enter = (key: string, name: string, at: number, rest?: Pose) => {
    const preset = FROM[name]!;
    add(key, pop(t, preset.pose, preset.ease, at, null, rest));
  };

  switch (t.signature) {
    case "freeze":
      add("desat", [{ at: 0, o: 0 }, { at: W, o: 1, e: "step" }, { at: W + 4, o: 0, e: "step" }]);
      enter("pause", "far", W);
      add("card", pop(t, { o: 0, x: -118 }, "spring", W + 0.25, null));
      enter("title", "up", W + 0.55);
      enter("sub", "rise", W + 0.95);
      return { tracks, flashes: [W], cam: [{ at: 0, s: 1 }, { at: W, s: 1.06, e: "step" }, { at: W + 4, s: 1, e: "step" }] };

    case "phonk": {
      const hits = [W, W + 1, W + 2, W + 3];
      enter("title", "slam", W);
      enter("sub", "rise", W + 1);
      add("shake", [
        { at: 0, x: 0 },
        ...hits.flatMap((hit): Key[] => [
          { at: hit, x: 3, e: "step" },
          { at: hit + 0.12, x: -2.4 },
          { at: hit + 0.24, x: 1.2 },
          { at: hit + 0.36, x: 0 },
        ]),
      ]);
      for (const [key, x] of [["ca", -5], ["cb", 5]] as const)
        add(key, [
          { at: 0, o: 0, x: 0 },
          ...hits.flatMap((hit): Key[] => [
            { at: hit, o: 0.9, x, e: "step" },
            { at: hit + 0.35, o: 0, x: 0, e: "linear" },
          ]),
        ]);
      return {
        tracks,
        flashes: hits,
        cam: [{ at: 0, s: 1 }, ...hits.flatMap((hit): Key[] => [{ at: hit, s: 1.17, e: "step" }, { at: hit + 0.85, s: 1, e: t.ease }]), { at: W + 4, s: 1 }],
      };
    }

    case "bubble": {
      all("w").forEach((word, index) => tracks.push([word, pop(t, FROM.up!.pose, "spring", W + 0.1 + index * Math.max(t.staggerB, 0.22), null)]));
      add("hlbg", [{ at: 0, sx: 0 }, { at: W + 1.1 }, { at: W + 1.1 + t.springB, sx: 1, e: t.spring }]);
      add("cursor", [
        { at: 0, o: 0, x: 420, y: 520, s: 1 },
        { at: W + 1.2 },
        { at: W + 1.45, o: 1, e: "linear" },
        { at: W + 2.2, x: 0, y: 0, e: t.ease },
        { at: W + 2.35, s: 0.8, e: "linear" },
        { at: W + 2.65, s: 1, e: t.spring },
      ]);
      add("sring", [{ at: 0, o: 0, s: 0.3 }, { at: W + 2.35 }, { at: W + 2.36, o: 1, e: "step" }, { at: W + 3.2, o: 0, s: 1.9, e: t.ease }]);
      enter("sub", "rise", W + 2.6);
      return { tracks };
    }

    case "zoom":
      add("win", pop(t, FROM.tilt!.pose, "spring", W, null, REST.tilted));
      add("zoomer", [{ at: 0, s: 1, x: 0, y: 0 }, { at: W + 2 }, { at: W + 2 + Math.max(t.inB, 0.9), s: 1.5, x: -6, y: -16, e: t.ease }]);
      add("focus", [{ at: 0, o: 0, s: 1.35 }, { at: W + 2.5 }, { at: W + 2.5 + Math.min(t.springB, 0.9), o: 1, s: 1, e: t.spring }]);
      add("shade", [{ at: 0, o: 0 }, { at: W + 2 }, { at: W + 2.6, o: 0.5, e: t.ease }]);
      enter("title", "up", W + 0.7);
      return { tracks };

    case "reveal": {
      const letters = all("l");
      const mid = (letters.length - 1) / 2;
      letters.forEach((letter, index) =>
        tracks.push([
          letter,
          [
            { at: 0, o: 0, x: (index - mid) * 150 },
            { at: W + 0.3 },
            { at: W + 0.3 + Math.max(t.inB * 2, 2), o: 1, x: 0, e: t.ease },
          ],
        ]),
      );
      add("shade", [{ at: 0, o: 1 }, { at: W }, { at: W + 1.8, o: 0, e: t.ease }]);
      enter("sub", "fade", W + 2.3);
      return { tracks, cam: [{ at: 0, s: 1 }, { at: W, s: 1, e: "step" }, { at: W + 4, s: 1.07, e: "linear" }] };
    }

    case "clash": {
      const hit = W + 1;
      add("pa", [{ at: 0, x: -104 }, { at: W }, { at: hit, x: 0, e: t.ease }]);
      add("pb", [{ at: 0, x: 104 }, { at: W }, { at: hit, x: 0, e: t.ease }]);
      enter("vs", "slam", hit);
      enter("title", "up", hit + 0.6);
      enter("sub", "rise", hit + 1.1);
      return { tracks, flashes: [hit], cam: shake(hit, 2.6) };
    }

    case "vhs": {
      const sweep = (from: number): Key[] => [
        { at: from, o: 1, y: -120, e: "step" },
        { at: from + 0.9, y: 1100, e: "linear" },
        { at: from + 0.9, o: 0, e: "step" },
      ];
      add("band", [{ at: 0, o: 0, y: -120 }, ...sweep(W + 0.2), ...sweep(W + 2.6)]);
      const jump = (from: number): Key[] => [
        { at: from, x: -4, kx: 10, e: "step" },
        { at: from + 0.14, x: 3, kx: -5, e: "step" },
        { at: from + 0.28, x: 0, kx: 0, e: "step" },
      ];
      add("jump", [{ at: 0, x: 0, kx: 0 }, ...jump(W + 0.7), ...jump(W + 3)]);
      enter("osd", "cut", W);
      enter("title", "cut", W + 0.5);
      enter("sub", "cut", W + 1.5);
      return { tracks };
    }

    case "flicker": {
      const pattern: [number, number][] = [
        [0, 1],
        [0.12, 0],
        [0.3, 1],
        [0.38, 0],
        [0.9, 0.85],
        [0.96, 0],
        [2, 1],
        [2.55, 0],
        [3.2, 1],
        [3.27, 0],
      ];
      add("shade", [{ at: 0, o: 0 }, ...pattern.map(([at, o]): Key => ({ at: W + at, o, e: "step" }))]);
      add("title", [{ at: 0, o: 0 }, { at: W + 2.2, o: 1, e: "step" }]);
      add("sub", [{ at: 0, o: 0 }, { at: W + 2.55, o: 1, e: "step" }]);
      return { tracks, cam: [{ at: 0, s: 1 }, { at: W + 2.25, s: 1.1, e: "step" }, { at: W + 4, s: 1, e: "step" }] };
    }

    case "gloss":
      enter("title", "up", W);
      enter("sub", "rise", W + 0.8);
      add("sweep", [{ at: 0, x: -150 }, { at: W + 1 }, { at: W + 2, x: 360, e: t.ease }, { at: W + 2.4, x: -150, e: "step" }, { at: W + 3.4, x: 360, e: t.ease }]);
      all("b").forEach((bubble, index) => {
        const at = W + index * 0.55;
        tracks.push([bubble, [{ at: 0, o: 0, y: 0, s: 0.6 }, { at }, { at: at + 0.4, o: 1, s: 1, e: "linear" }, { at: at + 2.6, o: 0, y: -320, e: "linear" }]]);
      });
      return { tracks };

    case "corrupt": {
      enter("title", "up", W);
      enter("sub", "rise", W + 0.5);
      const glitch: [number, number][] = [
        [2, 1],
        [2.2, 0],
        [2.45, 1],
        [2.55, 0],
        [3.1, 1],
        [3.5, 0],
      ];
      add("inv", [{ at: 0, o: 0 }, ...glitch.map(([at, o]): Key => ({ at: W + at, o, e: "step" }))]);
      all("slice").forEach((slice, index) => {
        const side = index % 2 ? 1 : -1;
        tracks.push([
          slice,
          [
            { at: 0, o: 0, x: 0 },
            { at: W + 2, o: 1, x: 7 * side, e: "step" },
            { at: W + 2.3, x: -4 * side, e: "step" },
            { at: W + 2.6, o: 0, x: 0, e: "step" },
            { at: W + 3.1, o: 1, x: -9 * side, e: "step" },
            { at: W + 3.5, o: 0, x: 0, e: "step" },
          ],
        ]);
      });
      return { tracks, cam: shake(W + 2, 1.6) };
    }

    case "boomerang": {
      enter("sub", "up", W + 0.5);
      const swings: Key[] = Array.from({ length: 7 }, (_, index) => ({
        at: W + 0.5 + (index + 1) * 0.5,
        s: index % 2 ? 1 : 1.1,
        r: index % 2 ? 0 : -5,
        e: t.ease,
      }));
      add("title", [{ at: 0, o: 0, s: 0.6, r: 0 }, { at: W }, { at: W + 0.5, o: 1, s: 1, e: t.spring }, ...swings]);
      all("spark").forEach((spark, index) => {
        const at = W + 0.4 + index * 0.6;
        tracks.push([spark, [{ at: 0, o: 0, s: 0, r: 0 }, { at }, { at: at + 0.35, o: 1, s: 1, r: 45, e: "linear" }, { at: at + 0.8, o: 0, s: 0.2, r: 90, e: "linear" }]]);
      });
      return { tracks };
    }

    case "sticker":
      enter("title", "up", W + 0.25);
      enter("st1", "drop", W, { r: -9 });
      enter("st2", "drop", W + 0.75, { r: 8 });
      enter("st3", "drop", W + 1.5, { r: -4 });
      add("up", [
        { at: 0, o: 0, y: 0 },
        { at: W + 2.2 },
        { at: W + 2.4, o: 1, e: "linear" },
        ...[0, 1, 2, 3].flatMap((index): Key[] => [
          { at: W + 2.4 + index * 0.4, y: -30, e: t.ease },
          { at: W + 2.6 + index * 0.4, y: 0, e: t.ease },
        ]),
      ]);
      return { tracks };

    case "slam": {
      const settle = Math.min(t.springB, 0.6);
      add("slabA", [{ at: 0, o: 0, s: 1.35 }, { at: W }, { at: W + settle, o: 1, s: 1, e: t.spring }, { at: W + 2, o: 0, e: "step" }]);
      add("rule", [{ at: 0, sx: 0 }, { at: W + 0.3 }, { at: W + 0.9, sx: 1, e: t.ease }]);
      add("black", [{ at: 0, o: 0 }, { at: W + 2, o: 1, e: "step" }, { at: W + 2.12, o: 0, e: "step" }]);
      add("slabB", [{ at: 0, o: 0, s: 1.35 }, { at: W + 2.12 }, { at: W + 2.12 + settle, o: 1, s: 1, e: t.spring }]);
      return { tracks };
    }

    case "echo": {
      enter("title", "fade", W);
      enter("sub", "fade", W + 1);
      for (const [key, side] of [["ea", -1], ["eb", 1]] as const)
        add(key, [
          { at: 0, o: 0, x: 0, y: 0 },
          { at: W + 0.3 },
          { at: W + 1, o: 0.85, x: 3 * side, y: 0.6 * side, e: t.ease },
          { at: W + 2, x: 7 * side, y: -1 * side, e: t.ease },
          { at: W + 3, x: 3 * side, y: 0.6 * side, e: t.ease },
          { at: W + 4, x: 8 * side, y: -1.2 * side, o: 0.5, e: t.ease },
        ]);
      all("obj").forEach((object, index) =>
        tracks.push([
          object,
          [
            { at: 0, o: 0, y: 0, r: 0 },
            { at: W + 0.4 },
            { at: W + 1.2, o: 1, y: -10, r: index ? 6 : -5, e: t.ease },
            { at: W + 2.6, y: 4, r: index ? -3 : 3, e: t.ease },
            { at: W + 4, y: -8, r: index ? 5 : -4, e: t.ease },
          ],
        ]),
      );
      return { tracks };
    }

    case "slash": {
      const cut = W + 2;
      const out = "cubic-bezier(.16, 1, .3, 1)";
      add("title", [{ at: 0, o: 0, s: 1 }, { at: W }, { at: W + 0.8, o: 1, e: "linear" }, { at: cut, s: 1.04, e: "linear" }, { at: cut, o: 0, e: "step" }]);
      add("h1", [{ at: 0, o: 0, x: 0, y: 0, s: 1.04 }, { at: cut, o: 1, e: "step" }, { at: cut + 1.2, x: -3, y: -14, e: out }]);
      add("h2", [{ at: 0, o: 0, x: 0, y: 0, s: 1.04 }, { at: cut, o: 1, e: "step" }, { at: cut + 1.2, x: 3, y: 14, e: out }]);
      add("blade", [{ at: 0, o: 0, sx: 0 }, { at: cut - 0.06, o: 1, e: "step" }, { at: cut, sx: 1, e: "step" }, { at: cut + 0.7, o: 0, e: "linear" }]);
      enter("sub", "fade", cut + 1);
      return { tracks, flashes: [cut] };
    }

    case "seal":
      add("blot", [{ at: 0, o: 0, s: 0.1 }, { at: W }, { at: W + 0.25, o: 0.9, e: "linear" }, { at: W + 2, s: 1, e: t.ease }]);
      enter("title", "fade", W + 1);
      enter("sub", "fade", W + 1.8);
      add("seal", pop(t, { o: 0, s: 1.7, r: -14 }, "spring", W + 3, null, { r: -4 }));
      return { tracks, cam: shake(W + 3.1, 1.2) };
  }
}

/* ───────── Whole loop ───────── */

function generic(root: Element, t: Timing): Track[] {
  return [...root.querySelectorAll<HTMLElement>("[data-a]")].map((element): Track => {
    const at = Number(element.dataset.at ?? 0);
    const out = element.dataset.out === undefined ? null : Number(element.dataset.out);
    if (element.dataset.a === "scene") return [element, sceneKeys(t, at, out ?? BEATS)];
    if (element.dataset.a === "bar") return [element, [{ at: 0, sx: 0 }, { at }, { at: out ?? at + 4, sx: 1, e: "linear" }]];
    if (element.dataset.a === "gap") return [element, gapKeys(t, at, out ?? at + 4)];
    const preset = FROM[element.dataset.from ?? "up"] ?? FROM.up!;
    return [element, pop(t, preset.pose, preset.ease, at, out, REST[element.dataset.rest ?? ""])];
  });
}

/** Slow push-in on every shot; on soft DAs, one continuous move over the loop. */
function camera(t: Timing, format: DaFormat): Key[] {
  if (format === "site") return [{ at: 0, s: 1.1 }, { at: 2.4, s: 1, e: t.ease }, { at: BEATS, s: 1.04, e: "linear" }];
  if (t.soft) return [{ at: 0, s: 1 }, { at: BEATS, s: 1.1, e: "linear" }];
  return DA_SCENES.flatMap(({ at }): Key[] => [
    { at, s: 1, e: "step" },
    { at: at + 4, s: 1.05, e: "linear" },
  ]);
}

/** Pointer that reaches the CTA, presses it, and a ripple. */
function press(t: Timing, q: (key: string) => Element | null, keys: { cursor: string; button: string; ring: string }, at: number): Track[] {
  return [
    [
      q(keys.cursor),
      [
        { at: 0, o: 0, x: 380, y: 300, s: 1 },
        { at: at - 1 },
        { at: at - 0.7, o: 1, e: "linear" },
        { at, x: 0, y: 0, e: t.ease },
        { at: at + 0.12, s: 0.78, e: "linear" },
        { at: at + 0.45, s: 1, e: t.spring },
        { at: at + 1.6, o: 1 },
        { at: at + 1.9, o: 0, e: "linear" },
      ],
    ],
    [q(keys.button), [{ at: 0, s: 1 }, { at: at + 0.05 }, { at: at + 0.15, s: 0.93, e: "linear" }, { at: at + 0.6, s: 1, e: t.spring }]],
    [q(keys.ring), [{ at: 0, o: 0, s: 0.4 }, { at: at + 0.1 }, { at: at + 0.11, o: 0.9, e: "step" }, { at: at + 1, o: 0, s: 1.6, e: t.ease }]],
  ];
}

/** Creates every animation of the preview, all on the same start time. */
export function buildTimeline(root: HTMLElement, da: Da, format: DaFormat): Animation[] {
  const t = timing(da);
  const q = (key: string) => root.querySelector(`[data-k="${key}"]`);
  const plan = signaturePlan(t, root, q);
  const tracks: Track[] = [
    ...generic(root, t),
    ...plan.tracks,
    [q("cam"), camera(t, format)],
    [q("cam2"), plan.cam ?? [{ at: 0 }]],
    [q("flash"), flashKeys(plan.flashes ?? [])],
  ];

  if (format === "video") {
    tracks.push(...press(t, q, { cursor: "cur", button: "cta", ring: "ring" }, 14));
    tracks.push([q("heart"), [{ at: 0, s: 1 }, { at: 14.6 }, { at: 14.75, s: 1.4, e: "linear" }, { at: 15.3, s: 1, e: t.spring }]]);
  } else {
    tracks.push(...press(t, q, { cursor: "cur", button: "cta", ring: "ring" }, 13));
    tracks.push([
      q("page"),
      [{ at: 0, o: 0, y: 0 }, { at: 0.4, o: 1, e: "linear" }, { at: 14.6 }, { at: 15.6, y: -21, e: t.ease }, { at: 15.6 }, { at: BEATS, o: 0, e: "linear" }],
    ]);
  }

  const options: KeyframeAnimationOptions = { duration: t.loopMs, iterations: Infinity, fill: "both" };
  const animations = tracks.filter(([element]) => element).map(([element, keys]) => element!.animate(keyframes(keys), options));
  const start = document.timeline.currentTime;
  if (start !== null) for (const animation of animations) animation.startTime = start;
  return animations;
}

/** Beat shown when the preview is paused without having played (reduced motion, no JS). */
export const posterBeat = (format: DaFormat) => (format === "video" ? 6.2 : 10.5);
