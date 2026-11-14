"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { REDUCED_MOTION_QUERY } from "@/lib/media";

/** Sprite sheet of the crow: 46 frames of 64×56 on one row (same sheet as CrowSprite). */
const SHEET = "/images/brand/corbeau-sheet.png";
const FRAME_W = 64;
const FRAME_H = 56;
const DURATIONS = [
  300, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 200, 700, 200,
  100, 300, 100, 100, 600, 100, 100, 100, 100, 100, 100, 100, 100, 100, 1300, 100, 400, 600, 100, 300, 200,
  600, 100, 200, 400,
] as const;
const LOOP_START = 19;
const LAST = DURATIONS.length - 1;
/** Take-off = the landing frames played backwards, from this frame, at a fixed pace. */
const TAKEOFF_FROM = 11;
const TAKEOFF_FRAME_MS = 70;

interface NotFoundSceneProps {
  /** Text column (caption, title, links), rendered on the server. */
  children: ReactNode;
  /** Label of the "call the crow back" button. */
  recallLabel: string;
  /** Accessible name of the fake address bar. */
  urlLabel: string;
}

/**
 * 404 scene: the crow sits in the "0" of 404, takes off, crosses the frame and disappears.
 * "Call the crow back" makes it land again before it leaves once more.
 * With `prefers-reduced-motion` nothing moves: the perch is simply empty.
 */
export function NotFoundScene({ children, recallLabel, urlLabel }: NotFoundSceneProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const perchRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const recallRef = useRef<() => void>(() => {});
  const [path, setPath] = useState<{ base: string; last: string } | null>(null);

  // The requested address, shown in the fake address bar (read in the browser: the server only sees the rewritten URL).
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let pathname = window.location.pathname;
      try {
        pathname = decodeURI(pathname);
      } catch {
        // Malformed escape sequence: show the raw path.
      }
      const cut = pathname.replace(/\/$/, "").lastIndexOf("/") + 1;
      setPath({ base: pathname.slice(0, cut), last: pathname.slice(cut) });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const frameEl = frameRef.current;
    const box = boxRef.current;
    const perch = perchRef.current;
    const flyer = flyerRef.current;
    if (!canvas || !ctx || !frameEl || !box || !perch || !flyer) return;

    const reduce = window.matchMedia(REDUCED_MOTION_QUERY);
    const img = new Image();
    let loaded = false;
    let pending: (() => void) | null = null;
    let frame = LAST;
    let mode: "idle" | "off" = "idle";
    let next = 0;
    let raf = 0;
    let onGone: (() => void) | null = null;
    let busy = false;
    let flap: ReturnType<typeof setInterval> | undefined;
    let flight: Animation | undefined;
    const timeouts: Array<ReturnType<typeof setTimeout>> = [];

    const draw = () => {
      ctx.clearRect(0, 0, FRAME_W, FRAME_H);
      ctx.drawImage(img, frame * FRAME_W, 0, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
    };
    const clear = () => ctx.clearRect(0, 0, FRAME_W, FRAME_H);

    const tick = (time: number) => {
      if (!next) next = time + (mode === "off" ? TAKEOFF_FRAME_MS : DURATIONS[frame]!);
      while (time >= next) {
        if (mode === "off") {
          frame -= 1;
          next += TAKEOFF_FRAME_MS;
          if (frame <= 0) {
            // Frame 0 is the empty branch: the crow is gone.
            frame = 0;
            draw();
            raf = 0;
            onGone?.();
            return;
          }
        } else {
          frame = frame >= LAST ? LOOP_START : frame + 1;
          next += DURATIONS[frame]!;
        }
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    const run = () => {
      next = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const whenReady = (callback: () => void) => {
      if (loaded) callback();
      else pending = callback;
    };

    const show = (target: number) =>
      whenReady(() => {
        cancelAnimationFrame(raf);
        raf = 0;
        frame = target;
        draw();
      });
    const land = () =>
      whenReady(() => {
        mode = "idle";
        frame = 0;
        run();
      });
    const takeoff = (done: () => void) =>
      whenReady(() => {
        mode = "off";
        frame = TAKEOFF_FROM;
        onGone = done;
        run();
      });

    const leave = () => {
      if (busy) return;
      if (reduce.matches) {
        show(0);
        return;
      }
      busy = true;
      takeoff(() => {
        clear();
        const b = box.getBoundingClientRect();
        const p = perch.getBoundingClientRect();
        const x0 = p.left - b.left + p.width * 0.3;
        const y0 = p.top - b.top + p.height * 0.25;
        flap = setInterval(() => flyer.classList.toggle("f2"), 110);
        flight = flyer.animate(
          [
            { opacity: 1, transform: `translate(${x0}px,${y0}px) scale(${Math.min(1, p.width / 180)})` },
            { opacity: 1, transform: `translate(${x0 - b.width * 0.22}px,${y0 - 70}px) scale(.8)`, offset: 0.45 },
            { opacity: 0, transform: "translate(-140px,-120px) scale(.55)" },
          ],
          { duration: 1500, easing: "cubic-bezier(.45,0,.55,1)" },
        );
        flight.onfinish = () => {
          clearInterval(flap);
          busy = false;
        };
      });
    };

    recallRef.current = () => {
      if (busy) return;
      if (reduce.matches) {
        show(LAST);
        timeouts.push(setTimeout(() => show(0), 1200));
        return;
      }
      busy = true;
      land();
      timeouts.push(
        setTimeout(() => {
          busy = false;
          leave();
        }, 4200),
      );
    };

    img.onload = () => {
      loaded = true;
      pending?.();
      pending = null;
    };
    img.src = SHEET;
    show(reduce.matches ? 0 : LAST);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        timeouts.push(setTimeout(leave, 900));
      },
      { threshold: 0.5 },
    );
    io.observe(frameEl);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(flap);
      timeouts.forEach(clearTimeout);
      flight?.cancel();
      io.disconnect();
      img.onload = null;
      recallRef.current = () => {};
    };
  }, []);

  return (
    <div className="nf night" ref={frameRef}>
      <div className="nf-bar">
        <i aria-hidden="true" />
        <i aria-hidden="true" />
        <i aria-hidden="true" />
        <span className="nf-url" aria-label={urlLabel}>
          {path && (
            <>
              {path.base}
              <b>{path.last}</b>
            </>
          )}
        </span>
      </div>
      <div className="nf-in" ref={boxRef}>
        <div className="nf-num" aria-hidden="true">
          <span>4</span>
          <span className="perch" ref={perchRef}>
            <span className="perch-halo" />
            <span className="perch-ring" />
            <span className="perch-disc" />
            <canvas ref={canvasRef} width={FRAME_W} height={FRAME_H} />
          </span>
          <span>4</span>
        </div>
        <div className="nf-t">
          {children}
          <button className="nf-re" type="button" onClick={() => recallRef.current()}>
            <b>&gt;</b> {recallLabel}
          </button>
        </div>
        <div className="flyer" ref={flyerRef} aria-hidden="true">
          <i />
        </div>
      </div>
    </div>
  );
}
