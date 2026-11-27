"use client";

import { useLocale } from "next-intl";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { daUniverses, type DaUniverse } from "@content/da";
import type { Locale } from "@content/types";
import { CopyAction } from "@/components/news/CopyAction";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/media";
import { Board } from "./da/Board";
import { daStyle, decode, initialDa, loopSeconds, resolve, rollDa, type Da, type DaFacet, type DaFormat } from "./da/engine";
import { ExportPanel } from "./da/ExportPanel";
import { daFontVariables } from "./da/fonts";
import { fitStage, Stage } from "./da/Stage";
import { BEATS, buildTimeline, DA_SCENES, posterBeat, timing, type DaSceneId } from "./da/timeline";
import { useNestMessages } from "./use-nest-messages";

/**
 * Nid experiment 07: the art-direction generator. A roll picks a palette, a type pairing, a texture,
 * a motion signature and a layout in one of eight universes; the preview plays the DA as a 9:16
 * social video or as a website hero, and the board and exports give every value behind it.
 * A DA travels as a code in the URL (`#da=HW-0K7`).
 */

const INITIAL = initialDa();

/** Puts every animation of the timeline at the same time (in ms). */
const setTime = (list: readonly Animation[], ms: number) => {
  for (const animation of list) animation.currentTime = ms;
};

/** One of the other universes, at random (for "Surprise"). */
const otherUniverse = (current: DaUniverse): DaUniverse => {
  const others = daUniverses.filter((universe) => universe.id !== current.id);
  return others[Math.floor(Math.random() * others.length)]!;
};

const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};

function Dice() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="12" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="5.6" cy="5.6" r="1.1" fill="currentColor" />
      <circle cx="10.4" cy="10.4" r="1.1" fill="currentColor" />
      <circle cx="8" cy="8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M8 1.5c.5 3.4 2.4 5.6 6.5 6.5-4.1.9-6 3.1-6.5 6.5-.5-3.4-2.4-5.6-6.5-6.5C5.6 7.1 7.5 4.9 8 1.5z" fill="currentColor" />
    </svg>
  );
}

function PlayPause({ paused }: { paused: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {paused ? <path d="M4.5 2.8v10.4l8.5-5.2z" fill="currentColor" /> : <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" />}
    </svg>
  );
}

function Replay() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5M4.6 1.8v2.9h2.9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DaGeneratorLab() {
  const t = useNestMessages("da");
  const locale = useLocale() as Locale;
  const reduced = usePrefersReducedMotion();
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => "");

  // A DA shared by link seeds the generator. Rolls and the format choice take over, until another DA link
  // arrives (a link pasted in the same tab only changes the hash); any other hash keeps them.
  const shared = useMemo(() => {
    const code = /[#&]da=([a-z0-9]{2}-[a-z0-9]{1,5})/i.exec(hash)?.[1];
    const da = code ? decode(code) : null;
    return da ? { da, format: (/[#&]f=site/.test(hash) ? "site" : "video") as DaFormat } : null;
  }, [hash]);

  const seed = shared ? `${shared.da.code}|${shared.format}` : null;
  const [own, setOwn] = useState<{ seed: string | null; da?: Da; format?: DaFormat }>({ seed: null });
  const mine = seed === null || own.seed === seed ? own : null;
  const [locks, setLocks] = useState<ReadonlySet<DaFacet>>(() => new Set());
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [safe, setSafe] = useState(false);
  const [announce, setAnnounce] = useState("");
  // Bumped when web fonts arrive: the titles are measured again with the real faces.
  const [fonts, setFonts] = useState(0);

  const da = mine?.da ?? shared?.da ?? INITIAL;
  const format = mine?.format ?? shared?.format ?? "video";
  const paused = userPaused ?? reduced;
  const time = useMemo(() => timing(da), [da]);
  const { palette, type, motion, layout, hookIndex } = resolve(da);

  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const seek = useRef<HTMLInputElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const scenes = useRef<(HTMLButtonElement | null)[]>([]);
  const animations = useRef<Animation[]>([]);
  const state = useRef({ paused, visible: true, poster: true, beatMs: time.beatMs, frame: 0, shown: "", key: "", resume: -1 });
  const beatText = useRef((n: number, scene: DaSceneId) => `${n} · ${scene}`);

  // The readout is written outside React (every frame): it reads the current wording from a ref.
  useLayoutEffect(() => {
    beatText.current = (n, scene) => t("beat", { n, scene: t(`scenes.${scene}`) });
  });

  /** Moves the readout, the slider and the active scene to the current time. */
  const paint = useCallback(() => {
    const first = animations.current[0];
    if (!first) return;
    const ms = Number(first.currentTime ?? 0) % (state.current.beatMs * BEATS);
    const beat = ms / state.current.beatMs;
    const scene = [...DA_SCENES].reverse().find((item) => beat >= item.at) ?? DA_SCENES[0]!;
    if (seek.current && document.activeElement !== seek.current) seek.current.value = String(Math.round(beat * 10));
    const shown = `${Math.floor(beat) + 1}|${scene.id}`;
    if (shown === state.current.shown) return;
    state.current.shown = shown;
    const text = beatText.current(Math.floor(beat) + 1, scene.id);
    if (readout.current) readout.current.textContent = text;
    if (seek.current) seek.current.setAttribute("aria-valuetext", text);
    scenes.current.forEach((button, index) => button?.classList.toggle("on", DA_SCENES[index]!.id === scene.id));
  }, []);

  const tick = useCallback(() => {
    cancelAnimationFrame(state.current.frame);
    const loop = () => {
      paint();
      if (!state.current.paused && state.current.visible) state.current.frame = requestAnimationFrame(loop);
    };
    state.current.frame = requestAnimationFrame(loop);
  }, [paint]);

  const seekTo = useCallback(
    (beat: number) => {
      setTime(animations.current, beat * state.current.beatMs);
      state.current.shown = "";
      paint();
    },
    [paint],
  );

  /** Plays or pauses every animation: paused by the visitor, by reduced motion, or out of view. */
  const sync = useCallback(() => {
    const run = !state.current.paused && state.current.visible;
    // A pause also stops the CSS loops of the preview and the board (WCAG 2.2.2).
    root.current?.toggleAttribute("data-paused", state.current.paused);
    for (const animation of animations.current) {
      if (run) animation.play();
      else animation.pause();
    }
    if (run) tick();
  }, [tick]);

  // New DA, format or fonts: fit the long words, then rebuild the timeline before paint (the old one
  // is cancelled). The same DA rebuilt for new fonts carries on from where it was.
  useLayoutEffect(() => {
    const element = stage.current;
    if (!element || typeof element.animate !== "function") return;
    const current = state.current;
    const key = `${da.code}|${format}`;
    const resume = current.key === key ? current.resume : -1;
    current.key = key;
    current.beatMs = timing(da).beatMs;
    fitStage(element);
    const list = buildTimeline(element, da, format);
    animations.current = list;
    root.current?.setAttribute("data-live", "");
    if (current.paused) {
      for (const animation of list) animation.pause();
      seekTo(resume >= 0 ? resume : posterBeat(format));
    } else {
      if (resume >= 0) seekTo(resume);
      sync();
    }
    current.shown = "";
    paint();
    return () => {
      current.resume = (Number(list[0]?.currentTime ?? 0) / current.beatMs) % BEATS;
      for (const animation of list) animation.cancel();
      animations.current = [];
    };
  }, [da, format, fonts, paint, seekTo, sync]);

  useEffect(() => {
    const faces = document.fonts;
    if (!faces) return;
    const measure = () => setFonts((n) => n + 1);
    faces.addEventListener("loadingdone", measure);
    return () => faces.removeEventListener("loadingdone", measure);
  }, []);

  useEffect(() => {
    state.current.paused = paused;
    if (paused && state.current.poster) seekTo(posterBeat(format));
    sync();
  }, [paused, format, seekTo, sync]);

  // Out of view, nothing runs.
  useEffect(() => {
    const element = stage.current;
    const current = state.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      current.visible = Boolean(entry?.isIntersecting);
      sync();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(current.frame);
    };
  }, [sync]);

  // Opened from a shared link: bring the generator into view.
  useEffect(() => {
    if (shared) root.current?.scrollIntoView({ block: "start" });
  }, [shared]);

  const describe = (next: Da) => {
    const r = resolve(next);
    return t("announce", {
      code: next.code,
      universe: next.universe.name[locale],
      palette: r.palette.name[locale],
      type: r.type.name[locale],
      motion: r.motion.name[locale],
      layout: r.layout.name[locale],
    });
  };

  const show = (next: Da) => {
    state.current.poster = true;
    setOwn({ seed, da: next, format: mine?.format });
    setAnnounce(describe(next));
  };

  const generate = () => show(rollDa(da.universe, da.pick, locks));

  const pickUniverse = (universe: DaUniverse) => {
    if (universe.id === da.universe.id) return generate();
    setLocks(new Set());
    show(rollDa(universe, null, new Set()));
  };

  const surprise = () => {
    setLocks(new Set());
    show(rollDa(otherUniverse(da.universe), null, new Set()));
  };

  const toggleLock = (facet: DaFacet) =>
    setLocks((current) => {
      const next = new Set(current);
      if (next.has(facet)) next.delete(facet);
      else next.add(facet);
      return next;
    });

  const togglePlay = () => {
    state.current.poster = false;
    setUserPaused(!paused);
  };

  const restart = () => {
    state.current.poster = false;
    seekTo(0);
    setUserPaused(false);
  };

  const jump = (at: number) => {
    state.current.poster = false;
    seekTo(paused ? at + 2.2 : at);
  };

  const link = () => {
    const { origin, pathname, search } = window.location;
    return `${origin}${pathname}${search}#da=${da.code}${format === "site" ? "&f=site" : ""}`;
  };

  const formatName = format === "video" ? t("video") : t("site");
  const hook = da.universe.hooks[locale][hookIndex]!.replace(/\*/g, "");

  return (
    <div ref={root} className={cn("lab-da", daFontVariables)} style={daStyle(da) as CSSProperties}>
      <div className="da-top">
        <div className="da-unis" role="group" aria-label={t("universes")}>
          {daUniverses.map((universe) => (
            <button
              key={universe.id}
              type="button"
              className="chip"
              aria-pressed={universe.id === da.universe.id}
              style={{ "--c": universe.palettes[0]!.colors.accent } as CSSProperties}
              onClick={() => pickUniverse(universe)}
            >
              <i aria-hidden="true" />
              {universe.name[locale]}
            </button>
          ))}
        </div>
        <div className="da-ctl">
          <div className="da-seg" role="group" aria-label={t("format")}>
            {(["video", "site"] as const).map((value) => (
              <button key={value} type="button" aria-pressed={format === value} onClick={() => setOwn({ seed, da: mine?.da, format: value })}>
                <i className={`fmt ${value}`} aria-hidden="true" />
                {t(value)}
              </button>
            ))}
          </div>
          <button type="button" className="da-go" onClick={generate}>
            <Dice />
            {t("generate")}
          </button>
          <button type="button" className="da-sur" onClick={surprise} aria-label={t("surpriseLabel")}>
            <Sparkle />
            {t("surprise")}
          </button>
          <p className="da-id">
            <span>{t("code")}</span>
            <output>{da.code}</output>
          </p>
          <CopyAction source={{ text: link }} label={t("copyLink")} copiedLabel={t("linkCopied")} ariaLabel={t("copyLinkLabel", { code: da.code })} className="da-link" />
        </div>
      </div>
      <p className="sr" role="status">
        {announce}
      </p>

      <div className="da-main">
        <div className="da-stagecol">
          <div className={cn("da-stage night", format)}>
            <div ref={stage} className="da-stage-in" aria-hidden="true">
              <Stage
                da={da}
                format={format}
                locale={locale}
                safe={safe}
                labels={{ safeTop: t("safeTop"), safeBottom: t("safeBottom"), more: t("more"), code: t("code") }}
              />
            </div>
            <p className="sr">
              {t("describe", {
                format: formatName,
                s: loopSeconds(motion.bpm).toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 1 }),
                hook,
                card: da.universe.card.title[locale],
                motion: motion.name[locale],
                title: da.universe.sig.title[locale],
                cta: da.universe.cta[locale],
              })}
            </p>
          </div>

          <div className="da-tr">
            <div className="tr-row">
              <button type="button" className="tr-btn main" onClick={togglePlay}>
                <PlayPause paused={paused} />
                {paused ? t("play") : t("pause")}
              </button>
              <button type="button" className="tr-btn" onClick={restart}>
                <Replay />
                {t("restart")}
              </button>
              <label className="tr-seek">
                <span className="sr">{t("seek")}</span>
                <input
                  ref={seek}
                  type="range"
                  min={0}
                  max={BEATS * 10 - 1}
                  step={1}
                  defaultValue={Math.round(posterBeat(format) * 10)}
                  onInput={(event) => {
                    state.current.poster = false;
                    seekTo(Number(event.currentTarget.value) / 10);
                  }}
                />
              </label>
              {format === "video" && (
                <button type="button" className="tr-btn" aria-pressed={safe} onClick={() => setSafe(!safe)}>
                  <i className="tr-safe" aria-hidden="true" />
                  {t("safe")}
                </button>
              )}
            </div>
            <div className="tr-scenes">
              {DA_SCENES.map((scene, index) => (
                <button
                  key={scene.id}
                  ref={(element) => {
                    scenes.current[index] = element;
                  }}
                  type="button"
                  aria-label={t("jump", { scene: t(`scenes.${scene.id}`) })}
                  onClick={() => jump(scene.at)}
                >
                  <b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b>
                  {t(`scenes.${scene.id}`)}
                </button>
              ))}
              <span ref={readout} className="tr-read" aria-hidden="true" />
            </div>
            <p className="tr-meta">
              {motion.bpm} BPM · {t("loop", { s: loopSeconds(motion.bpm).toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 1 }) })} ·{" "}
              {palette.name[locale]} · {type.name[locale]} · {layout.name[locale]}
            </p>
          </div>
        </div>

        <Board da={da} locale={locale} locks={locks} onLock={toggleLock} t={t} />
      </div>

      <ExportPanel da={da} format={format} locale={locale} t={t} />
      <p className="da-legal">{t("legal")}</p>
    </div>
  );
}
