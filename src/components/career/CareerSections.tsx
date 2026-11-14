import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { education, productAi, skills, timeline, works } from "@content/career";
import { site } from "@content/site";
import { Availability } from "@/components/ui/Badge";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/i18n/routing";
import { CaseCard } from "./CaseCard";
import { WorkDemo } from "./demos";
import { RichText, typo } from "./RichText";

const em = { em: (chunks: ReactNode) => <em>{chunks}</em> };

/** Intro: who, the CV download, the two pillars and the index of the six achievements. */
export function CareerIntro() {
  const t = useTranslations("careerPage.intro");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;

  return (
    <section className="intro">
      <div className="wrap intro-grid">
        <div>
          <Reveal as="p" className="eyebrow">
            <i />
            {t("eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            {t.rich("title", em)}
          </Reveal>
          <Reveal as="p" className="lede" delay={120}>
            {t.rich("lede", { strong: (chunks) => <strong>{chunks}</strong> })}
          </Reveal>
          <Reveal className="cta" delay={180}>
            <ButtonAnchor href={site.cv} download>
              <Icon name="download" />
              {t("downloadCv")}
            </ButtonAnchor>
            <ButtonLink href="/contact" variant="ghost">
              {common("writeToStudio")}
              <Icon name="arrow" className="arr" />
            </ButtonLink>
          </Reveal>
          <Reveal className="pil" delay={240}>
            <a href="#realisations">
              <b>
                {t("pillars.fullstack.title")}
                <i>{t("pillars.fullstack.tag")}</i>
              </b>
              <span>{t("pillars.fullstack.text")}</span>
            </a>
            <a href="#product-ai">
              <b>
                <em>{t("pillars.ai.title")}</em>
                <i>{t("pillars.ai.tag")}</i>
              </b>
              <span>{t("pillars.ai.text")}</span>
            </a>
          </Reveal>
        </div>

        <Reveal as="nav" className="idx" aria-label={t("indexLabel")} delay={160}>
          <p className="idx-hd">
            <span>{t("indexTitle")}</span>
            <b>{t("indexRange")}</b>
          </p>
          <ol>
            {works.map((work, index) => (
              <li key={work.id}>
                <a href={`#${work.anchor}`}>
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <b>
                    {work.short.title[locale]}
                    <span>{work.short.company}</span>
                  </b>
                  <Icon name="arrow" />
                </a>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/** 01: the six achievements as feature cards, each with its visual slot. */
export function CareerWorks() {
  const t = useTranslations("careerPage.works");
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
  const labels = {
    problem: t("problem"),
    contribution: t("contribution"),
    keyChoice: t("keyChoice"),
    result: t("result"),
    stack: t("stack"),
    slot: t("slot"),
    soon: common("visualSoon"),
  };

  return (
    <section className="sec" id="realisations">
      <div className="wrap">
        <SectionHeading
          kicker={t("kicker")}
          title={t.rich("title", em)}
          aside={
            <Reveal as="p" className="sec-sub">
              {t("sub")}
            </Reveal>
          }
        />
        <div className="cases">
          {works.map((work, index) => (
            <CaseCard
              key={work.id}
              work={work}
              index={index + 1}
              locale={locale}
              labels={labels}
              demo={work.visual.media ? null : <WorkDemo id={work.id} locale={locale} />}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const TERMINAL = ["brief", "agents", "hooks", "review"] as const;

/** 02: AI in the product (GPT-4 at TweetHunter) and in the method (agentic workflow), plus the studio's AI services. */
export function CareerProductAi() {
  const t = useTranslations("careerPage.ai");
  const locale = useLocale() as Locale;
  const [product, method] = productAi.cards;
  const width = Math.max(...TERMINAL.map((line) => t(`terminal.${line}.key`).length)) + 2;

  const card = (data: (typeof productAi.cards)[number], illustration: ReactNode, delay?: number, note?: string) => (
    <Reveal as="article" className="ai-c" delay={delay}>
      <span className="ai-k">{data.kicker[locale]}</span>
      <h3>{data.title[locale]}</h3>
      <p>{typo(data.body[locale], locale)}</p>
      <ul className="ai-l">
        {data.points.map((point) => (
          <li key={point.label.en}>
            <b>{point.label[locale]}</b>
            <span>{point.detail[locale]}</span>
          </li>
        ))}
      </ul>
      <div className="ai-ill" aria-hidden="true">
        {illustration}
      </div>
      {note && <p className="ai-note">{note}</p>}
    </Reveal>
  );

  return (
    <section className="sec" id="product-ai">
      <div className="wrap">
        <div className="sec-hd">
          <SectionHeading kicker={t("kicker")} title={t.rich("title", { ...em, br: () => <br /> })} />
        </div>
        <div className="ai-grid">
          {card(
            product,
            <>
              <p className="ai-draft">
                {t.rich("draft", {
                  del: (chunks) => <del>{chunks}</del>,
                  ins: (chunks) => <ins>{chunks}</ins>,
                  mark: (chunks) => <mark>{chunks}</mark>,
                })}
              </p>
              <p className="ai-acts">
                {product.points.map((point) => (
                  <span key={point.label.en}>{point.label[locale]}</span>
                ))}
              </p>
            </>,
          )}
          {card(
            method,
            <pre className="ai-term">
              {TERMINAL.map((line, index) => (
                <span key={line}>
                  <i>{t(`terminal.${line}.key`)}</i>
                  {" ".repeat(width - t(`terminal.${line}.key`).length)}
                  {"→ "}
                  {index === TERMINAL.length - 1 ? (
                    <b>{t(`terminal.${line}.value`)}</b>
                  ) : (
                    t(`terminal.${line}.value`)
                  )}
                  {index < TERMINAL.length - 1 && "\n"}
                </span>
              ))}
            </pre>,
            80,
            t("note"),
          )}
        </div>
        <Reveal className="ai-svc">
          <h3>{typo(productAi.studio.title[locale], locale)}</h3>
          <p>{typo(productAi.studio.body[locale], locale)}</p>
          <ul aria-label={t("servicesLabel")}>
            {productAi.studio.services[locale].map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/** 03: the timeline, newest first, linking back to the case studies. */
export function CareerTimeline() {
  const t = useTranslations("careerPage.timeline");
  const locale = useLocale() as Locale;

  return (
    <section className="sec" id="chronologie">
      <div className="wrap">
        <SectionHeading
          kicker={t("kicker")}
          title={t.rich("title", em)}
          aside={
            <Reveal as="p" className="sec-sub">
              {t.rich("sub", {
                cv: (chunks) => (
                  <a className="link" href={site.cv} download>
                    {chunks}
                  </a>
                ),
              })}
            </Reveal>
          }
        />
        <ol className="tl" reversed>
          {timeline.map((entry) => {
            const [name, role] = entry.title[locale].split(" · ");
            return (
              <Reveal as="li" key={entry.title.en} className={entry.current ? "now" : undefined}>
                <time>{entry.period[locale]}</time>
                <h3>
                  {name}
                  {role && <span> · {role}</span>}
                </h3>
                <p>
                  <RichText text={entry.body[locale]} locale={locale} />
                </p>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** 04: skills by family (the agentic row is highlighted). */
export function CareerSkills() {
  const t = useTranslations("careerPage.skills");
  const locale = useLocale() as Locale;

  return (
    <section className="sec" id="competences">
      <div className="wrap">
        <SectionHeading
          kicker={t("kicker")}
          title={t.rich("title", em)}
          aside={
            <Reveal as="p" className="sec-sub">
              {t("sub")}
            </Reveal>
          }
        />
        <dl className="sk">
          {skills.map((group, index) => (
            <Reveal key={group.group.en} className={index === skills.length - 1 ? "hi" : undefined}>
              <dt>{group.group[locale]}</dt>
              <dd>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** 05: education and certification. */
export function CareerEducation() {
  const t = useTranslations("careerPage.education");
  const locale = useLocale() as Locale;

  return (
    <section className="sec" id="formation">
      <div className="wrap">
        <div className="sec-hd">
          <SectionHeading kicker={t("kicker")} title={t.rich("title", em)} />
        </div>
        <ul className="edu">
          {education.map((item, index) => (
            <Reveal as="li" key={item.title.en} className={item.certification ? "cert" : undefined} delay={index * 60}>
              <time>{item.period[locale]}</time>
              <h3>{item.title[locale]}</h3>
              <p>
                <RichText text={item.body[locale]} locale={locale} />
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Closing call to action: write to the studio, get the CV, see the games. */
export function CareerContact() {
  const t = useTranslations("careerPage.contact");
  const common = useTranslations("common");

  return (
    <section className="sec" id="contact">
      <div className="wrap">
        <Reveal className="contact">
          <Availability>{common("available")}</Availability>
          <h2>{t.rich("title", em)}</h2>
          <p>{t("text")}</p>
          <div className="cta">
            <ButtonLink href="/contact">
              {common("writeToStudio")}
              <Icon name="arrow" className="arr" />
            </ButtonLink>
            <ButtonAnchor href={site.cv} variant="ghost" download>
              <Icon name="download" />
              {common("cvPdf")}
            </ButtonAnchor>
            <ButtonLink href="/jeux" variant="ghost">
              <Icon name="play" />
              {common("seeGames")}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
