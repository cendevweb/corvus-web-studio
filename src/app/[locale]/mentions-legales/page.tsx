import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.legal" });
  return buildMetadata({ locale, href: "/mentions-legales", title: t("title"), description: t("description") });
}

const SECTIONS = ["publisher", "host", "data", "cookies", "analytics", "ip"] as const;
const PUBLISHER_ROWS = ["name", "tradeName", "status", "siret", "address", "director", "contact"] as const;
const HOST_ROWS = ["name", "address", "site"] as const;
const DATA_ITEMS = ["purpose", "basis", "recipients", "retention", "rights"] as const;

const number = (index: number) => String(index + 1).padStart(2, "0");

/** Legal notice: plain text page, no mockup. Fields still to be provided render as "[à compléter]". */
export default async function LegalPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "legalPage" });

  const rich = {
    b: (chunks: ReactNode) => <strong>{chunks}</strong>,
    link: (chunks: ReactNode) => <Link href="/contact">{chunks}</Link>,
    todo: () => <mark className="todo">{t("todo")}</mark>,
  };

  const heading = (key: (typeof SECTIONS)[number]) => (
    <h2 id={`legal-${key}`}>
      <span aria-hidden="true">{number(SECTIONS.indexOf(key))}</span>
      {t(`${key}.title`)}
    </h2>
  );

  return (
    <div className="pg-legal">
      <section className="ph">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">
            <i aria-hidden="true" />
            {t("hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            {t.rich("hero.title", { em: (chunks) => <em>{chunks}</em> })}
          </Reveal>
          <Reveal as="p" className="lede" delay={120}>
            {t("hero.lede")}
          </Reveal>
        </div>
      </section>

      <div className="wrap lg">
        <nav className="lg-toc" aria-label={t("tocLabel")}>
          <ol>
            {SECTIONS.map((key, index) => (
              <li key={key}>
                <a href={`#legal-${key}`}>
                  <b>{number(index)}</b>
                  {t(`${key}.title`)}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="lg-body">
          <section aria-labelledby="legal-publisher">
            {heading("publisher")}
            <p>{t("publisher.intro")}</p>
            <dl>
              {PUBLISHER_ROWS.map((row) => (
                <div key={row}>
                  <dt>{t(`publisher.${row}`)}</dt>
                  <dd>{t.rich(`publisher.${row}Value`, rich)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="legal-host">
            {heading("host")}
            <p>{t("host.intro")}</p>
            <dl>
              {HOST_ROWS.map((row) => (
                <div key={row}>
                  <dt>{t(`host.${row}`)}</dt>
                  <dd>
                    {row === "site" ? (
                      <a href="https://vercel.com" target="_blank" rel="noopener">
                        {t("host.siteValue")}
                      </a>
                    ) : (
                      t(`host.${row}Value`)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="legal-data">
            {heading("data")}
            <p>{t.rich("data.p1", rich)}</p>
            <ul>
              {DATA_ITEMS.map((item) => (
                <li key={item}>{t.rich(`data.items.${item}`, rich)}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="legal-cookies">
            {heading("cookies")}
            <p>{t.rich("cookies.p1", rich)}</p>
            <p>{t("cookies.p2")}</p>
          </section>

          <section aria-labelledby="legal-analytics">
            {heading("analytics")}
            <p>{t.rich("analytics.p1", rich)}</p>
          </section>

          <section aria-labelledby="legal-ip">
            {heading("ip")}
            <p>{t("ip.p1")}</p>
            <p>{t("ip.p2")}</p>
            <p>{t.rich("ip.p3", rich)}</p>
            <p>{t("ip.p4")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
