# News (devlog)

One Markdown file per publication and per language: `content/news/<locale>/<slug>.md`.
The file name is the slug and must be identical in `fr/` and `en/`.
News will later be written in Notion and exported to Markdown into these folders
(the loader in `src/lib/news.ts` only relies on the frontmatter below).

```yaml
---
title: "Patch note du 18 octobre : 12 nouveaux combattants"   # required
excerpt: "One or two sentences shown in lists."               # required
game: one-piexel            # one-piexel | fastr | iconic | studio (required)
date: 2026-10-18            # ISO date (required)
type: patch-note            # patch-note | devlog | announcement | behind-the-scenes | video (required)
lang: fr                    # fr | en (required, must match the folder)
cover: /images/games/one-piexel/op-22.jpg
coverAlt: "Describe the image."
readingTime: 4              # minutes (optional)
upcoming: false             # true while the news announces something not released yet
featured: false             # "À la une" on the news page
home: 2                     # position among the home page cards (optional, 1-3)
tags: [12 combattants, classé]
video: https://www.youtube.com/watch?v=…   # optional
teaser:                     # optional shorter wording for compact cards (home page)
  title: "…"
  excerpt: "…"
highlights: ["…", "…"]      # optional bullet points of the "À la une" card on /news
ctaLabel: "Regarder le Direct"   # optional label of the main button on the "À la une" card
hero:                       # optional poster of the article (falls back to the cover)
  title: "12 NOUVEAUX VENUS"
  label: "BANDE-ANNONCE"
  alt: "…"
  caption: "…"
  cutouts: [/images/news/left.png, /images/news/right.png, /images/news/centre.png]
cta:                        # optional "play" box at the end of the article
  title: "Kaido attend."
  note: "…"
  label: "Jouer"
  href: https://…           # defaults to the game's link
---

Markdown body…
```

## Body

Standard Markdown (GFM): titles, lists, images, links, quotes, tables, code. Raw HTML is ignored.
The renderer lives in `src/components/news/ArticleBody.tsx` and `src/lib/markdown/`.

- **Lead**: the text before the first `##` is the article's standfirst.
- **Sections**: every `##` opens a numbered section and an entry of the table of contents.
  `## Kicker | Title | Short label` sets the small kicker above the title and the label
  used in the table of contents; a plain `## Title` works too.
- **Images**: an image alone in its paragraph becomes a figure, its Markdown title the caption:
  `![Alt text](/images/…jpg "Caption")`.
- **Videos**: a YouTube link or an `.mp4` / `.webm` path alone in its paragraph becomes a player.
- **Caption**: a paragraph entirely in italics is rendered as a small note.
- **Lists** are styled from their content:
  - `- **12** nouveaux combattants…` (bold number first): key figures;
  - `- **AJOUT** Texte…` (bold uppercase tag first): changelog, grouped under the `###` above it;
  - `- **Terme.** Définition…`: definition cards;
  - anything else: a regular list.
- **Rich blocks** are fenced code blocks with a reserved name, one item per line:
  - ```` ```roster <accessible label> ````: `Name`, or `Name | Note` to highlight an entry;
  - ```` ```cards ````: `icon | Title | Text`;
  - ```` ```tiles ````: `icon | Label`;
  - ```` ```ladder ````: `key: value` lines (`steps`, `start`, `end`, `note`, `alt`).
  Icons: shield, armor, clock, break, star, bolt, keyboard, touch, gamepad, desktop.
  Any other fence (` ```js `, ` ```css `…) is a code block with a copy button.
