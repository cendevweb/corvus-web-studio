import { useTranslations } from "next-intl";
import { GameCard } from "@/components/games/GameCard";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";

/** Home section 01: One Piexel as a full-width showcase, Fastr and Iconic below. */
export function FeaturedGames() {
  const t = useTranslations("home.games");

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
          <GameCard slug="one-piexel" />
          <GameCard slug="fastr" />
          <GameCard slug="iconic" delay={80} />
        </div>
      </div>
    </section>
  );
}
