"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { prefersReducedMotion } from "@/lib/media";

export interface NestFilter {
  /** Tag to match, or "all". */
  key: string;
  label: string;
  /** Text of the live counter when this filter is active ("2 expériences · animation"). */
  summary: string;
}

export interface NestCard {
  id: string;
  kind: "playable" | "soon";
  tags: string[];
  /** Server-rendered content placed before the tag list (id line + title, or the whole tile). */
  head: ReactNode;
  /** Playable cards: the description, shown next to the title above the tags. */
  text?: ReactNode;
  /** Everything below it: how it works, demo and code. */
  body?: ReactNode;
}

interface NestExplorerProps {
  filters: NestFilter[];
  cards: NestCard[];
  filterLabel: string;
  listLabel: string;
  soonTitle: string;
  /** Rendered after the grids, inside the same container. */
  children?: ReactNode;
}

function TagList({ tags, active }: { tags: string[]; active: string }) {
  return (
    <ul className="tags">
      {tags.map((tag) => (
        <li key={tag} className={tag === active ? "hit" : undefined}>
          {tag}
        </li>
      ))}
    </ul>
  );
}

/** Nid page: sticky tag filter over the playable experiments and the incubator tiles. */
export function NestExplorer({ filters, cards, filterLabel, listLabel, soonTitle, children }: NestExplorerProps) {
  const [active, setActive] = useState("all");
  const root = useRef<HTMLElement>(null);
  const animate = useRef(false);

  // Short staggered entrance of the cards that remain after a filter change.
  useEffect(() => {
    if (!animate.current) return;
    animate.current = false;
    const reduce = prefersReducedMotion();
    root.current?.querySelectorAll<HTMLElement>("[data-card]:not([hidden])").forEach((card, index) => {
      card.animate(
        reduce
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, transform: "translateY(8px)" },
              { opacity: 1, transform: "none" },
            ],
        { duration: 260, delay: index * 50, easing: "cubic-bezier(.23,1,.32,1)", fill: "backwards" },
      );
    });
  }, [active]);

  const select = (key: string) => {
    animate.current = true;
    setActive(key);
  };

  const shown = (card: NestCard) => active === "all" || card.tags.includes(active);
  const playable = cards.filter((card) => card.kind === "playable");
  const soon = cards.filter((card) => card.kind === "soon");
  const summary = filters.find((filter) => filter.key === active)?.summary ?? "";

  return (
    <>
      <div className="bar">
        <div className="wrap bar-in">
          <div className="filters" role="group" aria-label={filterLabel}>
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className="chip"
                aria-pressed={active === filter.key}
                onClick={() => select(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <p className="count" aria-live="polite">
            {summary}
          </p>
        </div>
      </div>

      <section aria-label={listLabel} ref={root}>
        <div className="wrap">
          <div className="xs">
            {playable.map((card) => (
              <Reveal
                as="article"
                key={card.id}
                className="x"
                data-card=""
                hidden={!shown(card)}
                aria-labelledby={`x-${card.id}`}
              >
                <div className="x-hd">
                  <div>{card.head}</div>
                  <div>
                    {card.text}
                    <TagList tags={card.tags} active={active} />
                  </div>
                </div>
                {card.body}
              </Reveal>
            ))}
          </div>

          <Reveal as="h2" className="soon-hd" hidden={!soon.some(shown)}>
            {soonTitle}
          </Reveal>
          <div className="soons">
            {soon.map((card, index) => (
              <Reveal as="article" key={card.id} className="soon-t" data-card="" hidden={!shown(card)} delay={index * 60}>
                {card.head}
                <TagList tags={card.tags} active={active} />
              </Reveal>
            ))}
          </div>

          {children}
        </div>
      </section>
    </>
  );
}
