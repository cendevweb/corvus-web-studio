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
---

Markdown body…
```
