"use client";

import { useFormatter } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { prefersReducedMotion, usePrefersReducedMotion } from "@/lib/media";
import { useGamesT } from "../t";

/** Frames on the timeline. */
const FRAMES = 24;
const DELAYS = [2, 4, 8] as const;
const LEGEND = ["pred", "ok", "hit", "sim", "undo", "redo"] as const;

type Cell = "" | "pred" | "ok" | "sent" | "hit" | "sim" | "undo" | "redo";
type Status =
  | { key: "ready" | "paused" }
  | { key: "ok"; frame: number }
  | { key: "bad" | "good"; frames: number };

interface View {
  inputs: Cell[];
  sim: Cell[];
  /** Index of the frame being simulated, -1 while a rollback replays. */
  head: number;
  status: Status;
  rollbacks: number;
}

const emptyRow = (): Cell[] => Array<Cell>(FRAMES).fill("");
const initialView: View = { inputs: emptyRow(), sim: emptyRow(), head: -1, status: { key: "ready" }, rollbacks: 0 };

/**
 * The simulation itself, kept out of React: 24 frames, the opponent's input reaches us `delay` frames late.
 * Until it arrives the game predicts "no input"; a wrong guess rolls back to that frame and replays.
 */
function createRollback(render: (view: View) => void) {
  let inputs = emptyRow();
  let sim = emptyRow();
  const sent = new Set<number>();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let frame = -1;
  let head = -1;
  let delay = 4;
  let busy = false;
  let rollbacks = 0;
  let auto = 0;
  let touched = false;
  let status: Status = { key: "ready" };

  const commit = () => render({ inputs: [...inputs], sim: [...sim], head, status, rollbacks });
  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const clear = () => {
    inputs = emptyRow();
    sim = emptyRow();
    sent.clear();
    frame = -1;
    head = -1;
  };
  const press = () => {
    if (frame < 0 || busy || frame > FRAMES - 2) return;
    sent.add(frame);
    inputs[frame] = "sent";
  };
  const rollback = (from: number) => {
    const frames = frame - from;
    const reduced = prefersReducedMotion();
    const paint = (cell: Cell, upTo = frame) => {
      for (let i = from; i <= upTo; i++) sim[i] = cell;
    };
    const done = () => {
      head = frame;
      status = { key: "good", frames };
      commit();
      later(() => (busy = false), reduced ? 0 : 520);
    };
    busy = true;
    rollbacks++;
    head = -1;
    status = { key: "bad", frames };
    if (reduced) {
      paint("redo");
      return done();
    }
    paint("undo");
    commit();
    later(() => {
      for (let i = from; i <= frame; i++) {
        later(
          () => {
            sim[i] = "redo";
            if (i === frame) done();
            else commit();
          },
          (i - from) * 55,
        );
      }
    }, 420);
  };
  const step = () => {
    if (busy) return;
    if (frame >= FRAMES - 1) clear();
    frame++;
    head = frame;
    sim[frame] = "sim";
    inputs[frame] = "pred";
    if (!touched && ++auto % 13 === 7) press();
    const arrived = frame - delay;
    if (arrived >= 0) {
      if (sent.has(arrived)) {
        inputs[arrived] = "hit";
        return rollback(arrived);
      }
      inputs[arrived] = "ok";
    }
    status = { key: "ok", frame: frame + 1 };
    commit();
  };

  return {
    step,
    /** The visitor plays the opponent: send a hit on the current frame. */
    hit(startFirst: boolean) {
      touched = true;
      if (startFirst) step();
      press();
      commit();
    },
    setDelay(next: number) {
      delay = next;
      if (!busy) clear();
      commit();
    },
    pause() {
      status = { key: "paused" };
      commit();
    },
    dispose() {
      timers.forEach(clearTimeout);
      timers.clear();
    },
  };
}

/** One Piexel demo: rollback netcode, frame by frame, slowed down nine times. */
export function RollbackDemo() {
  const t = useGamesT("demos.rollback");
  const format = useFormatter();
  const reduced = usePrefersReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const engine = useRef<ReturnType<typeof createRollback> | null>(null);
  const [view, setView] = useState(initialView);
  const [delay, setDelay] = useState(4);
  const [visible, setVisible] = useState(false);
  /** Explicit play/pause choice; until then the demo plays unless motion is reduced. */
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? !reduced;

  useEffect(() => {
    const instance = createRollback(setView);
    engine.current = instance;
    return () => instance.dispose();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !visible) return;
    const id = setInterval(() => engine.current?.step(), 150);
    return () => clearInterval(id);
  }, [playing, visible]);

  const { status } = view;
  const statusText =
    status.key === "ok"
      ? t("status.ok", { frame: String(status.frame).padStart(2, "0") })
      : status.key === "bad"
        ? t("status.bad", { frames: status.frames })
        : status.key === "good"
          ? t("status.good", {
              frames: status.frames,
              ms: format.number((status.frames + 1) * 0.01, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            })
          : t(`status.${status.key}`);

  return (
    <div ref={box}>
      <div className="demo-hd">
        <h3 className="demo-t">{t("title")}</h3>
        <span className="demo-live">
          <i aria-hidden="true" />
          {t("live")}
        </span>
      </div>
      <p className="demo-p">{t("intro")}</p>
      <div className="rb-grid" aria-hidden="true">
        <div className="rb-row">
          <span className="rb-l">{t("inputs")}</span>
          <div className="rb-tr">
            {view.inputs.map((cell, index) => (
              <i key={index} className={cell || undefined} />
            ))}
          </div>
        </div>
        <div className="rb-row">
          <span className="rb-l">{t("simulation")}</span>
          <div className="rb-tr">
            {view.sim.map((cell, index) => (
              <i key={index} className={cn(cell, index === view.head && "head") || undefined} />
            ))}
          </div>
        </div>
      </div>
      <p
        className="rb-st"
        data-k={status.key === "bad" || status.key === "good" ? status.key : undefined}
        aria-hidden="true"
      >
        {statusText}
      </p>
      <p className="sr" role="status">
        {status.key === "good" ? t("status.announce", { frames: status.frames }) : ""}
      </p>
      <div className="demo-ctl">
        <button
          className="gbtn a"
          type="button"
          onClick={() => {
            engine.current?.hit(!playing);
            setChoice(true);
          }}
        >
          {t("hit")}
        </button>
        <button
          className="gbtn b"
          type="button"
          onClick={() => {
            if (playing) engine.current?.pause();
            setChoice(!playing);
          }}
        >
          {playing ? t("pause") : t("play")}
        </button>
        <div className="rb-delay" role="group" aria-label={t("latencyLabel")}>
          <span aria-hidden="true">{t("latency")}</span>
          {DELAYS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={delay === value}
              onClick={() => {
                setDelay(value);
                engine.current?.setDelay(value);
              }}
            >
              {t("frames", { count: value })}
            </button>
          ))}
        </div>
        <span className="rb-cnt">
          {t("rollbacks")} <b>{view.rollbacks}</b>
        </span>
      </div>
      <ul className="rb-leg" aria-label={t("legendLabel")}>
        {LEGEND.map((key) => (
          <li key={key}>
            <i className={key} aria-hidden="true" />
            {t(`legend.${key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
