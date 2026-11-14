"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/media";
import { createSpring } from "@/lib/spring";

/** Nid demo 01: a pixel crow that follows the pointer with a spring (momentum + overshoot). */
export function CrowFollowDemo() {
  const t = useTranslations("demos.crow");
  const common = useTranslations("common");
  const boxRef = useRef<HTMLDivElement>(null);
  const birdRef = useRef<HTMLDivElement>(null);
  const seedRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const bird = birdRef.current;
    const seed = seedRef.current;
    if (!box || !bird || !seed) return;

    const spring = createSpring(
      (x, y, vx, vy) => {
        bird.style.transform = `translate(${x}px,${y}px) rotate(${Math.max(-14, Math.min(14, vx * 1.6))}deg)`;
        if (Math.abs(vx) > 0.4) bird.classList.toggle("flip", vx < 0);
        const flying = Math.abs(vx) + Math.abs(vy) > 0.5;
        const alt = flying && Math.floor(performance.now() / 110) % 2 === 1;
        bird.classList.toggle("f1", flying && !alt);
        bird.classList.toggle("f2", alt);
      },
      0.06,
      0.86,
    );

    const home = () => {
      const rect = box.getBoundingClientRect();
      spring.set(rect.width / 2, rect.height / 2 + 10);
    };
    home();

    const go = (event: PointerEvent): [number, number] => {
      const rect = box.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      box.classList.add("used");
      if (prefersReducedMotion()) spring.set(x, y);
      else spring.to(x, y);
      return [x, y];
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse") go(event);
    };
    const onDown = (event: PointerEvent) => {
      const [x, y] = go(event);
      seed.style.transform = `translate(${x}px,${y}px)`;
      seed.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: "ease-out" });
    };

    window.addEventListener("resize", home);
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerdown", onDown);
    return () => {
      spring.stop();
      window.removeEventListener("resize", home);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div className="t-demo d-crow night" ref={boxRef}>
      <span className="live">
        <i aria-hidden="true" />
        {common("live")}
      </span>
      <i className="seed" ref={seedRef} aria-hidden="true" />
      <div className="bird" ref={birdRef} aria-hidden="true">
        <i />
      </div>
      <p className="hint">{t("hint")}</p>
    </div>
  );
}
