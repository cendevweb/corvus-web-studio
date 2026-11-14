import { useLocale, useTranslations } from "next-intl";
import { socials } from "@content/site";
import { Availability } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { ContactWho } from "./ContactWho";

const WHO = ["recruiting", "mission", "press", "player"] as const;

/** Home section 05: contact call to action + the studio networks (GitHub and YouTube highlighted). */
export function ContactSection() {
  const t = useTranslations("home.contact");
  const common = useTranslations("common");
  const locale = useLocale();

  return (
    <section className="sec" id="contact">
      <div className="wrap">
        <Reveal className="contact">
          <Availability>{common("available")}</Availability>
          <span className="sec-n">{t("kicker")}</span>
          <h2>{t.rich("title", { em: (chunks) => <em>{chunks}</em> })}</h2>
          <p>{t("text")}</p>
          <ContactWho
            groupLabel={t("whoLabel")}
            options={WHO.map((key) => ({ key, chip: t(`who.${key}.chip`), cta: t(`who.${key}.cta`) }))}
          />
          <ul className="nets" aria-label={t("netsLabel")}>
            {socials.map((social) => {
              const note = social.note?.[locale];
              if (!social.url) {
                return (
                  <li className="off" key={social.id}>
                    <a aria-disabled="true">
                      <Icon name={social.id} />
                      <span>
                        {social.label}
                        {note && <small>{note}</small>}
                      </span>
                    </a>
                  </li>
                );
              }
              if (social.featured) {
                // Live counters are placeholders until the APIs are plugged in.
                const counter =
                  social.id === "github"
                    ? { label: t("starsSoon"), text: "★ – –" }
                    : { label: t("subsSoon"), text: `${t("subscribers")} – –` };
                return (
                  <li className="big" key={social.id}>
                    <a href={social.url} target="_blank" rel="noopener">
                      <Icon name={social.id} />
                      <span>
                        {social.label}
                        {note && <small>{note}</small>}
                      </span>
                      <em aria-label={counter.label}>{counter.text}</em>
                    </a>
                  </li>
                );
              }
              return (
                <li key={social.id}>
                  <a href={social.url} target="_blank" rel="noopener">
                    <Icon name={social.id} />
                    {social.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
