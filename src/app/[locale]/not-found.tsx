import { useTranslations } from "next-intl";
import { NotFoundScene } from "@/components/contact/NotFoundScene";
import { ContactIcon } from "@/components/contact/icons";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** 404: the crow takes off from the "0" and leaves the frame (scene validated in the contact mockup). */
export default function NotFound() {
  const t = useTranslations("contactPage.notFound");
  const common = useTranslations("common");

  return (
    <section className="pg-404">
      <div className="wrap">
        <NotFoundScene recallLabel={t("recall")} urlLabel={t("urlLabel")}>
          <p className="nf-cap">{t.rich("caption", { b: (chunks) => <b>{chunks}</b> })}</p>
          <h1>{t.rich("title", { em: (chunks) => <em>{chunks}</em> })}</h1>
          <p className="d">{t("text")}</p>
          <div className="nf-act">
            <ButtonLink href="/">
              <ContactIcon name="back" />
              {common("backHome")}
            </ButtonLink>
            <ButtonLink href="/jeux" variant="ghost">
              <Icon name="play" />
              {common("seeGames")}
            </ButtonLink>
          </div>
        </NotFoundScene>
      </div>
    </section>
  );
}
