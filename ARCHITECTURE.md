# Architecture

Portfolio of Corvus Web Studio. Next.js 16 (App Router, Turbopack), React 19,
TypeScript strict, Tailwind CSS v4, next-intl. Deployed on Vercel, npm.

## Layout

```
content/            Typed content, no UI
  site.ts           Site identity, main nav, social links
  games.ts          The three games (FR/EN), stats, media, colours
  career.ts         Company works, timeline, skills
  nest.ts           Nest experiments and their code snippets
  news/<locale>/    One Markdown file per news item (see news/README.md)
  types.ts          Localized<T>, l(), pick()
messages/           UI strings: fr.json and en.json (same keys)
public/             images/, videos/ (trailers), cv/, og/
scripts/            Notion news sync (notion-sync.mjs) and its tests
docs/               CONTENU.md (editing guide), NOTION.md (news sync)
src/
  app/[locale]/     Routes; layout.tsx is the root layout
  app/sitemap.ts, robots.ts
  components/
    ui/             Button, Card, Badge, SectionHeading, Reveal, TiltCard,
                    CrowSprite, VideoPoster, CopyButton, Icon, JsonLd,
                    PagePlaceholder
    layout/         Header, Footer, CommandPalette, LocaleSwitch, ThemeToggle
    games/          GameSkin (per-game look), skin.ts
    home/ news/ career/ nest/   Sections, cards and demos per domain
  i18n/             routing.ts, navigation.ts, request.ts, use-route.ts
  lib/              fonts, theme, news loader, seo, jsonld, page helpers
  styles/           tokens, base, components, layout, skins, home
  proxy.ts          next-intl locale routing (Next 16 name for middleware)
```

## Conventions

- **Routes.** Folders use the French path (`/jeux`, `/parcours`, ...). French
  has no prefix, English lives under `/en` with translated paths declared in
  `src/i18n/routing.ts` (`/en/games`, `/en/career`, ...). Always link with the
  internal French pathname through `Link` / `getPathname` from
  `src/i18n/navigation.ts`.
- **Pages.** Start with `const locale = await resolveLocale(params)` (validates
  and calls `setRequestLocale`) and build metadata with `buildMetadata()` from
  `src/lib/seo.ts` (canonical, hreflang, Open Graph).
- **Client hooks.** Use `useInternalRoute()` / `useLocalizedPath()` from
  `src/i18n/use-route.ts` rather than next-intl's `usePathname`, which is
  wrong during static generation of English dynamic routes.
- **Texts.** UI strings go in `messages/*.json`; editorial data goes in
  `content/` as `l("fr", "en")` pairs read with `pick(value, locale)`.
- **Client messages.** Server components read any namespace. Client components
  only see what a `NextIntlClientProvider` was given, because it is serialized
  into the HTML: the root layout passes `CHROME_NAMESPACES`, and a page with
  client components that translate wraps them in its own provider with
  `clientMessages(locale, ["contactPage.form", …])` (`src/i18n/client-messages.ts`).
  A missing namespace fails the build (`MISSING_MESSAGE`).
- **News.** `content/news/<locale>/<slug>.md` with frontmatter (required `title`, `excerpt`, `game`,
  `date`, `type`, `lang`; many optional fields), loaded by `src/lib/news.ts` and rendered by
  `src/components/news/` and `src/lib/markdown/`. Schema: `content/news/README.md`. Files can be generated
  from Notion with `npm run news:sync` (`docs/NOTION.md`).
- **Styles.** `globals.css` only holds what every page needs (tokens, base,
  components, layout, skins, home). Each `src/styles/pages/<page>.css` is
  imported by the route files that use it (`import "@/styles/pages/news.css"`),
  so a page downloads its own CSS only. Design tokens live in
  `src/styles/tokens.css` (`@theme`) and switch on `html[data-theme]`. Component classes keep the names of the
  validated mockups, inside `@layer components`; Tailwind utilities are
  available on top. `.ring/.halo/.disc` of the mockup are named
  `.stage-ring/.stage-halo/.stage-disc`.
- **Theme.** Dark by default. An inline script in the root layout restores the
  choice (`localStorage["corvus-theme"]`) before paint; read it with
  `useTheme()`.
- **Game skins.** Wrap game-specific UI in `<GameSkin game="one-piexel">`; it
  sets the skin class and loads the skin fonts (`src/lib/fonts-skins.ts`), so
  those fonts are only requested where a skin is rendered.
- **Motion.** `Reveal` and the canvas components respect
  `prefers-reduced-motion`. Only `transform` and `opacity` are animated; UI
  transitions stay within 150-300 ms. `Reveal` has no client JS: the inline
  head script (`src/lib/theme-script.ts`) leaves what is already on screen
  visible (the LCP element is painted with the first frame) and reveals the
  rest on scroll through `data-r="wait"` → `data-r="in"`.
- **Media.** Images through `next/image` with real dimensions and a `sizes`
  that matches the layout; the LCP image of a page gets `loading="eager"` and
  `fetchPriority="high"` (`priority` is deprecated in Next 16). Trailers in
  `public/videos/` through `VideoPoster` (poster first, video on click).
- **Accessible names.** A control with visible text has no `aria-label` that
  drops that text (WCAG 2.5.3): add a `.sr` span instead.
- **SEO.** `personJsonLd`, `organizationJsonLd`, `websiteJsonLd`,
  `videoGameJsonLd` in `src/lib/jsonld.ts`, rendered with `<JsonLd>`. The site
  URL comes from `NEXT_PUBLIC_SITE_URL`.

## Notes

- `experimental.optimisticRouting` is off in `next.config.ts`: with the i18n
  proxy rewrites the client router mistakes unprefixed French paths for
  `/[locale]` and loops on prefetch.
- Pages other than the home are skeletons built with `PagePlaceholder`.
