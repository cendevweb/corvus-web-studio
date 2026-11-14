import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Badge } from "./Badge";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";

interface PagePlaceholderProps {
  /** Page title; wrap the accent in <em>. */
  title: ReactNode;
  lede?: ReactNode;
  /** Extra content under the notice (lists of links, etc.). */
  children?: ReactNode;
}

/** Skeleton used by routes that are not integrated yet: title + "en construction" notice. */
export function PagePlaceholder({ title, lede, children }: PagePlaceholderProps) {
  const t = useTranslations("wip");
  const common = useTranslations("common");

  return (
    <section className="ph">
      <div className="wrap">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
        <div className="ph-wip">
          <Badge tone="soon">{t("badge")}</Badge>
          <span>{t("text")}</span>
        </div>
        {children}
        <div className="ph-cta">
          <ButtonLink href="/">
            {common("backHome")}
            <Icon name="arrow" className="arr" />
          </ButtonLink>
          <ButtonLink href="/contact" variant="ghost">
            {common("writeToStudio")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
