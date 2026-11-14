import Image from "next/image";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";

/** Display-ready data of a news card (resolved on the server with `toNewsCard`, see ./card-data.ts). */
export interface NewsCardData {
  slug: string;
  /** Filter key: game slug or "studio". */
  game: string;
  gameName: string;
  /** Colour of the game dot. */
  color: string;
  dateIso: string;
  dateLabel: string;
  title: string;
  excerpt: string;
  /** Badge over the image ("VIDÉO", "PATCH NOTE", "À VENIR"). */
  kind: string;
  isVideo: boolean;
  cta: string;
  cover?: string;
  coverAlt?: string;
}

interface NewsCardProps {
  item: NewsCardData;
  delay?: number;
  hidden?: boolean;
  headingLevel?: "h2" | "h3" | "h4";
}

/** Compact news card: cover, game tag, date, title, excerpt, call to action. */
export function NewsCard({ item, delay, hidden, headingLevel: Heading = "h3" }: NewsCardProps) {
  const href = { pathname: "/news/[slug]" as const, params: { slug: item.slug } };
  return (
    <Reveal as="article" className="n" delay={delay} hidden={hidden} data-game={item.game}>
      {/* The image repeats the text link below: hidden from assistive tech and the tab order. */}
      <Link className="n-img" href={href} tabIndex={-1} aria-hidden="true">
        {item.cover && (
          <Image
            src={item.cover}
            alt=""
            width={640}
            height={360}
            sizes="(min-width: 1240px) 380px, (min-width: 860px) 33vw, 100vw"
          />
        )}
        {item.isVideo && (
          <span className="n-play">
            <span>
              <Icon name="play" />
            </span>
          </span>
        )}
        <span className="n-kind">{item.kind}</span>
      </Link>
      <div className="n-b">
        <p className="n-meta">
          <span className="n-tag" style={{ "--c": item.color } as CSSProperties}>
            <i aria-hidden="true" />
            {item.gameName}
          </span>
          <time dateTime={item.dateIso}>{item.dateLabel}</time>
        </p>
        <Heading>{item.title}</Heading>
        <p>{item.excerpt}</p>
        <Link className="link" href={href}>
          {item.cta}
          <Icon name="arrow" />
        </Link>
      </div>
    </Reveal>
  );
}
