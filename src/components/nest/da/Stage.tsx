import { Fragment, type ReactNode } from "react";
import type { Locale } from "@content/types";
import { cn } from "@/lib/cn";
import { chunkLine, parseLine, resolve, type Da, type DaFormat } from "./engine";
import { SceneArt } from "./scenes";
import { beatAttr, CAPTION_FROM, DA_SCENES, timing, type Timing } from "./timeline";

/**
 * The animated preview of a DA: a 9:16 social video or the hero of a website. Static markup only:
 * `data-a` / `data-at` / `data-out` say when each piece enters and leaves, `data-k` names the pieces
 * of the signature scene, and timeline.ts animates them. The whole preview is decorative
 * (aria-hidden): the generator describes it in text next to it.
 */

export interface StageLabels {
  safeTop: string;
  safeBottom: string;
  more: string;
  code: string;
}

interface StageProps {
  da: Da;
  format: DaFormat;
  locale: Locale;
  safe: boolean;
  labels: StageLabels;
}

/* ───────── Fitting long words ───────── */

const sides = (element: Element) => {
  const style = getComputedStyle(element);
  return parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
};

/** Width of an element's content box. */
const inner = (element: HTMLElement) => {
  const style = getComputedStyle(element);
  return element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
};

/**
 * A long word in a wide display face can be wider than a 9:16 frame. Each `data-fit` box gets a
 * `--fit` factor (at most 1) that the CSS multiplies into the font size of the text it names
 * (`data-fit=".sig-title"`) or of its own text (`data-fit=""`). The room is the box's content width,
 * less the padding of the wrappers in between, or the width of the nearest `data-fit-room` wrapper
 * (a box whose width does not follow its text); a box that fits its own text compares its scroll
 * width (an ellipsis does not hide the overflow from it). Text is measured without transforms, so
 * this runs before the timeline is built. `root` itself can be a box. Returns false when the root
 * has no size (hidden).
 */
export function fitStage(root: HTMLElement): boolean {
  if (!root.offsetWidth) return false;
  const boxes = [root, ...root.querySelectorAll<HTMLElement>("[data-fit]")].filter((box) => box.hasAttribute("data-fit"));
  for (const box of boxes) box.style.removeProperty("--fit");
  const range = document.createRange();
  const factors = boxes.map((box) => {
    const targets = box.dataset.fit ? [...box.querySelectorAll<HTMLElement>(box.dataset.fit)] : [box];
    let factor = 1;
    for (const target of targets) {
      let room = inner(box);
      let width = target.scrollWidth - (target.clientWidth - room);
      if (target !== box) {
        range.selectNodeContents(target);
        const rects = [...range.getClientRects()].filter((rect) => rect.width > 0);
        if (!rects.length) continue;
        width = Math.max(...rects.map((rect) => rect.right)) - Math.min(...rects.map((rect) => rect.left));
        let reserve = sides(target);
        room = target.hasAttribute("data-fit-room") ? inner(target) : Number.NaN;
        for (let node = target.parentElement; Number.isNaN(room) && node && node !== box; node = node.parentElement) {
          if (node.hasAttribute("data-fit-room")) room = inner(node) - reserve;
          reserve += sides(node);
        }
        if (Number.isNaN(room)) room = inner(box) - reserve;
      }
      if (width > room && room > 0) factor = Math.min(factor, room / width);
    }
    return factor;
  });
  boxes.forEach((box, index) => {
    const factor = factors[index]!;
    if (factor < 1) box.style.setProperty("--fit", Math.max(0.35, factor * 0.97).toFixed(3));
  });
  return true;
}

/* ───────── Small drawings ───────── */

const Cursor = () => (
  <svg viewBox="0 0 16 20" aria-hidden="true" focusable="false">
    <path d="M1 1v15.5l4.2-3.8 2.9 6.3 2.8-1.3-2.9-6.2 5.8-.4z" fill="#fff" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICONS = {
  heart: "M12 20.5s-7.5-4.6-7.5-10.3A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.8c0 5.7-7.5 10.3-7.5 10.3z",
  bubble: "M12 4c4.7 0 8.5 3.1 8.5 7s-3.8 7-8.5 7c-1 0-2-.1-2.9-.4L4.5 19.5l1.3-3.6C4.4 14.6 3.5 12.9 3.5 11c0-3.9 3.8-7 8.5-7z",
  share: "M13.5 5.5 20 11.5l-6.5 6v-3.6c-4.6 0-7.4 1.3-9.5 4.6.6-4.9 3.3-8.6 9.5-9.4z",
  note: "M9 17.5a2.5 2.5 0 1 1-1.5-2.3V5.5l9-2v11a2.5 2.5 0 1 1-1.5-2.3V7.3l-6 1.4z",
  star: "M12 2.8l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.6l-5.6 3.3 1.4-6.3L3 9.3l6.4-.6z",
  up: "M6 14l6-6 6 6",
} as const;

function Glyph({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {name === "up" ? (
        <path d={ICONS.up} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d={ICONS[name]} fill="currentColor" />
      )}
    </svg>
  );
}

/* ───────── Captions ───────── */

/** Social captions: 2 to 4 words at a time, word by word, one highlighted word. */
function Caption({ line, w0, w1, t, small }: { line: string; w0: number; w1: number; t: Timing; small?: boolean }) {
  const chunks = chunkLine(parseLine(line), t.caption === "wide" ? 4 : 3);
  const span = (w1 - w0) / chunks.length;
  const from = CAPTION_FROM[t.caption];
  const whole = t.caption === "bar";
  return (
    <div className={cn("cap-slot", small && "s")} data-fit=".cap">
      {chunks.map((words, index) => {
        const c0 = w0 + index * span;
        const c1 = index === chunks.length - 1 ? w1 : c0 + span;
        const timed = (at: number) => ({ "data-a": "pop", "data-from": from, "data-at": beatAttr(at), "data-out": beatAttr(c1) });
        return (
          <p key={index} className={`cap cap-${t.caption}`} data-fit-room="" {...(whole ? timed(c0) : {})}>
            {words.map((word, position) => (
              <Fragment key={position}>
                {position > 0 && " "}
                <span className={word.hl ? "hl" : undefined} {...(whole ? {} : timed(c0 + position * t.staggerB))}>
                  {word.text}
                </span>
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/* ───────── Demo card (scene 2) ───────── */

function DemoCard({ da, locale, at }: { da: Da; locale: Locale; at: number }) {
  const { card, id } = da.universe;
  const tilt = id === "terminal";
  return (
    <div className="dcard" data-a="pop" data-from={tilt ? "tilt" : "card"} data-rest={tilt ? "tilted" : undefined} data-at={beatAttr(at)}>
      <div className="dcard-h">
        <span className="dcard-dots">
          <i />
          <i />
          <i />
        </span>
        <b className="dcard-t" data-fit="">
          {card.title[locale]}
        </b>
        <span className="dcard-m" data-a="pop" data-from="far" data-at={beatAttr(at + 1.8)}>
          {card.meta[locale]}
        </span>
      </div>
      <ul className="dcard-l">
        {card.rows[locale].map((row, index) => (
          <li key={row} data-a="pop" data-from="rise" data-at={beatAttr(at + 0.6 + index * 0.45)}>
            <i className="dcard-ck" />
            {row}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── Signature (scene 3) ───────── */

function Signature({ da, locale, t }: { da: Da; locale: Locale; t: Timing }) {
  const universe = da.universe;
  const title = universe.sig.title[locale];
  const sub = universe.sig.sub[locale];
  const titleAs = (k = "title", className?: string) => (
    <p className={cn("sig-title", className)} data-k={k}>
      {title}
    </p>
  );
  const Sub = <p className="sig-sub" data-k="sub">{sub}</p>;
  const root = (children: ReactNode) => (
    <div className={`sig sig-${t.signature}`} data-fit=".sig-title">
      {children}
    </div>
  );

  switch (t.signature) {
    case "freeze":
      return root(
        <>
          <span className="sig-pause" data-k="pause">
            <i />
            <i />
          </span>
          <div className="sig-card" data-k="card">
            <div className="sig-card-in">
              {titleAs()}
              {Sub}
            </div>
          </div>
        </>,
      );
    case "phonk":
      return root(
        <div className="sig-shake" data-k="shake">
          <div className="sig-stack">
            {titleAs("ca", "sig-ca")}
            {titleAs("cb", "sig-cb")}
            {titleAs()}
          </div>
          {Sub}
        </div>,
      );
    case "bubble": {
      const words = title.split(" ");
      return root(
        <>
          <p className="sig-title">
            {words.map((word, index) => (
              <Fragment key={index}>
                {index > 0 && " "}
                <span className={cn("sig-w", index === words.length - 1 && "hl")} data-k="w">
                  {index === words.length - 1 && <i className="sig-hlbg" data-k="hlbg" />}
                  <span>{word}</span>
                  {index === words.length - 1 && (
                    <>
                      <i className="sig-ring" data-k="sring" />
                      <span className="sig-cursor" data-k="cursor">
                        <Cursor />
                      </span>
                    </>
                  )}
                </span>
              </Fragment>
            ))}
          </p>
          {Sub}
        </>,
      );
    }
    case "zoom":
      return root(
        <>
          <div className="sig-shade" data-k="shade" />
          <div className="sig-zoomer" data-k="zoomer">
            <div className="sig-win" data-k="win">
              <div className="sig-win-h">
                <i />
                <i />
                <i />
                <span>{universe.card.title[locale]}</span>
              </div>
              <div className="sig-win-b">
                <span className="ln a" />
                <span className="ln" />
                <span className="sig-detail">
                  {sub}
                  <i className="sig-focus" data-k="focus" />
                </span>
                <span className="ln s" />
              </div>
            </div>
          </div>
          <p className="sig-title sig-low" data-k="title" data-fit-room="">
            {title}
          </p>
        </>,
      );
    case "reveal":
      return root(
        <>
          <div className="sig-shade" data-k="shade" />
          <p className="sig-title">
            {[...title].map((char, index) => (
              <span key={index} data-k="l">
                {char === " " ? " " : char}
              </span>
            ))}
          </p>
          {Sub}
        </>,
      );
    case "clash":
      return root(
        <>
          <i className="sig-pa" data-k="pa" />
          <i className="sig-pb" data-k="pb" />
          <span className="sig-vs" data-k="vs">
            VS
          </span>
          <div className="sig-t">
            {titleAs()}
            {Sub}
          </div>
        </>,
      );
    case "vhs":
      return root(
        <>
          <span className="sig-osd" data-k="osd">
            <i />
            PLAY
          </span>
          <div className="sig-jump" data-k="jump">
            {titleAs()}
            {Sub}
          </div>
          <span className="sig-stamp">SP 00:03:15</span>
          <i className="sig-band" data-k="band" />
        </>,
      );
    case "flicker":
      return root(
        <>
          <div className="sig-shade" data-k="shade" />
          <div className="sig-t">
            {titleAs()}
            {Sub}
          </div>
        </>,
      );
    case "gloss":
      return root(
        <>
          {[0, 1, 2, 3].map((index) => (
            <i key={index} className={`sig-b b${index}`} data-k="b" />
          ))}
          <div className="sig-glass">
            {titleAs()}
            <i className="sig-sweep" data-k="sweep" />
          </div>
          {Sub}
        </>,
      );
    case "corrupt":
      return root(
        <>
          <div className="sig-stack">
            {titleAs()}
            {[0, 1, 2].map((index) => (
              <p key={index} className={`sig-title sig-slice s${index}`} data-k="slice">
                {title}
              </p>
            ))}
          </div>
          {Sub}
        </>,
      );
    case "boomerang":
      return root(
        <>
          {[0, 1, 2, 3].map((index) => (
            <i key={index} className={`sig-spark k${index}`} data-k="spark" />
          ))}
          {titleAs()}
          <p className="sig-sub sig-tag" data-k="sub">
            {sub}
          </p>
        </>,
      );
    case "sticker":
      return root(
        <>
          {titleAs()}
          <span className="sig-st st1" data-k="st1">
            {sub}
          </span>
          <span className="sig-st st2" data-k="st2">
            <Glyph name="heart" />
          </span>
          <span className="sig-st st3" data-k="st3">
            <Glyph name="star" />
          </span>
          <span className="sig-up" data-k="up">
            <Glyph name="up" />
            {universe.cta[locale]}
          </span>
        </>,
      );
    case "slam":
      return root(
        <>
          <div className="sig-slab a" data-k="slabA" data-fit-room="">
            <i className="sig-rule" data-k="rule" />
            <p className="sig-title">{title}</p>
            <p className="sig-sub">{sub}</p>
          </div>
          <div className="sig-black" data-k="black" />
          <div className="sig-slab b" data-k="slabB" data-fit-room="">
            <p className="sig-title">{universe.card.meta[locale]}</p>
            <p className="sig-sub">{universe.card.rows[locale][1]}</p>
          </div>
        </>,
      );
    case "echo":
      return root(
        <>
          <i className="sig-obj o1" data-k="obj" />
          <i className="sig-obj o2" data-k="obj" />
          <div className="sig-stack">
            {titleAs("ea", "sig-ea")}
            {titleAs("eb", "sig-eb")}
            {titleAs()}
          </div>
          {Sub}
        </>,
      );
    case "slash":
      return root(
        <>
          <div className="sig-stack">
            {titleAs()}
            {titleAs("h1", "sig-h1")}
            {titleAs("h2", "sig-h2")}
            <i className="sig-blade" data-k="blade" />
          </div>
          {Sub}
        </>,
      );
    case "seal":
      return root(
        <>
          <i className="sig-blot" data-k="blot" />
          <div className="sig-t">
            {titleAs()}
            {Sub}
          </div>
          <span className="sig-hanko" data-k="seal">
            <span>{universe.card.meta[locale]}</span>
          </span>
        </>,
      );
  }
}

/* ───────── Shared layers ───────── */

function Texture({ da }: { da: Da }) {
  const { texture, grain } = resolve(da);
  return (
    <>
      {texture !== "grain" && <i className={`tx tx-${texture}`} />}
      <i className="tx tx-grain" style={{ opacity: texture === "grain" ? grain * 1.8 : grain }} />
    </>
  );
}

/** Camera (base push-in) and signature camera, around the scene art. */
function Camera({ da, className }: { da: Da; className: string }) {
  return (
    <div className={className} data-k="cam">
      <div className="cam2" data-k="cam2">
        <SceneArt universe={da.universe.id} className="art" />
      </div>
    </div>
  );
}

function social(da: Da, locale: Locale) {
  const seed = parseInt(da.code.slice(3), 36) || 7;
  const number = (value: number, digits = 0) => value.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: digits });
  return { likes: `${number(12 + (seed % 880) / 10, 1)} k`, comments: number(120 + (seed % 700)), shares: number(40 + (seed % 300)) };
}

/* ───────── 9:16 video ───────── */

function Video({ da, locale, safe, labels }: Omit<StageProps, "format">) {
  const t = timing(da);
  const { layout, motion, hookIndex } = resolve(da);
  const universe = da.universe;
  const hooks = universe.hooks[locale];
  const counts = social(da, locale);
  const sound = universe.sound[locale][0]!;

  return (
    <div className="da-frame da-video" data-vl={layout.video} data-u={universe.id} data-sig={t.signature}>
      <Camera da={da} className="v-cam" />
      {layout.video === "split" && (
        <div className="v-react">
          <i className="v-face" />
        </div>
      )}
      <i className="v-desat" data-k="desat" />

      <div className="v-scene" data-a="scene" data-at="0" data-out="4">
        <Caption line={hooks[hookIndex]!} w0={0.15} w1={4} t={t} />
      </div>
      <div className="v-scene poster" data-a="scene" data-at="4" data-out="8">
        <div className="v-card">
          <DemoCard da={da} locale={locale} at={4} />
        </div>
        <Caption line={hooks[(hookIndex + 1) % hooks.length]!} w0={4.7} w1={8} t={t} small />
      </div>
      <div className="v-scene s3" data-a="scene" data-at="8" data-out="12">
        <Signature da={da} locale={locale} t={t} />
      </div>
      <div className="v-scene" data-a="scene" data-at="12" data-out="16">
        <div className="v-end" data-fit=".end-name">
          <p className="end-k" data-a="pop" data-from="rise" data-at="12.15">
            {universe.keywords[locale].slice(0, 3).join(" · ")}
          </p>
          <p className="end-name" data-a="pop" data-from={CAPTION_FROM[t.caption]} data-at="12.4">
            {universe.name[locale]}
          </p>
          <div className="end-cta-w" data-a="pop" data-from="up" data-at="12.9">
            <span className="end-cta" data-k="cta">
              {universe.cta[locale]}
              <Arrow />
              <i className="end-ring" data-k="ring" />
            </span>
            <span className="end-cur" data-k="cur">
              <Cursor />
            </span>
          </div>
          <p className="end-code" data-a="pop" data-from="fade" data-at="13.3">
            {labels.code} {da.code} · {motion.name[locale]}
          </p>
        </div>
      </div>

      <i className="v-inv" data-k="inv" />
      {layout.video === "letterbox" && (
        <>
          <i className="v-lb t" />
          <i className="v-lb b" />
        </>
      )}

      <Texture da={da} />
      <div className="v-ui">
        <div className="v-prog">
          {DA_SCENES.map((scene) => (
            <i key={scene.id}>
              <b data-a="bar" data-at={scene.at} data-out={scene.at + 4} />
            </i>
          ))}
        </div>
        <div className="v-rail">
          <span className="v-av">{universe.name[locale].charAt(0)}</span>
          <span className="v-ic">
            <span data-k="heart">
              <Glyph name="heart" />
            </span>
            <small>{counts.likes}</small>
          </span>
          <span className="v-ic">
            <Glyph name="bubble" />
            <small>{counts.comments}</small>
          </span>
          <span className="v-ic">
            <Glyph name="share" />
            <small>{counts.shares}</small>
          </span>
        </div>
        <div className="v-meta">
          <b>@da.{universe.id}</b>
          <p>
            {universe.name[locale]} · {da.code}
          </p>
          <p className="v-snd">
            <Glyph name="note" />
            <span className="v-mq">
              <span>
                {sound} · {sound} ·
              </span>
            </span>
          </p>
        </div>
      </div>

      <i className="v-flash" data-k="flash" />
      {safe && (
        <div className="v-safe">
          <span className="top">{labels.safeTop}</span>
          <span className="bot">{labels.safeBottom}</span>
        </div>
      )}
    </div>
  );
}

/* ───────── Website hero ───────── */

function Site({ da, locale, labels }: Omit<StageProps, "format" | "safe">) {
  const t = timing(da);
  const { layout, hookIndex } = resolve(da);
  const universe = da.universe;
  const words = parseLine(universe.hooks[locale][hookIndex]!);
  const from = CAPTION_FROM[t.caption];
  const keywords = universe.keywords[locale];
  // Full-bleed layouts hand the whole hero to the signature for four beats.
  const takeover = layout.site === "center" || layout.site === "poster";
  const gap = takeover ? { "data-a": "gap", "data-at": "8", "data-out": "12" } : {};

  return (
    <div className="da-frame da-site" data-sl={layout.site} data-u={universe.id} data-sig={t.signature} data-cap={t.caption}>
      <div className="s-bar">
        <span className="s-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="s-url">{universe.id}.example</span>
      </div>
      <div className="s-view">
        <div className="s-page" data-k="page">
          <nav className="s-nav" data-a="pop" data-from="fade" data-at="0.2">
            <span className="s-logo">
              <i />
              {universe.name[locale]}
            </span>
            <span className="s-links">
              {keywords.slice(0, 3).map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </span>
            <span className="s-navcta">{universe.cta[locale]}</span>
          </nav>
          <section className="s-hero">
            <div className="s-media">
              <Camera da={da} className="s-cam" />
              <i className="v-desat" data-k="desat" />
              <i className="s-scrim" {...gap} />
              <div className="s-sig" data-a="scene" data-at="8" data-out={takeover ? "12" : "16"}>
                <Signature da={da} locale={locale} t={t} />
              </div>
              <i className="v-inv" data-k="inv" />
              <i className="v-flash" data-k="flash" />
            </div>
            <div className="s-copy" data-fit=".s-h" {...gap}>
              <p className="s-kick" data-a="pop" data-from="rise" data-at="0.35">
                {keywords.slice(3, 6).join(" · ")}
              </p>
              <p className="s-h">
                {words.map((word, index) => (
                  <Fragment key={index}>
                    {index > 0 && " "}
                    <span className={word.hl ? "hl" : undefined} data-a="pop" data-from={from} data-at={beatAttr(0.6 + index * Math.max(t.staggerB, 0.12))}>
                      {word.text}
                    </span>
                  </Fragment>
                ))}
              </p>
              <p className="s-sub" data-a="pop" data-from="rise" data-at="1.7">
                {universe.why[locale]}
              </p>
              <div className="s-ctas">
                <span className="s-cta-w" data-a="pop" data-from="up" data-at="2.1">
                  <span className="s-cta" data-k="cta">
                    {universe.cta[locale]}
                    <Arrow />
                    <i className="end-ring" data-k="ring" />
                  </span>
                  <span className="end-cur" data-k="cur">
                    <Cursor />
                  </span>
                </span>
                <span className="s-cta2" data-a="pop" data-from="up" data-at="2.35">
                  {labels.more}
                </span>
              </div>
            </div>
            <div className="s-card" {...gap}>
              <DemoCard da={da} locale={locale} at={4} />
            </div>
          </section>
          <section className="s-feats">
            {universe.card.rows[locale].map((row, index) => (
              <div key={row} className="s-feat" data-a="pop" data-from="rise" data-at={beatAttr(14.9 + index * 0.25)}>
                <i />
                <b>{row}</b>
                <span>{keywords[index]}</span>
              </div>
            ))}
          </section>
        </div>
        <Texture da={da} />
      </div>
    </div>
  );
}

export function Stage({ da, format, locale, safe, labels }: StageProps) {
  return format === "video" ? <Video da={da} locale={locale} safe={safe} labels={labels} /> : <Site da={da} locale={locale} labels={labels} />;
}
