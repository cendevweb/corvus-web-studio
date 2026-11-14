import Image from "next/image";
import { useTranslations } from "next-intl";
import { mainNav, site } from "@content/site";
import { Link } from "@/i18n/navigation";
import { SocialLinks } from "./SocialLinks";

/** Site footer: navigation, legal notice, real studio networks, One Piexel fan-game note, © 2026. */
export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const header = useTranslations("header");

  return (
    <footer className="ft">
      <div className="wrap ft-in">
        <Link className="brand" href="/" aria-label={header("brandLabel")}>
          <Image src="/images/brand/corbeau-logo.png" width={51} height={38} alt="" unoptimized />
          <span>Corvus Web Studio</span>
        </Link>
        <nav className="ft-l" aria-label={t("nav")}>
          {mainNav
            .filter((item) => item.key !== "contact")
            .map((item) => (
              <Link key={item.key} href={item.href}>
                {nav(item.key)}
              </Link>
            ))}
          <Link href="/mentions-legales">{nav("legal")}</Link>
        </nav>
        <span>{t("copyright", { year: site.year })}</span>
        <div className="ft-end">
          <small>{t("fanGame")}</small>
          <SocialLinks
            className="ft-soc"
            label={header("networks")}
            linkLabel={(label) => header("newTab", { label })}
          />
        </div>
      </div>
    </footer>
  );
}
