import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { getGame, type Game, type GameSlug } from "@content/games";
import { figureValue } from "@content/types";
import { gameSkinClass } from "@/components/games/skin";
import { StatusChip } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { VideoPoster } from "@/components/ui/VideoPoster";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const game = (slug: GameSlug): Game => getGame(slug)!;
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
  children,
}: {
  game: Game;
  locale: Locale;
  className: string;
  iconSize: number;
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
    >
      <Icon name="play" width={iconSize} height={iconSize} />
      {trailer.label[locale]}
      {children}
    </VideoPoster>
  );
}

function OnePiexelCard({ locale }: { locale: Locale }) {
  const g = game("one-piexel");
  const inset = g.media.card[1]!;
  return (
    <TiltCard className={gameSkinClass(g.slug, "g g-op")} max={1.6} aria-labelledby={titleId(g.slug)}>
      <div className="g-media">
        <Trailer game={g} locale={locale} className="op-screen" iconSize={14} />
        <Image
          className="op-inset"
          src={inset.src}
          width={inset.width}
          height={inset.height}
          alt={inset.alt[locale]}
          sizes="(min-width: 860px) 240px, 38vw"
        />
      </div>
      <div className="g-body">
        <StatusChip>{g.statusLabel[locale]}</StatusChip>
        <h3 className="op-title" id={titleId(g.slug)}>
          {g.name.toUpperCase()}
        </h3>
        <p className="op-sub">{g.tagline.card[locale]}</p>
        <p className="g-pitch">{g.pitch.card[locale]}</p>
        <Stats game={g} locale={locale} />
        <Actions game={g} buttonClass="op-btn" />
        {g.disclaimer && <p className="op-note">{g.disclaimer.short[locale]}</p>}
      </div>
    </TiltCard>
  );
}

function FastrCard({ locale }: { locale: Locale }) {
  const g = game("fastr");
  return (
    <TiltCard className={gameSkinClass(g.slug, "g g-fa")} aria-labelledby={titleId(g.slug)}>
      <div className="g-media">
        <Trailer game={g} locale={locale} className="fa-screen" iconSize={12} />
        <div className="fa-bar" aria-hidden="true">
          <i />
        </div>
      </div>
      <div className="g-body">
        <StatusChip>{g.statusLabel[locale]}</StatusChip>
        <h3 className="fa-title" id={titleId(g.slug)}>
          <Icon name="bolt" />
          {g.name.toUpperCase()}
        </h3>
        <p className="fa-sub">{g.tagline.card[locale]}</p>
        <p className="g-pitch">{g.pitch.card[locale]}</p>
        <Stats game={g} locale={locale} />
        <Actions game={g} buttonClass="fa-btn" />
      </div>
    </TiltCard>
  );
}

function IconicCard({ locale }: { locale: Locale }) {
  const g = game("iconic");
  const logo = g.media.logo!;
  return (
    <TiltCard className={gameSkinClass(g.slug, "g g-ic")} delay={80} aria-labelledby={titleId(g.slug)}>
      <div className="g-media">
        <div className="ic-fan">
          {g.media.card.map((card) => (
            <Image
              key={card.src}
              src={card.src}
              width={card.width}
              height={card.height}
              alt={card.alt[locale]}
              sizes="220px"
            />
          ))}
        </div>
      </div>
      <div className="g-body">
        <StatusChip>{g.statusLabel[locale]}</StatusChip>
        <h3 id={titleId(g.slug)}>
          <Image className="ic-logo" src={logo.src} width={logo.width} height={logo.height} alt={g.name} unoptimized />
        </h3>
        <p className="ic-sub">{g.tagline.card[locale]}</p>
        <p className="g-pitch">{g.pitch.card[locale]}</p>
        <Stats game={g} locale={locale} />
        <Actions game={g} buttonClass="ic-btn" />
      </div>
    </TiltCard>
  );
}

/** Home section 01: One Piexel as a full-width showcase, Fastr and Iconic below. */
export function FeaturedGames() {
  const t = useTranslations("home.games");
  const locale = useLocale();

  return (
    <section className="sec" id="jeux">
      <div className="wrap">
        <SectionHeading
          kicker={t("kicker")}
          title={t.rich("title", { em: (chunks) => <em>{chunks}</em>, br: () => <br /> })}
          aside={
            <Reveal>
              <Link className="link" href="/jeux">
                {t("link")}
                <Icon name="arrow" />
              </Link>
            </Reveal>
          }
        />
        <div className="games">
          <OnePiexelCard locale={locale} />
          <FastrCard locale={locale} />
          <IconicCard locale={locale} />
        </div>
      </div>
    </section>
  );
}
