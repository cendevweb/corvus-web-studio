"use client";

import { useEffect, useRef } from "react";

/** Reading progress of the article body: a 3px iridescent bar, driven by `transform` only. */
export function ReadingBar({ target }: { target: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(target);
    const el = bar.current;
    if (!article || !el) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const rect = article.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight * 0.6);
      const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.4 - rect.top) / total));
      el.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [target]);

  return <div className="read" ref={bar} aria-hidden="true" />;
}
