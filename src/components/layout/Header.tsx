"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore } from "react";
import { featuredSocials, mainNav } from "@content/site";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/i18n/navigation";
import { useInternalRoute } from "@/i18n/use-route";
import { cn } from "@/lib/cn";
import { LocaleSwitch } from "./LocaleSwitch";
import { SocialLinks } from "./SocialLinks";
import { ThemeToggle } from "./ThemeToggle";

// The palette (cmdk + Radix Dialog) is only downloaded the first time it is opened.
const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

const FEATURED_IDS = featuredSocials.map((s) => s.id);
const noopSubscribe = () => () => {};
const subscribeScroll = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};
const isScrolled = () => window.scrollY > 8;
const isApple = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/**
 * The single site header: brand, main navigation, ⌘K palette, FR/EN, theme, GitHub + YouTube.
 * Below 1140px the navigation collapses into the burger menu.
 */
export function Header() {
  const t = useTranslations("header");
  const nav = useTranslations("nav");
  const { pathname, known } = useInternalRoute();
  const stuck = useSyncExternalStore(subscribeScroll, isScrolled, () => false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteLoaded, setPaletteLoaded] = useState(false);
  const apple = useSyncExternalStore(noopSubscribe, isApple, () => false);

  const openPalette = () => {
    setMenuOpen(false);
    setPaletteLoaded(true);
    setPaletteOpen(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenuOpen(false);
        setPaletteLoaded(true);
        setPaletteOpen((open) => !open);
      } else if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isCurrent = (href: string) => known && (pathname === href || pathname.startsWith(`${href}/`));
  const linkLabel = (label: string) => t("newTab", { label });

  return (
    <header className={cn("hd", (stuck || menuOpen) && "is-stuck")}>
      <div className="wrap hd-in">
        <Link className="brand" href="/" aria-label={t("brandLabel")} onClick={() => setMenuOpen(false)}>
          <Image src="/images/brand/corbeau-logo.png" width={51} height={38} alt="" unoptimized priority />
          <span>Corvus Web Studio</span>
        </Link>

        <nav className="nav" aria-label={t("mainNav")}>
          {mainNav.map((item) => (
            <Link key={item.key} href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined}>
              {nav(item.key)}
            </Link>
          ))}
        </nav>

        <div className="tools">
          <button
            type="button"
            className="kbtn"
            aria-haspopup="dialog"
            aria-label={t("openPalette")}
            onClick={openPalette}
          >
            <Icon name="search" />
            <kbd suppressHydrationWarning>{apple ? "⌘K" : "Ctrl K"}</kbd>
          </button>
          <LocaleSwitch />
          <ThemeToggle />
          <SocialLinks ids={FEATURED_IDS} className="soc" label={t("networks")} linkLabel={linkLabel} />
        </div>

        <button
          type="button"
          className="burger"
          aria-expanded={menuOpen}
          aria-controls="menu"
          aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i />
        </button>
      </div>

      <div className={cn("menu", menuOpen && "is-open")} id="menu">
        <nav aria-label={t("mobileNav")}>
          {mainNav.map((item, index) => (
            <Link
              key={item.key}
              className="m"
              href={item.href}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {nav(item.key)} <small>{String(index + 1).padStart(2, "0")}</small>
            </Link>
          ))}
        </nav>
        <div className="menu-tools">
          <button type="button" className="kbtn" aria-haspopup="dialog" onClick={openPalette}>
            <Icon name="search" />
            {t("search")}
          </button>
          <LocaleSwitch />
        </div>
        <SocialLinks ids={FEATURED_IDS} className="soc" label={t("networks")} linkLabel={linkLabel} />
      </div>

      {paletteLoaded && <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />}
    </header>
  );
}
