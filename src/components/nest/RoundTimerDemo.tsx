"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { skinFontVariables } from "@/lib/fonts-skins";

const TOTAL = 120;
const SEGMENTS = 24;
const ROUNDS = 4;

interface RoundTimerDemoProps {
  /** Playback speed multiplier (the home page runs it ×8 to spare the wait). */
  speed?: number;
}

/** Nid demo 02: Fastr's round timer. Time left derives from the clock, not from counted frames. */
export function RoundTimerDemo({ speed = 8 }: RoundTimerDemoProps) {
  const t = useTranslations("demos.timer");
  const common = useTranslations("common");
  const [left, setLeft] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const leftRef = useRef(TOTAL);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      leftRef.current = Math.max(0, leftRef.current - ((now - last) / 1000) * speed);
      last = now;
      setLeft(leftRef.current);
      if (leftRef.current <= 0) setRunning(false);
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, speed]);

  const seconds = Math.ceil(left);
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const lit = Math.ceil((left / TOTAL) * SEGMENTS);
  const finished = left <= 0;

  const restart = (nextRound: number) => {
    leftRef.current = TOTAL;
    setLeft(TOTAL);
    setRound(nextRound);
  };
  const toggle = () => {
    if (finished) restart((round % ROUNDS) + 1);
    setRunning((value) => !value);
  };
  const reset = () => {
    setRunning(false);
    restart(1);
  };

  return (
    <div className={cn("t-demo d-timer", skinFontVariables.fastr, left <= 10 && left > 0 && "danger")}>
      <span className="live">
        <i aria-hidden="true" />
        {common("live")}
      </span>
      <p className="tm-round">{t("round", { n: round })}</p>
      <p className="tm-clock" role="timer" aria-live="off">
        {clock}
      </p>
      <div className="tm-seg" aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <i key={index} className={index >= lit ? "off" : undefined} />
        ))}
      </div>
      <div className="tm-act">
        <button type="button" className="tm-btn a" onClick={toggle}>
          {running ? t("pause") : finished ? t("next") : t("start")}
        </button>
        <button type="button" className="tm-btn b" onClick={reset}>
          {t("reset")}
        </button>
      </div>
    </div>
  );
}
