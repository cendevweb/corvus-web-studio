import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { services } from "@content/services";
import { site } from "@content/site";
import { ServiceVisual } from "@/components/services/ServiceVisual";
import { Availability } from "@/components/ui/Badge";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";
import "@/styles/pages/services.css";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.services" });
  return buildMetadata({ locale, href: "/services", title: t("title"), description: t("description") });
}

const DELIVERED = ["d1", "d2", "d3", "d4"] as const;
const STEPS = ["s1", "s2", "s3", "s4"] as const;
const FORMATS = ["fixed", "team", "short"] as const;

const number = (index: number) => String(index + 1).padStart(2, "0");

export default async function ServicesPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "servicesPage" });
  const common = await getTranslations({ locale, namespace: "common" });

  const em = (chunks: React.ReactNode) => <em>{chunks}</em>;
  const price = (
    <span className="price">{t.rich("list.price", { b: (chunks) => <b>{chunks}</b> })}</span>
  );

  return (
    <div className="pg-services">
      <section className="ph">
        <div className="wrap ph-grid">
          <div>
            <Reveal as="p" className="eyebrow">
              <Availability>{common("available")}</Availability>
              <span>{t("hero.eyebrow")}</span>
            </Reveal>
            <Reveal as="h1" delay={60}>
              {t.rich("hero.title", { em })}
            </Reveal>
            <Reveal as="p" className="lede" delay={120}>
              {t.rich("hero.lede", { strong: (chunks) => <strong>{chunks}</strong> })}
            </Reveal>
            <Reveal className="cta" delay={180}>
              <ButtonLink href="/contact">
                {t("hero.cta")}
                <Icon name="arrow" className="arr" />
              </ButtonLink>
              <ButtonAnchor href="#process" variant="ghost">
                {t("hero.ctaProcess")}
              </ButtonAnchor>
            </Reveal>
          </div>
          <Reveal as="nav" className="card idx" aria-label={t("index.label")} delay={120}>
            <p className="idx-h">
              <span>{t("index.head")}</span>
              <span>{number(services.length - 1)}</span>
            </p>
            {services.map((service, index) => (
              <a key={service.id} href={`#${service.anchor}`}>
                <b>{number(index)}</b>
                <span>
                  {t(`items.${service.id}.indexTitle`)}
                  <small>{t(`items.${service.id}.indexNote`)}</small>
                </span>
                <Icon name="arrow" />
              </a>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sec" id="services">
        <div className="wrap">
          <div className="sec-hd">
            <SectionHeading kicker={t("list.kicker")} title={t.rich("list.title", { em })} />
          </div>
          <div className="svs">
            {services.map((service, index) => (
              <Reveal
                as="article"
                key={service.id}
                className="card sv"
                id={service.anchor}
                aria-labelledby={`h-${service.anchor}`}
              >
                <div className="sv-a">
                  <p className="sv-n">
                    <i aria-hidden="true" />
                    {number(index)} / {t(`items.${service.id}.short`)}
                  </p>
                  <h3 id={`h-${service.anchor}`}>{t.rich(`items.${service.id}.title`, { em })}</h3>
                  <p>{t(`items.${service.id}.text`)}</p>
                  <ul className="tags" aria-label={t("list.techLabel")}>
                    {service.tags.map((tag) => {
                      const label = typeof tag === "string" ? tag : tag[locale];
                      return <li key={label}>{label}</li>;
                    })}
                  </ul>
                  <p className="proofline">
                    {t.rich(`items.${service.id}.proof`, { b: (chunks) => <b>{chunks}</b> })}
                  </p>
                  <div className="sv-foot">
                    {price}
                    <Link className="link" href={service.href}>
                      {t(`items.${service.id}.link`)}
                      <Icon name="arrow" />
                    </Link>
                  </div>
                </div>
                <div className="sv-b">
                  <ServiceVisual id={service.id} />
                  <div>
                    <h4>{t("list.delivered")}</h4>
                    <ul className="ticks">
                      {DELIVERED.map((key) => (
                        <li key={key}>
                          {t.rich(`items.${service.id}.${key}`, { code: (chunks) => <code>{chunks}</code> })}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="process">
        <div className="wrap">
          <div className="sec-hd">
            <SectionHeading kicker={t("process.kicker")} title={t.rich("process.title", { em })} />
          </div>
          <Reveal as="ol" className="steps">
            {STEPS.map((key, index) => (
              <li className="step" key={key}>
                <b>{number(index)}</b>
                <h3>{t(`process.steps.${key}.title`)}</h3>
                <p>{t(`process.steps.${key}.text`)}</p>
                <small>{t(`process.steps.${key}.note`)}</small>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sec" id="formats">
        <div className="wrap">
          <div className="sec-hd">
            <SectionHeading kicker={t("formats.kicker")} title={t.rich("formats.title", { em })} />
          </div>
          <div className="fmts">
            {FORMATS.map((key, index) => (
              <Reveal as="article" className="card fmt" key={key} delay={index * 60}>
                <span className="pxl">{t(`formats.items.${key}.tag`)}</span>
                <h3>{t(`formats.items.${key}.title`)}</h3>
                <p>{t(`formats.items.${key}.text`)}</p>
                {price}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="contact">
        <div className="wrap">
          <Reveal className="contact cta-band">
            <Availability>{common("available")}</Availability>
            <span className="sec-n">{t("contact.kicker")}</span>
            <h2>{t.rich("contact.title", { em })}</h2>
            <p>{t("contact.text")}</p>
            <div className="cta">
              <ButtonLink href="/contact">
                {common("writeToStudio")}
                <Icon name="arrow" className="arr" />
              </ButtonLink>
              <ButtonAnchor href={site.cv} variant="ghost" download>
                <Icon name="download" />
                {common("cvPdf")}
              </ButtonAnchor>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
