"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { REDUCED_MOTION_QUERY } from "@/lib/media";

/** Sprite sheet of the mockup: 46 frames of 64×56 on a single row. */
const FRAME_W = 64;
const FRAME_H = 56;
/** Duration of each frame, in ms. */
const DURATIONS = [
  300, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 200, 700, 200,
  100, 300, 100, 100, 600, 100, 100, 100, 100, 100, 100, 100, 100, 100, 1300, 100, 400, 600, 100, 300, 200,
  600, 100, 200, 400,
] as const;
/** After the landing (frames 0-18) the idle animation loops from this frame. */
const LOOP_START = 19;
const LAST = DURATIONS.length - 1;

export interface CrowSpriteHandle {
  /** Replays the landing from the first frame. */
  replay(): void;
}

interface CrowSpriteProps {
  /** Accessible description of the drawing. */
  label: string;
  src?: string;
  className?: string;
  ref?: Ref<CrowSpriteHandle>;
}

/**
 * The studio crow, drawn on a canvas from its sprite sheet, with an iridescent sheen
 * (violet → green diagonal band masked by the silhouette) that follows time and the pointer.
 * Pauses when off-screen; with `prefers-reduced-motion` it shows the resting frame only.
 */
export function CrowSprite({ label, src = "/images/brand/corbeau-sheet.png", className, ref }: CrowSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const replayRef = useRef<() => void>(() => {});

  useImperativeHandle(ref, () => ({ replay: () => replayRef.current() }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia(REDUCED_MOTION_QUERY);
    const off = document.createElement("canvas");
    off.width = FRAME_W;
    off.height = FRAME_H;
    const o = off.getContext("2d");
    if (!o) return;

    const img = new Image();
    let frame = 0;
    let next = 0;
    let visible = true;
    let raf = 0;
    let pointerX = 0.5;
    let loaded = false;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, FRAME_W, FRAME_H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, frame * FRAME_W, 0, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
      // Sheen: diagonal violet → green band, clipped to the crow's silhouette.
      const p = reduce.matches ? 0.5 : ((time / 7000) % 1.6) - 0.3 + (pointerX - 0.5) * 0.4;
      const x = p * FRAME_W * 1.6;
      const gradient = o.createLinearGradient(x - 26, 0, x + 26, FRAME_H);
      gradient.addColorStop(0, "rgba(124,92,255,0)");
      gradient.addColorStop(0.35, "rgba(124,92,255,1)");
      gradient.addColorStop(0.65, "rgba(61,220,151,1)");
      gradient.addColorStop(1, "rgba(61,220,151,0)");
      o.globalCompositeOperation = "source-over";
      o.clearRect(0, 0, FRAME_W, FRAME_H);
      o.drawImage(img, frame * FRAME_W, 0, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H);
      o.globalCompositeOperation = "source-in";
      o.fillStyle = gradient;
      o.fillRect(0, 0, FRAME_W, FRAME_H);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.2;
      ctx.drawImage(off, 0, 0);
    };

    const tick = (time: number) => {
      if (!next) next = time + DURATIONS[frame]!;
      while (time >= next) {
        frame = frame >= LAST ? LOOP_START : frame + 1;
        next += DURATIONS[frame]!;
      }
      draw(time);
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const start = () => {
      if (!loaded) return;
      if (reduce.matches) {
        frame = LAST;
        draw(0);
        return;
      }
      if (!raf) {
        next = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    img.onload = () => {
      loaded = true;
      start();
    };
    img.src = src;

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
    });
    io.observe(canvas);

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX / window.innerWidth;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const onMotionChange = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      start();
    };
    reduce.addEventListener("change", onMotionChange);

    replayRef.current = () => {
      if (reduce.matches) return;
      frame = 0;
      next = 0;
    };

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      reduce.removeEventListener("change", onMotionChange);
      img.onload = null;
    };
  }, [src]);

  return (
    <canvas ref={canvasRef} width={FRAME_W} height={FRAME_H} role="img" aria-label={label} className={className} />
  );
}
