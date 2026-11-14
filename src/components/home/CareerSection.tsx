import { useLocale, useTranslations } from "next-intl";
import { works } from "@content/career";
import { site } from "@content/site";
import { WorkVisual } from "@/components/career/WorkVisual";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const FACTS = ["years", "senior", "ai", "aws"] as const;

/** Home section 03: career in brief (sticky intro + six achievement cards). */
export function CareerSection() {
  const t = useTranslations("home.career");
  const common = useTranslations("common");
  const locale = useLocale();
  const bold = { b: (chunks: React.ReactNode) => <b>{chunks}</b> };

  return (
    <section className="sec" id="parcours">
      <div className="wrap par">
        <div className="par-intro">
          <SectionHeading kicker={t("kicker")} title={t.rich("title", { em: (chunks) => <em>{chunks}</em> })} />
          <Reveal as="p" delay={60}>
            {t.rich("text", { strong: (chunks) => <strong>{chunks}</strong> })}
          </Reveal>
          <Reveal as="ul" className="facts" delay={120}>
            {FACTS.map((key) => (
              <li key={key}>{t.rich(`facts.${key}`, bold)}</li>
            ))}
          </Reveal>
          <Reveal className="par-cta" delay={180}>
            <ButtonLink href="/parcours" size="sm">
              {t("cta")}
              <Icon name="arrow" className="arr" />
            </ButtonLink>
            <ButtonAnchor href={site.cv} variant="ghost" size="sm">
              <Icon name="download" />
              {common("cvPdf")}
            </ButtonAnchor>
          </Reveal>
          <Reveal as="p" className="ai" delay={240}>
            {t.rich("ai", bold)}
          </Reveal>
        </div>

        <ul className="works">
          {works.map((work, index) => (
            <Reveal as="li" className="w" key={work.id} delay={index % 2 ? 60 : 0}>
              <WorkVisual id={work.id} tag={common("visualSoon")} ifLabel={locale === "fr" ? "si" : "if"} />
              <p className="w-co">
                <span>{work.card.company}</span>
                <span>{work.card.tag[locale]}</span>
              </p>
              <h3>{work.title[locale]}</h3>
              <p>{work.card.summary[locale]}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
