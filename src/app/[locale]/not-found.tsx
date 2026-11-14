import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** 404. Skeleton: the "crow flies away" scene is previewed in the contact mockup (pages-a/contact). */
export default function NotFound() {
  const t = useTranslations("notFound");
  const common = useTranslations("common");

  return (
    <section className="ph">
      <div className="wrap">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t.rich("title", { em: (chunks) => <em>{chunks}</em> })}</h1>
        <p className="lede">{t("text")}</p>
        <div className="ph-cta">
          <ButtonLink href="/">
            {common("backHome")}
            <Icon name="arrow" className="arr" />
          </ButtonLink>
          <ButtonLink href="/jeux" variant="ghost">
            {common("seeGames")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
