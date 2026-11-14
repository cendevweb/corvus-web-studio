"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useRouter as useNextRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { games } from "@content/games";
import { mainNav, site, socials } from "@content/site";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "@/i18n/navigation";
import { useLocalizedPath } from "@/i18n/use-route";
import { toggleTheme } from "@/lib/theme";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Element that gets the focus back when the palette closes. */
  returnFocus?: () => HTMLElement | null;
}

/** Lowercase, accent-insensitive. */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Every typed word must appear in the item's label, hint or keywords. */
const filter = (value: string, search: string, keywords?: string[]) => {
  const haystack = normalize(`${value} ${keywords?.join(" ") ?? ""}`);
  return normalize(search)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
    ? 1
    : 0;
};

const PALETTE_SOCIALS = ["github", "youtube", "linkedin"] as const;

/**
 * ⌘K / Ctrl K command palette (cmdk + Radix Dialog: focus trap, Escape, arrow keys, screen-reader labels).
 * No animation on purpose: it is opened from the keyboard.
 */
export default function CommandPalette({ open, onOpenChange, returnFocus }: CommandPaletteProps) {
  const t = useTranslations("palette");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const nextRouter = useNextRouter();
  const localizedPath = useLocalizedPath();

  const run = (action: () => void) => () => {
    onOpenChange(false);
    action();
  };
  const openExternal = (url: string) => () => window.open(url, "_blank", "noopener");
  const switchLocale = () => nextRouter.replace(localizedPath(locale === "fr" ? "en" : "fr"), { scroll: false });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="kp-overlay" />
        <Dialog.Content
          className="kp-box"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            const target = returnFocus?.();
            if (!target?.isConnected) return;
            event.preventDefault();
            target.focus();
          }}
        >
          <Dialog.Title className="sr">{t("label")}</Dialog.Title>
          <Command label={t("label")} filter={filter} loop>
            <div className="kp-in">
              <Icon name="search" />
              <Command.Input placeholder={t("placeholder")} aria-label={t("inputLabel")} spellCheck={false} />
              <kbd>esc</kbd>
            </div>
            <Command.List className="kp-list">
              <Command.Empty className="kp-none">{t("empty")}</Command.Empty>

              <Command.Group heading={t("groups.pages")}>
                <Command.Item
                  className="kp-i"
                  value={nav("home")}
                  keywords={[t("keywords.home")]}
                  onSelect={run(() => router.push("/"))}
                >
                  {nav("home")}
                </Command.Item>
                {mainNav.map((item) => {
                  const hint = item.key === "games" ? "" : t(`hints.${item.key}`);
                  return (
                    <Command.Item
                      key={item.key}
                      className="kp-i"
                      value={`${nav(item.key)} ${hint}`}
                      keywords={[t(`keywords.${item.key}`)]}
                      onSelect={run(() => router.push(item.href))}
                    >
                      {nav(item.key)}
                      {hint && <small>{hint}</small>}
                    </Command.Item>
                  );
                })}
              </Command.Group>

              <Command.Group heading={t("groups.games")}>
                {games.map((game) => (
                  <Command.Item
                    key={game.slug}
                    className="kp-i"
                    value={`${game.name} ${t(`hints.${game.slug}`)}`}
                    keywords={[t(`keywords.${game.slug}`)]}
                    onSelect={run(() =>
                      router.push({ pathname: "/jeux/[slug]", params: { slug: game.slug } }),
                    )}
                  >
                    {game.name}
                    <small>{t(`hints.${game.slug}`)}</small>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading={t("groups.actions")}>
                <Command.Item
                  className="kp-i"
                  value={t("actions.theme")}
                  keywords={[t("keywords.theme")]}
                  onSelect={run(toggleTheme)}
                >
                  {t("actions.theme")}
                </Command.Item>
                <Command.Item
                  className="kp-i"
                  value={t("actions.language")}
                  keywords={[t("keywords.language")]}
                  onSelect={run(switchLocale)}
                >
                  {t("actions.language")}
                </Command.Item>
                <Command.Item
                  className="kp-i"
                  value={t("actions.cv")}
                  keywords={[t("keywords.cv")]}
                  onSelect={run(openExternal(site.cv))}
                >
                  {t("actions.cv")}
                </Command.Item>
              </Command.Group>

              <Command.Group heading={t("groups.networks")}>
                {PALETTE_SOCIALS.map((id) => {
                  const social = socials.find((s) => s.id === id);
                  if (!social?.url) return null;
                  const url = social.url;
                  return (
                    <Command.Item
                      key={id}
                      className="kp-i"
                      value={`${social.label} ${social.handle ?? ""}`}
                      keywords={[t(`keywords.${id}`)]}
                      onSelect={run(openExternal(url))}
                    >
                      {social.label}
                      {social.handle && <small>{social.handle}</small>}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>
            <div className="kp-ft" aria-hidden="true">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> {t("navigate")}
              </span>
              <span>
                <kbd>↵</kbd> {t("open")}
              </span>
              <span>
                <kbd>esc</kbd> {t("close")}
              </span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
