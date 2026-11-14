import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { site } from "@content/site";
import { StudioNetworks } from "@/components/about/StudioNetworks";
import { HeroCrow } from "@/components/home/HeroCrow";
import { Availability } from "@/components/ui/Badge";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { personJsonLd } from "@/lib/jsonld";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.about" });
  return buildMetadata({ locale, href: "/a-propos", title: t("title"), description: t("description") });
}

const PROOF = ["years", "games", "fighters", "icons"] as const;
const FACTS = ["years", "senior", "ai", "stack"] as const;
const TIMELINE = ["t1", "t2", "t3", "t4", "t5"] as const;
const VALUES = ["precision", "sobriety", "autonomy", "transparency"] as const;

/** What the studio does: each card leads to the matching page (or service anchor, shared by both languages). */
const DOES = [
  { key: "games", href: "/jeux" },
  { key: "web", href: { pathname: "/services", hash: "web" } },
  { key: "ai", href: { pathname: "/services", hash: "ia" } },
  { key: "components", href: "/nid" },
] as const;

const number = (index: number) => String(index + 1).padStart(2, "0");

export default async function AboutPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const common = await getTranslations({ locale, namespace: "common" });

  const em = (chunks: ReactNode) => <em>{chunks}</em>;
  const strong = (chunks: ReactNode) => <strong>{chunks}</strong>;

  return (
    <div className="pg-about">
      <JsonLd data={personJsonLd(locale)} />

      <section className="ph">
        <div className="wrap">
          <div className="ph-grid">
            <div>
              <Reveal as="p" className="eyebrow">
                <i aria-hidden="true" />
                {t("hero.eyebrow")}
              </Reveal>
              <Reveal as="h1" delay={60}>
                {t.rich("hero.title", { em })}
              </Reveal>
              <Reveal as="p" className="lede" delay={120}>
                {t.rich("hero.lede", { strong })}
              </Reveal>
              <Reveal className="cta" delay={180}>
                <ButtonLink href="/parcours">
                  {t("hero.cta")}
                  <Icon name="arrow" className="arr" />
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost">
                  {common("writeToStudio")}
                </ButtonLink>
              </Reveal>
            </div>
            <HeroCrow
              labels={{ crow: t("hero.crowAlt"), replay: t("hero.crowReplay"), caption: t("hero.crowCaption") }}
            />
          </div>
          <ul className="proof" aria-label={t("hero.proofLabel")}>
            {PROOF.map((key, index) => (
              <Reveal as="li" key={key} delay={index * 60}>
                <b>{t(`hero.proof.${key}.value`)}</b>
                <span>{t(`hero.proof.${key}.label`)}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec" id="dylan">
        <div className="wrap two">
          <div className="two-l">
            <SectionHeading kicker={t("dylan.kicker")} title={t.rich("dylan.title", { em })} />
            <Reveal as="p" delay={60}>
              {t.rich("dylan.p1", { strong })}
            </Reveal>
            <Reveal as="p" delay={100}>
              {t.rich("dylan.p2", { strong })}
            </Reveal>
            <Reveal as="ul" className="facts" delay={140}>
              {FACTS.map((key) => (
                <li key={key}>{t.rich(`dylan.facts.${key}`, { b: (chunks) => <b>{chunks}</b> })}</li>
              ))}
            </Reveal>
          </div>
          <Reveal className="card tl" delay={80}>
            <ol aria-label={t("dylan.timelineLabel")}>
              {TIMELINE.map((key) => (
                <li key={key}>
                  <time>{t(`dylan.timeline.${key}.period`)}</time>
                  <div>
                    <b>{t(`dylan.timeline.${key}.title`)}</b>
                    <span>{t(`dylan.timeline.${key}.text`)}</span>
                  </div>
                </li>
              ))}
            </ol>
            <div className="tl-ft">
              <ButtonLink href="/parcours" size="sm">
                {t("dylan.fullCareer")}
                <Icon name="arrow" className="arr" />
              </ButtonLink>
              <ButtonAnchor href={site.cv} variant="ghost" size="sm" download>
                <Icon name="download" />
                {common("cvPdf")}
              </ButtonAnchor>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec" id="studio">
        <div className="wrap">
          <SectionHeading
            kicker={t("studio.kicker")}
            title={t.rich("studio.title", { em })}
            aside={
              <Reveal>
                <Link className="link" href="/services">
                  {t("studio.link")}
                  <Icon name="arrow" />
                </Link>
              </Reveal>
            }
          />
          <div className="does">
            {DOES.map((item, index) => (
              <Reveal key={item.key} delay={index * 60}>
                <Link className="card do" href={item.href}>
                  <b>{number(index)}</b>
                  <h3>{t(`studio.items.${item.key}.title`)}</h3>
                  <p>{t(`studio.items.${item.key}.text`)}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="corbeau">
        <div className="wrap">
          <Reveal className="card totem">
            <div className="totem-crow" role="img" aria-label={t("crow.alt")} />
            <div>
              <span className="sec-n">{t("crow.kicker")}</span>
              <h2>{t.rich("crow.title", { em })}</h2>
              <p>{t.rich("crow.p1", { strong, em: (chunks) => <em lang="la">{chunks}</em> })}</p>
              <p>{t("crow.p2")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec" id="valeurs">
        <div className="wrap">
          <div className="sec-hd">
            <SectionHeading kicker={t("values.kicker")} title={t.rich("values.title", { em })} />
          </div>
          <div className="vals">
            {VALUES.map((key, index) => (
              <Reveal className="val" key={key}>
                <b>{number(index)}</b>
                <h3>{t(`values.items.${key}.title`)}</h3>
                <p>{t(`values.items.${key}.text`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="liens">
        <div className="wrap">
          <Reveal className="contact cta-band">
            <Availability>{common("available")}</Availability>
            <span className="sec-n">{t("links.kicker")}</span>
            <h2>{t.rich("links.title", { em })}</h2>
            <p>{t("links.text")}</p>
            <div className="cta">
              <ButtonLink href="/contact">
                {common("writeToStudio")}
                <Icon name="arrow" className="arr" />
              </ButtonLink>
              <ButtonLink href="/services" variant="ghost">
                {t("links.services")}
              </ButtonLink>
            </div>
            <StudioNetworks />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
