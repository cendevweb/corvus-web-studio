import { useLocale, useTranslations } from "next-intl";
import { socials } from "@content/site";
import { Icon } from "@/components/ui/Icon";

/**
 * Grid of the studio networks (GitHub and YouTube highlighted, accounts without a URL shown as "coming soon").
 * Same markup as the home contact section, so it reuses the `.nets` styles and the `home.contact` labels.
 */
export function StudioNetworks() {
  const t = useTranslations("home.contact");
  const locale = useLocale();

  return (
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
  );
}
