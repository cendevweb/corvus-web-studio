import type { CSSProperties } from "react";
import { games } from "@content/games";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { GameCard } from "./GameCard";
import { useGamesT } from "./t";

/** One Piexel as the showcase, then Iconic and Fastr. */
const ORDER = ["one-piexel", "iconic", "fastr"] as const;

/** Games list (/jeux): page title, then the three showcase cards of the home page. */
export function GamesList() {
  const t = useGamesT("list");
  return (
    <div className="gl">
      <section className="gl-hero">
        <div className="wrap">
          <Reveal>
            <span className="sec-n">{t("kicker")}</span>
            <h1>{t.rich("title", { em: (chunks) => <em>{chunks}</em> })}</h1>
            <p className="gl-lede">{t("lede")}</p>
            <ul className="gl-facts" aria-label={t("gamesLabel")}>
              {ORDER.map((slug) => {
                const game = games.find((g) => g.slug === slug)!;
                return (
                  <li key={slug} style={{ "--c": game.colors.tag } as CSSProperties}>
                    <i aria-hidden="true" />
                    {game.name}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>
      <section className="sec" aria-label={t("gamesLabel")}>
        <div className="wrap">
          <div className="games">
            {ORDER.map((slug, index) => (
              <GameCard key={slug} slug={slug} heading="h2" delay={index === 2 ? 80 : undefined} />
            ))}
          </div>
          <Reveal className="gl-more">
            <p>{t("moreText")}</p>
            <div>
              <Link className="link" href="/news">
                {t("moreNews")}
                <Icon name="arrow" />
              </Link>
              <Link className="link" href="/nid">
                {t("moreNest")}
                <Icon name="arrow" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
