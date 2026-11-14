/** Theme constants and the pre-paint inline script (no client APIs: safe to import from server components). */
export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "corvus-theme";
export const THEME_COLORS: Record<Theme, string> = { dark: "#0E0E12", light: "#F2F0EB" };
/**
 * Inline script run in <head> before first paint: restores the saved theme (dark by default)
 * and flags that JS is running (scroll reveals only hide content when it is).
 */
export const themeInitScript = `(function(){var d=document.documentElement;d.classList.add("js");try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="light"){d.dataset.theme="light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","${THEME_COLORS.light}")}}catch(e){}})()`;

