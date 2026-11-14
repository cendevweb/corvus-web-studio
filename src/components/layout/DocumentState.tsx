"use client";

import { useLayoutEffect } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";
import { setTheme } from "@/lib/theme";

/**
 * Switching locale remounts <html> (the root layout lives under [locale]), which drops what the
 * inline head script set. Re-apply it before paint: the `js` flag and the saved theme.
 */
export function DocumentState() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      /* storage unavailable: keep the default theme */
    }
    if (saved === "light" && root.dataset.theme !== "light") setTheme("light");
  }, []);
  return null;
}
