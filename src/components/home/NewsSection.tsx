"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { NewsCard, type NewsCardData } from "@/components/news/NewsCard";
import { Reveal } from "@/components/ui/Reveal";
import { prefersReducedMotion } from "@/lib/media";

export interface NewsFilter {
  key: string;
  label: string;
  color?: string;
}

interface NewsSectionProps {
  heading: ReactNode;
  filters: NewsFilter[];
  filterLabel: string;
  items: NewsCardData[];
  /** Message per filter key when no card matches. */
  emptyMessages: Record<string, string>;
  emptyLink: ReactNode;
}

/** Home section 02: the latest news with a per-game filter. */
export function NewsSection({ heading, filters, filterLabel, items, emptyMessages, emptyLink }: NewsSectionProps) {
  const [active, setActive] = useState("all");
  const list = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const visible = items.filter((item) => active === "all" || item.game === active);

  // Replay a short staggered entrance on the cards that remain after a filter change.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const reduce = prefersReducedMotion();
    list.current?.querySelectorAll<HTMLElement>(".n:not([hidden])").forEach((card, index) => {
      card.animate(
        reduce
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, transform: "translateY(8px)" },
              { opacity: 1, transform: "none" },
            ],
        { duration: 240, delay: index * 50, easing: "cubic-bezier(.23,1,.32,1)", fill: "backwards" },
      );
    });
  }, [active]);

  return (
    <section className="sec" id="news">
      <div className="wrap">
        <div className="sec-hd">
          {heading}
          <Reveal className="filters" role="group" aria-label={filterLabel}>
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className="chip"
                aria-pressed={active === filter.key}
                style={filter.color ? ({ "--c": filter.color } as CSSProperties) : undefined}
                onClick={() => setActive(filter.key)}
              >
                {filter.color && <i aria-hidden="true" />}
                {filter.label}
              </button>
            ))}
          </Reveal>
        </div>
        <div className="news" ref={list} aria-live="polite">
          {items.map((item, index) => (
            <NewsCard
              key={item.slug}
              item={item}
              delay={index * 60}
              hidden={active !== "all" && item.game !== active}
            />
          ))}
          <p className="n-empty" hidden={visible.length > 0}>
            {emptyMessages[active]} {emptyLink}
          </p>
        </div>
      </div>
    </section>
  );
}
