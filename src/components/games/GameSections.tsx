import Image from "next/image";
import type { ReactNode } from "react";
import { games, type Game } from "@content/games";
import { getSocial } from "@content/site";
import { figureValue } from "@content/types";
import { NewsCard, type NewsCardData } from "@/components/news/NewsCard";
import { StatusChip } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { GameDemo } from "./GameDemo";
import { GameGallery } from "./GameGallery";
import { GameIcon } from "./GameIcon";
import { GameTitle } from "./GameTitle";
import { rich } from "./rich";
import { gameSkinClass } from "./skin";
import { useGamesT } from "./t";
import { TrailerButton, TrailerPoster, TrailerProvider } from "./Trailer";

interface SectionProps {
  game: Game;
  locale: Locale;
}

/** Kicker + title (+ lede) of a game page section. `*accent*` in the title renders in iridescent serif. */
function Heading({ kicker, title, lede }: { kicker: string; title: ReactNode; lede?: string }) {
  return (
    <Reveal>
      <span className="sec-n">{kicker}</span>
      <h2 className="sec-title is-iris">{title}</h2>
      {lede && <p className="sec-lede">{lede}</p>}
    </Reveal>
  );
}

function Disclaimer({ game, locale }: SectionProps) {
  if (!game.disclaimer) return null;
  const [lead, ...rest] = game.disclaimer.long[locale].split(". ");
  return (
    <p className="gh-note">
      <b>{lead}.</b> {rest.join(". ")}
    </p>
  );
}

/** Hero in the game's skin: trailer poster, status, title, pitch, actions, platforms and the four figures. */
export function GameHero({ game, locale }: SectionProps) {
  const t = useGamesT();
  const trailer = game.media.trailer;
  const poster = game.media.poster;

  const body = (
    <Reveal className={gameSkinClass(game.slug, "gh")}>
      <div className="gh-media">
        {trailer ? (
          <TrailerPoster
            poster={{ ...poster, alt: poster.alt[locale] }}
            playLabel={trailer.playLabel[locale]}
            badge={`${trailer.label[locale]} · ${trailer.duration[locale]}`}
          />
        ) : (
          <div className="poster">
            <Image src={poster.src} width={poster.width} height={poster.height} alt={poster.alt[locale]} loading="eager" />
          </div>
        )}
        {game.skin === "fa" && (
          <div className="fa-bar" aria-hidden="true">
            <i />
          </div>
        )}
      </div>
      <div className="gh-body">
        <StatusChip>{game.statusLabel[locale]}</StatusChip>
        <GameTitle game={game} as="h1" />
        <p className="gh-sub">{game.tagline.page[locale]}</p>
        <p className="gh-pitch">{game.pitch.page[locale]}</p>
        <div className="gh-act">
          <a className="gbtn a" href={game.url} target="_blank" rel="noopener">
            <Icon name="play" />
            {t("hero.play")}
          </a>
          {trailer && <TrailerButton className="gbtn b">{t("hero.watchTrailer")}</TrailerButton>}
        </div>
        <ul className="plat" aria-label={t("hero.platforms")}>
          {game.platforms[locale].map((platform, index) => (
            <li key={platform}>
              <GameIcon name={game.platformIcons[index] ?? "web"} />
              {platform}
            </li>
          ))}
        </ul>
        <Disclaimer game={game} locale={locale} />
      </div>
      <ul className="kpi" aria-label={t("hero.figures", { game: game.name })}>
        {game.kpis.map((kpi) => (
          <li key={kpi.label.fr}>
            <b>{figureValue(kpi.value, locale)}</b>
            <span>{kpi.label[locale]}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );

  return (
    <section className="fh">
      <div className="wrap">
        <nav className="crumb" aria-label={t("crumb.label")}>
          <Link href="/jeux">{t("crumb.games")}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{game.name}</span>
        </nav>
        {trailer ? (
          <TrailerProvider
            src={trailer.src}
            poster={poster.src}
            label={trailer.caption[locale]}
            counter={t("gallery.trailer")}
            caption={trailer.caption[locale]}
            closeLabel={t("gallery.close")}
          >
            {body}
          </TrailerProvider>
        ) : (
          body
        )}
      </div>
    </section>
  );
}

/** 01: pitch and identity sheet. */
export function GamePitch({ game, locale }: SectionProps) {
  const t = useGamesT("pitch");
  return (
    <section className="sec" id="pitch">
      <div className="wrap pitch">
        <div className="pitch-t">
          <Heading kicker={t("kicker")} title={rich(game.pitchSection.title[locale])} />
          {game.pitchSection.paragraphs[locale].map((paragraph, index) => (
            <Reveal as="p" key={index} delay={(index + 1) * 60}>
              {rich(paragraph)}
            </Reveal>
          ))}
        </div>
        <Reveal as="dl" className="idc" delay={120} aria-label={t("sheet")}>
          {game.facts.map((fact) => (
            <div key={fact.label.fr}>
              <dt>{fact.label[locale]}</dt>
              <dd>{rich(fact.value[locale])}</dd>
            </div>
          ))}
          <div>
            <dt>{t("status")}</dt>
            <dd>
              <span className="st">{game.statusDetail[locale]}</span>
            </dd>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** 02: screenshots with their lightbox. */
export function GameShots({ game, locale }: SectionProps) {
  const t = useGamesT("gallery");
  return (
    <section className="sec" id="captures">
      <div className="wrap">
        <div className="sec-hd">
          <Heading kicker={t("kicker")} title={rich(game.galleryTitle[locale])} />
        </div>
        <GameGallery
          shots={game.media.gallery.map((image) => ({
            src: image.src,
            width: image.width,
            height: image.height,
            alt: image.alt[locale],
            caption: (image.caption ?? image.alt)[locale],
          }))}
          labels={{
            dialog: t("dialog", { game: game.name }),
            enlarge: t("enlarge"),
            close: t("close"),
            prev: t("prev"),
            next: t("next"),
          }}
        />
        <p className="shots-note">
          {game.galleryNote[locale]} {t("hint")}
        </p>
      </div>
    </section>
  );
}

/** 03: the technical challenge, its playable demo and three workstreams. */
export function GameChallenge({ game, locale }: SectionProps) {
  const t = useGamesT("challenge");
  return (
    <section className="sec" id="defi">
      <div className="wrap">
        <div className="sec-hd">
          <Heading
            kicker={t("kicker")}
            title={rich(game.challenge.title[locale])}
            lede={game.challenge.lede[locale]}
          />
        </div>
        <GameDemo game={game.slug} />
        <ol className="chs">
          {game.challenge.items.map((item, index) => (
            <Reveal as="li" className="ch" key={item.title.fr} delay={index * 60}>
              <span className="ch-n">{t("item", { number: String(index + 1).padStart(2, "0") })}</span>
              <h3>{item.title[locale]}</h3>
              <p>{rich(item.body[locale])}</p>
              <ul className="ch-f">
                {item.figures.map((figure) => (
                  <li key={figure.label.fr}>
                    <b>{figureValue(figure.value, locale)}</b>
                    <span>{figure.label[locale]}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** 04: Dylan's role and the stack. */
export function GameRole({ game, locale }: SectionProps) {
  const t = useGamesT("role");
  return (
    <section className="sec" id="role">
      <div className="wrap role">
        <div className="role-t">
          <Heading kicker={t("kicker")} title={rich(game.role.title[locale])} />
          <Reveal as="p" delay={60}>
            {game.role.body[locale]}
          </Reveal>
          <Reveal as="ul" className="did" delay={120}>
            {game.role.items.map((item) => (
              <li key={item.label.fr}>
                <div>
                  {item.label[locale]} <span>{item.detail[locale]}</span>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
        <Reveal className="stack" delay={120}>
          <h3 className="sr">{t("stack")}</h3>
          {game.stack.map((group) => (
            <div className="stack-g" key={group.group.fr}>
              <h4>{group.group[locale]}</h4>
              <ul className="tags">
                {group.items.map((item) => {
                  const name = typeof item.name === "string" ? item.name : item.name[locale];
                  return (
                    <li key={name} className={item.key ? "k" : undefined}>
                      {name}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/** 05: latest news of the game (cards resolved by the page with `toNewsCards`). */
export function GameNews({ game, locale, cards }: SectionProps & { cards: NewsCardData[] }) {
  const t = useGamesT("news");
  const all = (
    <Link className="link" href="/news">
      {t("all", { game: game.name })}
      <Icon name="arrow" />
    </Link>
  );
  return (
    <section className="sec" id="news">
      <div className="wrap">
        <div className="sec-hd">
          <Heading kicker={t("kicker")} title={rich(game.newsTitle[locale])} />
          <Reveal>{all}</Reveal>
        </div>
        <div className={`news is-${cards.length}`}>
          {cards.map((card, index) => (
            <NewsCard key={card.slug} item={card} delay={index * 60} />
          ))}
          {cards.length < 3 && (
            <Reveal className="n-more" delay={cards.length * 60}>
              <b>{t("moreKicker")}</b>
              <p>{t("more", { game: game.name })}</p>
              {all}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

/** Call to action in the game's skin, with the networks to follow. */
export function GamePlay({ game, locale }: SectionProps) {
  const t = useGamesT("play");
  return (
    <section className="sec" id="jouer">
      <div className="wrap">
        <Reveal className={gameSkinClass(game.slug, "play")}>
          <div>
            <GameTitle game={game} as="h2" className="play-t" text={game.callToAction.title[locale]} />
            <p className="tx">{game.callToAction.text[locale]}</p>
            <div className="gh-act">
              <a className="gbtn a" href={game.url} target="_blank" rel="noopener">
                <Icon name="play" />
                {t("now")}
              </a>
            </div>
            <a className="play-url" href={game.url} target="_blank" rel="noopener">
              {game.domain}
            </a>
            <Disclaimer game={game} locale={locale} />
          </div>
          <div>
            <p className="gnets-h">{game.follow[locale]}</p>
            <ul className="gnets">
              {game.socials.map(getSocial).map(
                (social) =>
                  social.url && (
                    <li key={social.id}>
                      <a href={social.url} target="_blank" rel="noopener">
                        <Icon name={social.id} />
                        <span>
                          {social.label}
                          <small>{social.handle}</small>
                        </span>
                      </a>
                    </li>
                  ),
              )}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** One Piexel first, then Iconic and Fastr. */
const OTHERS_ORDER = ["one-piexel", "iconic", "fastr"] as const;

/** 06: the two other games, each in its own skin. */
export function OtherGames({ game, locale }: SectionProps) {
  const t = useGamesT("others");
  const others = OTHERS_ORDER.filter((slug) => slug !== game.slug).map((slug) => games.find((g) => g.slug === slug)!);
  return (
    <section className="sec" id="autres">
      <div className="wrap">
        <div className="sec-hd">
          <Heading kicker={t("kicker")} title={t.rich("title", { em: (chunks) => <em>{chunks}</em> })} />
          <Reveal>
            <Link className="link" href="/jeux">
              {t("all")}
              <Icon name="arrow" />
            </Link>
          </Reveal>
        </div>
        <div className="others">
          {others.map((other, index) => (
            <Reveal key={other.slug} className="mini-w" delay={index * 80}>
              <Link
                className={gameSkinClass(other.slug, "mini")}
                href={{ pathname: "/jeux/[slug]", params: { slug: other.slug } }}
              >
              <div className="mini-img">
                <Image src={other.media.mini} width={720} height={405} alt="" sizes="(min-width: 640px) 300px, 100vw" />
              </div>
              <div className="mini-b">
                <StatusChip>{other.statusShort[locale]}</StatusChip>
                <GameTitle game={other} className="mini-t" />
                <p>{other.teaser[locale]}</p>
                <span className="mini-go">
                  {t("see")}
                  <Icon name="arrow" />
                </span>
              </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
