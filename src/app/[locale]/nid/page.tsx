import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { getGame } from "@content/games";
import { experimentFilters, experiments, type Experiment, type ExperimentDemo } from "@content/nest";
import { CrowLab } from "@/components/nest/CrowLab";
import { IconGridLab } from "@/components/nest/IconGridLab";
import { NestExplorer, type NestCard } from "@/components/nest/NestExplorer";
import { RoundTimerLab } from "@/components/nest/RoundTimerLab";
import { SoonVisual } from "@/components/nest/SoonVisual";
import { CopyAction } from "@/components/news/CopyAction";
import { LineIcon } from "@/components/news/icons";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { highlight } from "@/lib/highlight";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { getPageTranslations, type PageTranslator } from "@/lib/page-messages";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.nest" });
  return buildMetadata({ locale, href: "/nid", title: t("title"), description: t("description") });
}

/** Full, playable version of each experiment (the home page uses the compact ones of `demos.tsx`). */
const LABS: Record<ExperimentDemo, ComponentType> = {
  "crow-follow": CrowLab,
  "round-timer": RoundTimerLab,
  "icon-grid": IconGridLab,
};

const STUDIO_COLOR = "#7C5CFF";

/** `Backticks` in the content mark inline code. */
const withCode = (text: string): ReactNode[] =>
  text.split("`").map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part));

function IdLine({ experiment, locale, t }: { experiment: Experiment; locale: Locale; t: PageTranslator }) {
  const game = experiment.from ? getGame(experiment.from) : undefined;
  const playable = experiment.status === "playable";
  return (
    <p className="x-id">
      <span>{t("number", { n: experiment.number })}</span>
      <span className={playable ? "st ok" : "st wip"}>
        {playable && <i aria-hidden="true" />}
        {playable ? t("playable") : t("soon")}
      </span>
      <span className="from" style={{ "--c": game?.colors.tag ?? STUDIO_COLOR } as CSSProperties}>
        <i aria-hidden="true" />
        {(playable && experiment.origin?.[locale]) || game?.name || t("studio")}
      </span>
    </p>
  );
}

export default async function NestPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getPageTranslations(locale, "nestPage");
  const filterTags = experimentFilters[locale];

  const cards: NestCard[] = experiments.map((experiment) => {
    const tags = experiment.tags.page[locale];
    const title = experiment.title.page[locale];

    if (experiment.status === "soon") {
      return {
        id: experiment.id,
        kind: "soon",
        tags,
        head: (
          <>
            <div className="soon-vis night" aria-hidden="true">
              <SoonVisual id={experiment.id} caption={t.has(`visuals.${experiment.id}`) ? t(`visuals.${experiment.id}`) : undefined} />
              <span className="w-tag">{t("visualSoon")}</span>
            </div>
            <IdLine experiment={experiment} locale={locale} t={t} />
            <h3>{title}</h3>
            <p>{experiment.description.page[locale]}</p>
          </>
        ),
      };
    }

    const Lab = experiment.demo ? LABS[experiment.demo] : null;
    const code = experiment.code;
    return {
      id: experiment.id,
      kind: "playable",
      tags,
      head: (
        <>
          <IdLine experiment={experiment} locale={locale} t={t} />
          <h2 id={`x-${experiment.id}`}>{title}</h2>
        </>
      ),
      text: <p>{experiment.description.page[locale]}</p>,
      body: (
        <>
          {experiment.how && (
            <details className="how" open>
              <summary>{t("how")}</summary>
              <ol>
                {experiment.how[locale].map((step) => (
                  <li key={step}>
                    <span>{withCode(step)}</span>
                  </li>
                ))}
              </ol>
            </details>
          )}
          <div className="x-body">
            {Lab && <Lab />}
            {code && (
              <div className="x-code night">
                <p className="code-h">
                  <span>
                    <LineIcon name="code" />
                    {code.filename}
                    <em>{t("licence")}</em>
                  </span>
                  <CopyAction
                    source={{ text: code.full }}
                    label={t("copy")}
                    copiedLabel={t("copied")}
                    ariaLabel={t("copyCode", { file: code.filename })}
                  />
                </p>
                <pre tabIndex={0} aria-label={t("source", { file: code.filename })}>
                  <code>{highlight(code.full)}</code>
                </pre>
              </div>
            )}
          </div>
        </>
      ),
    };
  });

  const countFor = (tag: string) => cards.filter((card) => card.tags.includes(tag)).length;
  const filters = [
    { key: "all", label: t("all"), summary: t("count", { count: cards.length }) },
    ...filterTags.map((tag) => ({ key: tag, label: tag, summary: `${t("count", { count: countFor(tag) })} · ${tag}` })),
  ];
  const playable = cards.filter((card) => card.kind === "playable").length;

  return (
    <div className="pg-nest">
      <section className="ph">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">
            <i aria-hidden="true" />
            {t("eyebrow", { playable, soon: cards.length - playable })}
          </Reveal>
          <Reveal as="h1" delay={60}>
            {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
          </Reveal>
          <Reveal as="p" className="lede" delay={120}>
            {t.rich("lede", { strong: (chunks) => <strong>{chunks}</strong> })}
          </Reveal>
        </div>
      </section>

      <NestExplorer
        filters={filters}
        cards={cards}
        filterLabel={t("filterLabel")}
        listLabel={t("listLabel")}
        soonTitle={t("soonTitle")}
      >
        <Reveal className="idea">
          <p>{t.rich("idea.text", { em: (chunks) => <em>{chunks}</em> })}</p>
          <Link className="btn btn-main" href="/contact">
            {t("idea.cta")}
            <Icon name="arrow" className="arr" />
          </Link>
        </Reveal>
      </NestExplorer>
    </div>
  );
}
