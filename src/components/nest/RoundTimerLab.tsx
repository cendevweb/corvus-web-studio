"use client";

import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { skinFontVariables } from "@/lib/fonts-skins";
import { useNestMessages } from "./use-nest-messages";

const TOTAL = 120;
const SEGMENTS = 24;
const ROUNDS = 4;
const MAX_WORDS = 20;
const SPEEDS = [1, 8, 30] as const;

/**
 * Nid experiment 02, full version: Fastr's round timer with the game's real scoring rule
 * (100 points + a speed bonus that melts with every word, a penalty sent every three words)
 * and a speed selector. The home page keeps the compact `RoundTimerDemo`.
 */
export function RoundTimerLab() {
  const t = useNestMessages("timer");
  const locale = useLocale();
  const [left, setLeft] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const [speed, setSpeed] = useState<number>(8);
  const [words, setWords] = useState(0);
  const [score, setScore] = useState(0);
  const [malus, setMalus] = useState(false);
  const leftRef = useRef(TOTAL);
  const speedRef = useRef(speed);
  const malusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Time left derives from the clock, not from counted frames.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      leftRef.current = Math.max(0, leftRef.current - ((now - last) / 1000) * speedRef.current);
      last = now;
      setLeft(leftRef.current);
      if (leftRef.current <= 0) setRunning(false);
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  useEffect(() => () => clearTimeout(malusTimer.current), []);

  const seconds = Math.ceil(left);
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const lit = Math.ceil((left / TOTAL) * SEGMENTS);
  const finished = left <= 0;

  const toggle = () => {
    if (finished) {
      if (round === ROUNDS) setScore(0);
      setRound((round % ROUNDS) + 1);
      leftRef.current = TOTAL;
      setLeft(TOTAL);
      setWords(0);
    }
    setRunning((value) => !value);
  };

  const validate = () => {
    setScore((value) => value + 100 + Math.max(0, 119 - words));
    const count = words + 1;
    setWords(count);
    if (count % 3 === 0) {
      setMalus(true);
      clearTimeout(malusTimer.current);
      malusTimer.current = setTimeout(() => setMalus(false), 1100);
    }
  };

  const reset = () => {
    setRunning(false);
    leftRef.current = TOTAL;
    setLeft(TOTAL);
    setRound(1);
    setWords(0);
    setScore(0);
  };

  return (
    <div className={cn("x-demo lab-timer", skinFontVariables.fastr, left <= 10 && left > 0 && "danger")}>
      <span className="live">
        <i aria-hidden="true" />
        {t("live")}
      </span>
      <div className="rt-speed" role="group" aria-label={t("speedLabel")}>
        {SPEEDS.map((value) => (
          <button key={value} type="button" aria-pressed={speed === value} onClick={() => setSpeed(value)}>
            ×{value}
          </button>
        ))}
      </div>
      <p className={cn("rt-malus", malus && "on")} aria-hidden="true">
        {t("malus")}
      </p>
      <p className="sr" role="status">
        {malus ? t("malus") : ""}
      </p>
      <p className="rt-round">{finished ? t("roundOver", { n: round }) : t("round", { n: round })}</p>
      <p className="rt-clock" role="timer" aria-live="off">
        {clock}
      </p>
      <div className="rt-seg" aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <i key={index} className={index >= lit ? "off" : undefined} />
        ))}
      </div>
      <ul className="rt-stats">
        <li>
          <b>{score.toLocaleString(locale)}</b>
          {t("points")}
        </li>
        <li>
          <b>
            {words} / {MAX_WORDS}
          </b>
          {t("words")}
        </li>
        <li className="b">
          <b>+{Math.max(0, 119 - words)}</b>
          {t("bonus")}
        </li>
      </ul>
      <div className="rt-act">
        <button type="button" className="rt-btn a" onClick={toggle}>
          {running ? t("pause") : finished ? (round === ROUNDS ? t("replay") : t("next")) : t("start")}
        </button>
        <button type="button" className="rt-btn v" onClick={validate} disabled={!running}>
          {t("validate")}
        </button>
        <button type="button" className="rt-btn b" onClick={reset}>
          {t("reset")}
        </button>
      </div>
    </div>
  );
}
