"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { DA_ROLES, daTextures, type DaRole, type DaTypeRole } from "@content/da";
import type { Locale } from "@content/types";
import { writeClipboard } from "@/components/news/CopyAction";
import { cn } from "@/lib/cn";
import { contrast, contrastGrade, loopSeconds, resolve, springCurve, type Da, type DaFacet } from "./engine";
import { CAPTION_NAME } from "./exports";
import { DA_FONTS } from "./fonts";
import { fitStage } from "./Stage";

export type DaTranslator = (key: string, values?: Record<string, string | number>) => string;

interface BoardProps {
  da: Da;
  locale: Locale;
  locks: ReadonlySet<DaFacet>;
  onLock: (facet: DaFacet) => void;
  t: DaTranslator;
}

const ROLE_VAR: Record<DaRole, string> = {
  bg: "--da-bg",
  surface: "--da-surface",
  ink: "--da-ink",
  accent: "--da-accent",
  accent2: "--da-accent-2",
  glow: "--da-glow",
};

function Lock({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d={open ? "M5.5 7V5a2.5 2.5 0 0 1 4.9-.6" : "M5.5 7V5a2.5 2.5 0 0 1 5 0v2"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Facet({
  facet,
  option,
  locks,
  onLock,
  t,
  className,
  children,
}: {
  facet: DaFacet;
  option: string;
  locks: ReadonlySet<DaFacet>;
  onLock: (facet: DaFacet) => void;
  t: DaTranslator;
  className?: string;
  children: ReactNode;
}) {
  const locked = locks.has(facet);
  const name = t(`facets.${facet}`);
  return (
    <section className={cn("db-f", locked && "kept", className)} aria-label={name}>
      <header className="db-fh">
        <h3 className="db-t">
          <span className="db-k">{name}</span>
          <b>{option}</b>
        </h3>
        <button type="button" className="db-lock" aria-pressed={locked} aria-label={t("keepFacet", { facet: name })} onClick={() => onLock(facet)}>
          <Lock open={!locked} />
          <span>{t("keep")}</span>
        </button>
      </header>
      {children}
    </section>
  );
}

const fontLine = (role: DaTypeRole, t: DaTranslator) =>
  [`${DA_FONTS[role.font].name} ${role.weight}`, role.upper ? t("upper") : null, role.width && role.width !== 100 ? t("width", { n: role.width }) : null]
    .filter(Boolean)
    .join(" · ");

/** Spring position over time, from its integration, with the target line at 1. */
function SpringChart({ values, peak }: { values: number[]; peak: number }) {
  const top = Math.max(peak, 1.05);
  const y = (value: number) => 74 - (value / top) * 60;
  const points = values.map((value, index) => `${((index / (values.length - 1)) * 100).toFixed(2)},${y(value).toFixed(2)}`);
  return (
    <svg className="db-chart" viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <line x1="0" x2="100" y1={y(1)} y2={y(1)} className="db-target" />
      <polyline points={`0,74 ${points.join(" ")} 100,74`} className="db-area" />
      <polyline points={points.join(" ")} className="db-curve" />
    </svg>
  );
}

export function Board({ da, locale, locks, onLock, t }: BoardProps) {
  const { palette, colors, type, texture, grain, motion, layout, radius } = resolve(da);
  const universe = da.universe;
  const spring = springCurve(motion.spring, 48);
  const [copied, setCopied] = useState<DaRole | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const number = (value: number, digits = 1) => value.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: digits });

  useEffect(() => () => clearTimeout(timer.current), []);

  // The specimen title is one word in the display face: it shrinks to the card instead of breaking.
  const specimen = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = specimen.current;
    if (!element) return;
    let width = -1;
    const fit = () => {
      width = element.clientWidth;
      fitStage(element);
    };
    const observer = new ResizeObserver(() => {
      if (element.clientWidth !== width) fit();
    });
    fit();
    observer.observe(element);
    document.fonts?.addEventListener("loadingdone", fit);
    return () => {
      observer.disconnect();
      document.fonts?.removeEventListener("loadingdone", fit);
    };
  }, [da, locale]);

  const copy = async (role: DaRole) => {
    if (!(await writeClipboard(colors[role]))) return;
    setCopied(role);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1400);
  };

  const ratio = (role: DaRole) => contrast(colors[role], colors.bg);
  const percent = (value: number) => (locale === "fr" ? `${number(value, 0)}\u00a0%` : `${number(value, 0)}%`);
  const params: [string, string][] = [
    [String(motion.spring.stiffness), t("stiffness")],
    [String(motion.spring.damping), t("damping")],
    [`${number(spring.duration, 2)}\u00a0s`, t("settle")],
    [percent(Math.max(0, (spring.peak - 1) * 100)), t("overshoot")],
    [`${motion.bpm}\u00a0BPM`, t("loop", { s: number(loopSeconds(motion.bpm)) })],
    [`${motion.durations.in} / ${motion.durations.out} / ${motion.durations.stagger}\u00a0ms`, t("durations")],
  ];
  const gradeLabel = (grade: ReturnType<typeof contrastGrade>) => (grade === "—" ? t("decor") : grade === "AA18" ? t("aaLarge") : grade);
  const sample = universe.hooks[locale][0]!.replace(/\*/g, "");

  return (
    <div className="da-board">
      <Facet facet="palette" option={palette.name[locale]} locks={locks} onLock={onLock} t={t} className="db-pal">
          <ul className="db-sw">
            {DA_ROLES.map((role) => (
              <li key={role}>
                <button type="button" onClick={() => copy(role)} aria-label={t("copyColor", { hex: colors[role], role: t(`roles.${role}`) })}>
                  <i style={{ background: `var(${ROLE_VAR[role]})` }} />
                  <span>{t(`roles.${role}`)}</span>
                  <code>{copied === role ? t("copied") : colors[role]}</code>
                </button>
              </li>
            ))}
          </ul>
          <p className="db-ct">
            {(["ink", "accent"] as const).map((role) => (
              <span key={role}>
                <i style={{ background: `var(${ROLE_VAR[role]})` }} />
                {t("contrast", { role: t(`roles.${role}`), ratio: number(ratio(role)) })}
                <b data-grade={contrastGrade(ratio(role))}>{gradeLabel(contrastGrade(ratio(role)))}</b>
              </span>
            ))}
          </p>
          <p className="sr" role="status">
            {copied ? t("colorCopied", { hex: colors[copied] }) : ""}
          </p>
      </Facet>

      <Facet facet="type" option={type.name[locale]} locks={locks} onLock={onLock} t={t} className="db-ty">
        <div ref={specimen} className="db-spec" data-fit=".spec-d">
          <p className="spec-d">{universe.sig.title[locale]}</p>
          <p className="spec-b">{sample}</p>
          <p className="spec-a">{universe.cta[locale]}</p>
        </div>
        <dl className="db-dl">
          <div>
            <dt>{t("titles")}</dt>
            <dd>{fontLine(type.display, t)}</dd>
          </div>
          <div>
            <dt>{t("body")}</dt>
            <dd>{fontLine(type.body, t)}</dd>
          </div>
          <div>
            <dt>{t("accent")}</dt>
            <dd>{fontLine(type.accent, t)}</dd>
          </div>
          <div>
            <dt>{t("captions")}</dt>
            <dd>{CAPTION_NAME[type.caption][locale]}</dd>
          </div>
        </dl>
      </Facet>

      <Facet facet="texture" option={daTextures[texture].name[locale]} locks={locks} onLock={onLock} t={t} className="db-te">
        <div className="db-tx">
          <i className={cn("tx", `tx-${texture}`)} />
          <i className="tx tx-grain" style={{ opacity: texture === "grain" ? grain * 1.8 : grain }} />
          <b />
        </div>
        <p className="db-note">
          {daTextures[texture].note[locale]} · {t("grain", { n: Math.round(grain * 100) })}
        </p>
      </Facet>

      <Facet facet="motion" option={motion.name[locale]} locks={locks} onLock={onLock} t={t} className="db-mo">
        <div className="db-curve-w">
          <SpringChart values={spring.values} peak={spring.peak} />
          <div className="db-runs">
            <p>
              <span>{t("spring")}</span>
              <i className="db-trk">
                <i className="db-run sp">
                  <b />
                </i>
              </i>
            </p>
            <p>
              <span>{t("ease")}</span>
              <i className="db-trk">
                <i className="db-run ez">
                  <b />
                </i>
              </i>
            </p>
          </div>
        </div>
        <ul className="db-params">
          {params.map(([value, label]) => (
            <li key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </li>
          ))}
        </ul>
        <p className="db-note">{motion.cut[locale]}</p>
        <ul className="db-chips">
          {motion.transitions[locale].map((transition) => (
            <li key={transition}>{transition}</li>
          ))}
        </ul>
      </Facet>

      <Facet facet="layout" option={layout.name[locale]} locks={locks} onLock={onLock} t={t} className="db-ly">
        <div className="db-lays">
          <figure>
            <div className="db-lay site" data-l={layout.site}>
              <i className="m" />
              <i className="h" />
              <i className="p" />
              <i className="c" />
            </div>
            <figcaption>{t("site")}</figcaption>
          </figure>
          <figure>
            <div className="db-lay video" data-l={layout.video}>
              <i className="m" />
              <i className="h" />
              <i className="c" />
            </div>
            <figcaption>{t("video")}</figcaption>
          </figure>
        </div>
        <p className="db-note">
          {layout.cue[locale]} · {t("radius", { n: radius })}
        </p>
      </Facet>

      <section className="db-f db-dir" aria-label={t("direction")}>
        <header className="db-fh">
          <h3 className="db-t">
            <span className="db-k">{t("direction")}</span>
            <b>{universe.name[locale]}</b>
          </h3>
        </header>
        <ul className="db-chips kw">
          {universe.keywords[locale].map((keyword) => (
            <li key={keyword}>{keyword}</li>
          ))}
        </ul>
        <div className="db-cols">
          <div>
            <h4>{t("sound")}</h4>
            <ul>
              {universe.sound[locale].map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{t("do")}</h4>
            <ul className="do">
              {universe.do[locale].map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{t("dont")}</h4>
            <ul className="dont">
              {universe.dont[locale].map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
