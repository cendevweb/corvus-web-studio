"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { toggleTheme, useTheme } from "@/lib/theme";

/** Light/dark switch. Dark by default, remembered in localStorage, applied before first paint. */
export function ThemeToggle() {
  const t = useTranslations("header");
  const theme = useTheme();
  return (
    <button
      type="button"
      className="tbtn"
      onClick={toggleTheme}
      aria-label={theme === "light" ? t("toDark") : t("toLight")}
    >
      <Icon name="sun" className="sun" />
      <Icon name="moon" className="moon" />
    </button>
  );
}
