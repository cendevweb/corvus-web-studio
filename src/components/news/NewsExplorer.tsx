"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { prefersReducedMotion } from "@/lib/media";
import type { FeedItem } from "./feed-data";

export interface NewsFilterOption {
  key: string;
  label: string;
  count: number;
  color?: string;
  /** Text of the live counter when this filter is active ("3 publications · One Piexel"). */
  summary: string;
}

export interface NewsExplorerLabels {
  filterLabel: string;
  featuredLabel: string;
  featuredFlag: string;
  program: string;
  watch: string;
  read: string;
  gameLink: string;
  listTitle: string;
  end: string;
  top: string;
}

interface NewsExplorerProps {
  filters: NewsFilterOption[];
  featured: FeedItem | null;
  items: FeedItem[];
  labels: NewsExplorerLabels;
}

const articleHref = (slug: string) => ({ pathname: "/news/[slug]" as const, params: { slug } });

function Meta({ item, withDate }: { item: FeedItem; withDate?: boolean }) {
  return (
    <p className="n-meta">
      <span className="n-tag" style={{ "--c": item.color } as CSSProperties}>
        <i aria-hidden="true" />
        {item.gameName}
      </span>
      {withDate && <time dateTime={item.dateIso}>{item.dateLabel}</time>}
      <span>{item.kind}</span>
      {!withDate && item.readingLabel && <span>{item.readingLabel}</span>}
    </p>
  );
}

function Featured({ item, labels, hidden }: { item: FeedItem; labels: NewsExplorerLabels; hidden: boolean }) {
  const [lead, accent] = item.titleParts;
  const cta = item.ctaLabel ?? (item.isVideo ? labels.watch : labels.read);
  return (
    <section className="sec-feat" aria-label={labels.featuredLabel} hidden={hidden}>
      <div className="wrap">
        <Reveal as="article" className="feat" data-anim="">
          <Link className="feat-media" href={articleHref(item.slug)} tabIndex={-1} aria-hidden="true">
            {item.cover && (
              <Image
                src={item.cover.src}
                width={item.cover.width}
                height={item.cover.height}
                alt=""
                sizes="(min-width: 920px) 720px, 100vw"
                priority
              />
            )}
            <span className="feat-flags">
              <span className="flag une">{labels.featuredFlag}</span>
              <span className="flag">{item.upcoming ? item.upcomingLabel : item.flag}</span>
            </span>
            {item.isVideo && (
              <span className="play">
                <Icon name="play" />
              </span>
            )}
          </Link>
          <div className="feat-b">
            <Meta item={item} withDate />
            <h2>
              {lead}
              {accent && (
                <>
                  {" "}
                  <em>{accent}</em>
                </>
              )}
            </h2>
            <p>{item.excerpt}</p>
            {item.highlights.length > 0 && (
              <ol className="prog" aria-label={labels.program}>
                {item.highlights.map((line, index) => (
                  <li key={line}>
                    <b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b>
                    {line}
                  </li>
                ))}
              </ol>
            )}
            <div className="feat-act">
              <Link className="btn btn-main" href={articleHref(item.slug)}>
                {item.isVideo && <Icon name="play" />}
                {cta}
              </Link>
              {item.game !== "studio" && (
                <Link className="link" href={{ pathname: "/jeux/[slug]", params: { slug: item.game } }}>
                  {labels.gameLink}
                  <Icon name="arrow" />
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Row({ item, hidden }: { item: FeedItem; hidden: boolean }) {
  return (
    <Reveal as="article" className="row" hidden={hidden} data-anim="">
      <p className="row-date">
        <b>{item.day}</b>
        <time dateTime={item.dateIso}>{item.monthYear}</time>
        {item.upcoming && (
          <span className="soon">
            <i aria-hidden="true" />
            {item.upcomingLabel}
          </span>
        )}
      </p>
      <div className={`th th-${item.skin}`}>
        {item.cover && (
          <Image
            src={item.cover.src}
            width={item.cover.width}
            height={item.cover.height}
            alt={item.cover.alt}
            sizes="(min-width: 1100px) 300px, (min-width: 760px) 240px, 100vw"
          />
        )}
        <span className="flag">{item.flag}</span>
        {item.isVideo && (
          <span className="mini-play" aria-hidden="true">
            <Icon name="play" />
          </span>
        )}
      </div>
      <div className="row-b">
        <Meta item={item} />
        <h3>
          <Link href={articleHref(item.slug)}>{item.title}</Link>
        </h3>
        <p>{item.excerpt}</p>
        {item.tags.length > 0 && (
          <ul className="pts">
            {item.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
      <span className="row-go" aria-hidden="true">
        <Icon name="arrow" />
      </span>
    </Reveal>
  );
}

/** News page: sticky per-game filter, the featured publication and the list grouped by month. */
export function NewsExplorer({ filters, featured, items, labels }: NewsExplorerProps) {
  const [active, setActive] = useState("all");
  const root = useRef<HTMLDivElement>(null);
  const animate = useRef(false);

  // A link such as /news#fastr opens the page already filtered.
  useEffect(() => {
    const read = () => {
      const key = decodeURIComponent(window.location.hash.slice(1));
      if (filters.some((filter) => filter.key === key)) setActive(key);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [filters]);

  // Short staggered entrance of what remains after a filter change (not on first paint).
  useEffect(() => {
    if (!animate.current) return;
    animate.current = false;
    const reduce = prefersReducedMotion();
    root.current?.querySelectorAll<HTMLElement>("[data-anim]").forEach((el, index) => {
      if (el.closest("[hidden]")) return;
      el.animate(
        reduce
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, transform: "translateY(8px)" },
              { opacity: 1, transform: "none" },
            ],
        { duration: 260, delay: Math.min(index, 8) * 50, easing: "cubic-bezier(.23,1,.32,1)", fill: "backwards" },
      );
    });
  }, [active]);

  const select = (key: string) => {
    animate.current = true;
    setActive(key);
    window.history.replaceState(null, "", key === "all" ? window.location.pathname : `#${key}`);
  };

  const shown = (item: FeedItem) => active === "all" || item.game === active;
  const months: Array<{ key: string; label: string; items: FeedItem[] }> = [];
  for (const item of items) {
    const last = months[months.length - 1];
    if (last?.key === item.monthKey) last.items.push(item);
    else months.push({ key: item.monthKey, label: item.monthLabel, items: [item] });
  }
  const summary = filters.find((filter) => filter.key === active)?.summary ?? "";

  return (
    <div ref={root}>
      <div className="bar">
        <div className="wrap bar-in">
          <div className="filters" role="group" aria-label={labels.filterLabel}>
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className="chip"
                aria-pressed={active === filter.key}
                style={filter.color ? ({ "--c": filter.color } as CSSProperties) : undefined}
                onClick={() => select(filter.key)}
              >
                {filter.color && <i aria-hidden="true" />}
                {filter.label} <small>{filter.count}</small>
              </button>
            ))}
          </div>
          <p className="count" aria-live="polite">
            {summary}
          </p>
        </div>
      </div>

      {featured && <Featured item={featured} labels={labels} hidden={!shown(featured)} />}

      <section className="sec-tl" aria-labelledby="tl-t">
        <div className="wrap">
          <h2 className="sr" id="tl-t">
            {labels.listTitle}
          </h2>
          {months.map((month) => (
            <div className="tl-g" key={month.key} hidden={!month.items.some(shown)}>
              <Reveal as="h3" className="tl-m">
                {month.label}
              </Reveal>
              {month.items.map((item) => (
                <Row key={item.slug} item={item} hidden={!shown(item)} />
              ))}
            </div>
          ))}
          <p className="tl-end">
            <span>{labels.end}</span>
            <a className="link" href="#contenu">
              {labels.top}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
