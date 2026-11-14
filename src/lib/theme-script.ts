/** Theme constants and the pre-paint inline script (no client APIs: safe to import from server components). */
export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "corvus-theme";
export const THEME_COLORS: Record<Theme, string> = { dark: "#0E0E12", light: "#F2F0EB" };

/** Restores the saved theme (dark by default) and flags that JS is running. */
const themeScript = `var d=document.documentElement;d.classList.add("js");try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="light"){d.dataset.theme="light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","${THEME_COLORS.light}")}}catch(e){}`;

/**
 * Scroll reveals (components/ui/Reveal.tsx), without waiting for hydration. Every `[data-r]` element is
 * found by a MutationObserver (streamed HTML and client-side navigations included), then:
 * - `sort` looks at it once: already on screen → `data-r="in"` right away, it never gets hidden, so the
 *   first viewport (and the LCP element) is painted with the first frame; off screen → `data-r="wait"`;
 * - `show` flips a waiting element to `data-r="in"` when it scrolls into view (the CSS transition runs).
 * Without the observers the `js` flag is dropped and content simply stays visible.
 */
const revealScript = `if(!window.IntersectionObserver||!window.MutationObserver){d.classList.remove("js")}else{var show=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++)if(es[i].isIntersecting){es[i].target.setAttribute("data-r","in");show.unobserve(es[i].target)}},{rootMargin:"0px 0px -8% 0px",threshold:.08});var sort=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){var t=es[i].target;sort.unobserve(t);if(es[i].isIntersecting)t.setAttribute("data-r","in");else{t.setAttribute("data-r","wait");show.observe(t)}}});var w=function(n){if(n.nodeType!==1)return;if(n.getAttribute("data-r")==="")sort.observe(n);for(var l=n.querySelectorAll('[data-r=""]'),i=0;i<l.length;i++)sort.observe(l[i])};new MutationObserver(function(ms){for(var i=0;i<ms.length;i++)for(var a=ms[i].addedNodes,j=0;j<a.length;j++)w(a[j])}).observe(document,{childList:true,subtree:true})}`;

/** Inline script run in <head> before first paint. */
export const themeInitScript = `(function(){${themeScript}${revealScript}})()`;
