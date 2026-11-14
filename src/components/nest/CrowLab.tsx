"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/media";
import { createSpring, type Spring } from "@/lib/spring";
import { useNestMessages } from "./use-nest-messages";

const DEFAULT_STIFFNESS = 0.06;
const DEFAULT_DAMPING = 0.86;
const KEY_STEPS: Record<string, [number, number]> = {
  ArrowLeft: [-48, 0],
  ArrowRight: [48, 0],
  ArrowUp: [0, -48],
  ArrowDown: [0, 48],
};

interface Seed {
  x: number;
  y: number;
  el: HTMLElement;
}

/**
 * Nid experiment 01, full version: the crow follows the pointer with a spring, eats the seeds
 * dropped by a click (or a tap), moves with the arrow keys, and its two settings are live.
 * The home page keeps the compact `CrowFollowDemo`.
 */
export function CrowLab() {
  const t = useNestMessages("crow");
  const skyRef = useRef<HTMLDivElement>(null);
  const birdRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLElement>(null);
  const springRef = useRef<Spring | null>(null);
  const [eaten, setEaten] = useState(0);
  const [stiffness, setStiffness] = useState(DEFAULT_STIFFNESS);
  const [damping, setDamping] = useState(DEFAULT_DAMPING);

  useEffect(() => {
    const sky = skyRef.current;
    const bird = birdRef.current;
    if (!sky || !bird) return;

    let seeds: Seed[] = [];
    let tx = 0;
    let ty = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const target = (x: number, y: number) => {
      tx = x;
      ty = y;
      if (prefersReducedMotion()) spring.set(x, y);
      else spring.to(x, y);
    };

    const spring = createSpring(
      (x, y, vx, vy) => {
        bird.style.transform = `translate(${x}px,${y}px) rotate(${Math.max(-14, Math.min(14, vx * 1.6))}deg)`;
        if (Math.abs(vx) > 0.4) bird.classList.toggle("flip", vx < 0);
        const speed = Math.hypot(vx, vy);
        const flying = speed > 0.5;
        const alt = flying && Math.floor(performance.now() / 110) % 2 === 1;
        bird.classList.toggle("f1", flying && !alt);
        bird.classList.toggle("f2", alt);
        if (speedRef.current) speedRef.current.textContent = speed.toFixed(1);

        const before = seeds.length;
        seeds = seeds.filter((seed) => {
          if (Math.hypot(seed.x - x, seed.y - y) > 22) return true;
          seed.el.classList.add("gone");
          const timer = setTimeout(() => {
            seed.el.remove();
            timers.delete(timer);
          }, 220);
          timers.add(timer);
          return false;
        });
        if (seeds.length < before) setEaten((count) => count + before - seeds.length);
        // Once it has landed, the crow goes for the next seed.
        const next = seeds[0];
        if (!flying && next && Math.hypot(tx - x, ty - y) < 2) target(next.x, next.y);
      },
      DEFAULT_STIFFNESS,
      DEFAULT_DAMPING,
    );
    springRef.current = spring;

    const home = () => {
      const rect = sky.getBoundingClientRect();
      if (!rect.width) return;
      tx = rect.width / 2;
      ty = rect.height / 2 + 10;
      spring.set(tx, ty);
    };
    home();
    const resize = new ResizeObserver(home);
    resize.observe(sky);

    const position = (event: PointerEvent): [number, number] => {
      const rect = sky.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || seeds.length) return;
      sky.classList.add("used");
      target(...position(event));
    };
    const onDown = (event: PointerEvent) => {
      const [x, y] = position(event);
      sky.classList.add("used");
      const el = document.createElement("i");
      el.className = "seed";
      el.style.transform = `translate(${x}px,${y}px)`;
      sky.append(el);
      seeds.push({ x, y, el });
      if (seeds.length === 1) target(x, y);
    };
    const onKey = (event: KeyboardEvent) => {
      const step = KEY_STEPS[event.key];
      if (!step) return;
      event.preventDefault();
      sky.classList.add("used");
      const rect = sky.getBoundingClientRect();
      target(
        Math.max(40, Math.min(rect.width - 40, tx + step[0])),
        Math.max(40, Math.min(rect.height - 40, ty + step[1])),
      );
    };

    sky.addEventListener("pointermove", onMove);
    sky.addEventListener("pointerdown", onDown);
    sky.addEventListener("keydown", onKey);
    return () => {
      spring.stop();
      springRef.current = null;
      resize.disconnect();
      timers.forEach(clearTimeout);
      seeds.forEach((seed) => seed.el.remove());
      sky.removeEventListener("pointermove", onMove);
      sky.removeEventListener("pointerdown", onDown);
      sky.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="x-demo lab-crow night">
      <div className="sky" ref={skyRef} tabIndex={0} role="application" aria-label={t("label")}>
        <span className="live">
          <i aria-hidden="true" />
          {t("live")}
        </span>
        <p className="hud" aria-hidden="true">
          {t("speed")} <b ref={speedRef}>0.0</b>
          <br />
          {t("seeds")} <b>{eaten}</b>
        </p>
        <div className="bird" ref={birdRef} aria-hidden="true">
          <i />
        </div>
        <p className="hint">{t("hint")}</p>
      </div>
      <div className="knobs">
        <label>
          <span>
            {t("stiffness")} <output>{stiffness.toFixed(2)}</output>
          </span>
          <input
            type="range"
            min="0.02"
            max="0.2"
            step="0.01"
            value={stiffness}
            onChange={(event) => {
              const value = Number(event.target.value);
              setStiffness(value);
              springRef.current?.tune({ stiffness: value });
            }}
          />
        </label>
        <label>
          <span>
            {t("damping")} <output>{damping.toFixed(2)}</output>
          </span>
          <input
            type="range"
            min="0.6"
            max="0.95"
            step="0.01"
            value={damping}
            onChange={(event) => {
              const value = Number(event.target.value);
              setDamping(value);
              springRef.current?.tune({ damping: value });
            }}
          />
        </label>
      </div>
    </div>
  );
}
