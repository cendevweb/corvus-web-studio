import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { getGame, type Game, type GameSlug } from "@content/games";
import { figureValue } from "@content/types";
import { StatusChip } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { TiltCard } from "@/components/ui/TiltCard";
import { VideoPoster } from "@/components/ui/VideoPoster";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { gameSkinClass } from "./skin";

type Heading = "h2" | "h3";

interface CardProps {
  game: Game;
  locale: Locale;
  heading: Heading;
  delay?: number;
  /** The card sits in the first viewport (games list): load its media right away. */
  priority?: boolean;
}

const titleId = (slug: GameSlug) => `game-title-${slug}`;

function Stats({ game, locale }: { game: Game; locale: Locale }) {
  return (
    <ul className="g-stat">
      {game.cardStats.map((stat) => (
        <li key={stat.label.fr}>
          <b>{figureValue(stat.value, locale)}</b>
          <span>{stat.label[locale]}</span>
        </li>
      ))}
    </ul>
  );
}

/** "Jouer" (external) + "Découvrir le jeu" (game page), with the button class of the skin. */
function Actions({ game, buttonClass }: { game: Game; buttonClass: string }) {
  const t = useTranslations("common");
  return (
    <div className="g-act">
      <a className={`${buttonClass} a`} href={game.url} target="_blank" rel="noopener">
        <Icon name="play" width={14} height={14} />
        {t("play")}
      </a>
      <Link className={`${buttonClass} b`} href={{ pathname: "/jeux/[slug]", params: { slug: game.slug } }}>
        {t("discoverGame")}
      </Link>
    </div>
  );
}

function Trailer({
  game,
  locale,
  className,
  iconSize,
  priority,
  children,
}: {
  game: Game;
  locale: Locale;
  className: string;
  iconSize: number;
  priority?: boolean;
  children?: ReactNode;
}) {
  const t = useTranslations("common");
  const poster = game.media.card[0]!;
  const trailer = game.media.trailer!;
  return (
    <VideoPoster
      className={className}
      src={trailer.src}
      poster={{ ...poster, alt: poster.alt[locale] }}
      playLabel={t("playTrailer", { game: game.name })}
      playingLabel={t("trailerPlaying", { game: game.name })}
      sizes="(min-width: 1240px) 600px, (min-width: 860px) 50vw, 100vw"
      priority={priority}
    >
      <Icon name="play" width={iconSize} height={iconSize} />
      {trailer.label[locale]}
      {children}
    </VideoPoster>
  );
}

function OnePiexelCard({ game: g, locale, heading: Heading, delay, priority }: CardProps) {
  const inset = g.media.card[1]!;
  return (
    <TiltCard className={gameSkinClass(g.slug, "g g-op")} max={1.6} delay={delay} aria-labelledby={titleId(g.slug)}>
      <div className="g-media">
        <Trailer game={g} locale={locale} className="op-screen" iconSize={14} priority={priority} />
        <Image
          className="op-inset"
          src={inset.src}
          width={inset.width}
          height={inset.height}
          alt={inset.alt[locale]}
          sizes="(min-width: 860px) 240px, 38vw"
          loading={priority ? "eager" : "lazy"}
        />
      </div>
      <div className="g-body">
        <StatusChip>{g.statusLabel[locale]}</StatusChip>
        <Heading className="op-title" id={titleId(g.slug)}>
          {g.name.toUpperCase()}
        </Heading>
        <p className="op-sub">{g.tagline.card[locale]}</p>
        <p className="g-pitch">{g.pitch.card[locale]}</p>
        <Stats game={g} locale={locale} />
        <Actions game={g} buttonClass="op-btn" />
        {g.disclaimer && <p className="op-note">{g.disclaimer.short[locale]}</p>}
      </div>
    </TiltCard>
  );
}

function FastrCard({ game: g, locale, heading: Heading, delay }: CardProps) {
  return (
    <TiltCard className={gameSkinClass(g.slug, "g g-fa")} delay={delay} aria-labelledby={titleId(g.slug)}>
      <div className="g-media">
        <Trailer game={g} locale={locale} className="fa-screen" iconSize={12} />
        <div className="fa-bar" aria-hidden="true">
          <i />
        </div>
      </div>
      <div className="g-body">
        <StatusChip>{g.statusLabel[locale]}</StatusChip>
        <Heading className="fa-title" id={titleId(g.slug)}>
          <Icon name="bolt" />
          {g.name.toUpperCase()}
        </Heading>
        <p className="fa-sub">{g.tagline.card[locale]}</p>
        <p className="g-pitch">{g.pitch.card[locale]}</p>
        <Stats game={g} locale={locale} />
        <Actions game={g} buttonClass="fa-btn" />
      </div>
    </TiltCard>
  );
}

function IconicCard({ game: g, locale, heading: Heading, delay }: CardProps) {
  const logo = g.media.logo!;
  return (
    <TiltCard className={gameSkinClass(g.slug, "g g-ic")} delay={delay} aria-labelledby={titleId(g.slug)}>
      <div className="g-media">
        <div className="ic-fan">
          {g.media.card.map((card) => (
            <Image
              key={card.src}
              src={card.src}
              width={card.width}
              height={card.height}
              alt={card.alt[locale]}
              sizes="(min-width: 860px) 220px, 168px"
            />
          ))}
        </div>
      </div>
      <div className="g-body">
        <StatusChip>{g.statusLabel[locale]}</StatusChip>
        <Heading id={titleId(g.slug)}>
          <Image className="ic-logo" src={logo.src} width={logo.width} height={logo.height} alt={g.name} unoptimized />
        </Heading>
        <p className="ic-sub">{g.tagline.card[locale]}</p>
        <p className="g-pitch">{g.pitch.card[locale]}</p>
        <Stats game={g} locale={locale} />
        <Actions game={g} buttonClass="ic-btn" />
      </div>
    </TiltCard>
  );
}

const CARDS = { "one-piexel": OnePiexelCard, fastr: FastrCard, iconic: IconicCard } as const;

/**
 * Showcase card of a game in its own skin (home page, games list): media, status, pitch, three figures,
 * "Jouer" and "Découvrir le jeu". Place it inside a `.games` grid; One Piexel spans the full width.
 */
export function GameCard({
  slug,
  heading = "h3",
  delay,
  priority,
}: {
  slug: GameSlug;
  heading?: Heading;
  delay?: number;
  priority?: boolean;
}) {
  const locale = useLocale();
  const Card = CARDS[slug];
  return <Card game={getGame(slug)!} locale={locale} heading={heading} delay={delay} priority={priority} />;
}
