import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { site, socials } from "@content/site";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactTypeProvider, DelayNote } from "@/components/contact/ContactType";
import { ContactIcon } from "@/components/contact/icons";
import { ButtonAnchor } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { clientMessages } from "@/i18n/client-messages";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { buildMetadata } from "@/lib/seo";
import "@/styles/pages/contact.css";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return buildMetadata({ locale, href: "/contact", title: t("title"), description: t("description") });
}

export default async function ContactPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "contactPage" });
  const common = await getTranslations({ locale, namespace: "common" });
  const header = await getTranslations({ locale, namespace: "header" });
  const formMessages = await clientMessages(locale, ["contactPage.form", "contactPage.ok"]);

  return (
    <div className="pg-contact">
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
            {t.rich("hero.lede", { strong: (chunks) => <strong>{chunks}</strong> })}
          </Reveal>
        </div>
      </section>

      <section aria-label={t("sectionLabel")}>
        {/* The form is the only client code here: it gets its two namespaces, not the whole catalogue. */}
        <NextIntlClientProvider messages={formMessages}>
          <ContactTypeProvider>
            <div className="wrap ct">
              <Reveal className="fc">
                <ContactForm />
              </Reveal>

              <aside className="side" aria-label={t("aside.label")}>
                <Reveal className="card sc">
                  <h2>{t("aside.availability.title")}</h2>
                  <p className="sc-avail">
                    <i aria-hidden="true" />
                    {common("available")}
                  </p>
                  <p>{t("aside.availability.text")}</p>
                  <dl className="sc-facts">
                    <div>
                      <dt>
                        <ContactIcon name="pin" />
                        {t("aside.availability.base")}
                      </dt>
                      <dd>{t("aside.availability.baseValue")}</dd>
                    </div>
                    <div>
                      <dt>
                        <ContactIcon name="clock" />
                        {t("aside.availability.experience")}
                      </dt>
                      <dd>{t("aside.availability.experienceValue")}</dd>
                    </div>
                    <div>
                      <dt>
                        <ContactIcon name="mail" />
                        {t("aside.availability.meeting")}
                      </dt>
                      <dd>{t("aside.availability.meetingValue")}</dd>
                    </div>
                  </dl>
                  <ButtonAnchor href={site.cv} variant="ghost" size="sm" download>
                    <Icon name="download" />
                    {common("cvPdf")}
                  </ButtonAnchor>
                </Reveal>

                <Reveal className="card sc">
                  <h2>{t("aside.delay.title")}</h2>
                  <p className="delay">
                    <b>{t("aside.delay.value")}</b>
                    <span>{t("aside.delay.note")}</span>
                  </p>
                  <DelayNote />
                </Reveal>

                <Reveal className="card sc">
                  <h2>{t("aside.nets.title")}</h2>
                  <ul className="sc-nets">
                    {socials.map((social) => (
                      <li key={social.id}>
                        {social.url ? (
                          <a
                            className={social.featured ? "top" : undefined}
                            href={social.url}
                            target="_blank"
                            rel="noopener"
                            aria-label={header("newTab", { label: `${social.label} ${t(`aside.nets.${social.id}`)}` })}
                          >
                            <Icon name={social.id} />
                            {social.label}
                            <small>{t(`aside.nets.${social.id}`)}</small>
                          </a>
                        ) : (
                          <span className="off">
                            <Icon name={social.id} />
                            {social.label}
                            <small>{t(`aside.nets.${social.id}`)}</small>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </aside>
            </div>
          </ContactTypeProvider>
        </NextIntlClientProvider>
      </section>
    </div>
  );
}
