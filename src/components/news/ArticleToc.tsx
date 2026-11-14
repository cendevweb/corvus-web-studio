"use client";

import { useEffect, useRef, useState } from "react";
import type { TocEntry } from "@/lib/markdown/outline";

const WIDE = "(min-width: 1000px)";

/**
 * Table of contents built from the article's level-2 headings.
 * Always open in the desktop sidebar, collapsible on mobile; the section being read is highlighted.
 */
export function ArticleToc({ entries, label }: { entries: TocEntry[]; label: string }) {
  const details = useRef<HTMLDetailsElement>(null);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const el = details.current;
    if (!el) return;
    const wide = window.matchMedia(WIDE);
    const sync = () => {
      el.open = wide.matches;
    };
    sync();
    wide.addEventListener("change", sync);
    return () => wide.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const sections = entries.flatMap((entry) => document.getElementById(entry.id) ?? []);
    const spy = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) if (entry.isIntersecting) setCurrent(entry.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    sections.forEach((section) => spy.observe(section));
    return () => spy.disconnect();
  }, [entries]);

  const closeOnMobile = () => {
    if (details.current && !window.matchMedia(WIDE).matches) details.current.open = false;
  };

  return (
    <details className="toc" ref={details} open>
      <summary>{label}</summary>
      <ol>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={current === entry.id ? "on" : undefined}
              aria-current={current === entry.id ? "true" : undefined}
              onClick={closeOnMobile}
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
