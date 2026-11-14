import { useTranslations } from "next-intl";
import { Availability } from "@/components/ui/Badge";
import { ButtonAnchor } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { HeroCrow } from "./HeroCrow";

const PROOF = ["games", "ranked", "words", "years"] as const;

export function Hero() {
  const t = useTranslations("home.hero");
  const common = useTranslations("common");

  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-grid">
          <div>
            <Reveal as="p" className="eyebrow">
              <Availability>{common("available")}</Availability>
              <span>{t("eyebrow")}</span>
            </Reveal>
            <Reveal as="h1" delay={60}>
              {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
            </Reveal>
            <Reveal as="p" className="lede" delay={120}>
              {t.rich("lede", { strong: (chunks) => <strong>{chunks}</strong> })}
            </Reveal>
            <Reveal className="cta" delay={180}>
              <ButtonAnchor href="#jeux">
                <Icon name="play" />
                {common("play")}
              </ButtonAnchor>
              <ButtonAnchor href="#contact" variant="ghost">
                {common("writeToStudio")}
                <Icon name="arrow" className="arr" />
              </ButtonAnchor>
            </Reveal>
          </div>
          <HeroCrow labels={{ crow: t("crowAlt"), replay: t("crowReplay"), caption: t("crowCaption") }} />
        </div>

        <ul className="proof" aria-label={t("proofLabel")}>
          {PROOF.map((key, index) => (
            <Reveal as="li" key={key} delay={index * 60}>
              <b>{t(`proof.${key}.value`)}</b>
              <span>{t(`proof.${key}.label`)}</span>
            </Reveal>
          ))}
        </ul>

        {/* Live counters: placeholders until the games' APIs are plugged in. */}
        <Reveal as="p" className="livebar">
          <span className="lv">
            <i aria-hidden="true" />
            {t("live")}
          </span>
          <span>
            {t("playersOnline")}
            <b>– –</b>
          </span>
          <span>
            {t("githubStars")}
            <b>– –</b>
          </span>
          <span className="soon">{t("liveSoon")}</span>
        </Reveal>
      </div>
    </section>
  );
}
