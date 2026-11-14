import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import matter from "gray-matter";
import {
  GAMES,
  NEWS_TYPES,
  findRemoteImages,
  pageToFrontmatter,
  renderArticle,
  restoreRichBlocks,
  rewriteImages,
} from "./news-mapping.mjs";

const text = (content) => [{ plain_text: content }];
const richText = (content) => ({ type: "rich_text", rich_text: text(content) });
const select = (name) => ({ type: "select", select: { name } });

/** Fake page, shaped like a Notion API response (only the fields the mapping reads). */
const fakePage = (overrides = {}) => ({
  id: "page-id",
  properties: {
    Titre: { type: "title", title: text("Patch note du 18 octobre") },
    Slug: richText("one-piexel-patch-2026-10-18"),
    Langue: select("fr"),
    Jeu: select("one-piexel"),
    Type: select("patch-note"),
    Date: { type: "date", date: { start: "2026-10-18T10:00:00.000+02:00" } },
    Extrait: richText("12 nouveaux combattants."),
    Publié: { type: "checkbox", checkbox: true },
    Couverture: {
      type: "files",
      files: [{ type: "file", file: { url: "https://prod-files-secure.s3.amazonaws.com/x/cover.jpg?X-Amz=1" } }],
    },
    "Temps de lecture": { type: "number", number: 4 },
    "À venir": { type: "checkbox", checkbox: false },
    "À la une": { type: "checkbox", checkbox: true },
    Accueil: { type: "number", number: 2 },
    Tags: { type: "multi_select", multi_select: [{ name: "classé" }, { name: "roster" }] },
    "Points forts": richText("Premier point\nSecond point"),
    "Teaser titre": richText("Titre court"),
    "CTA titre": richText("Kaido attend."),
    "CTA lien": { type: "url", url: "https://one-piexel.gg" },
    ...overrides,
  },
});

test("maps required and optional properties to the news frontmatter", () => {
  const { slug, lang, frontmatter } = pageToFrontmatter(fakePage(), (url) => `/images/news/local/${url.split("/").pop().split("?")[0]}`);
  assert.equal(slug, "one-piexel-patch-2026-10-18");
  assert.equal(lang, "fr");
  assert.deepEqual(frontmatter, {
    title: "Patch note du 18 octobre",
    excerpt: "12 nouveaux combattants.",
    game: "one-piexel",
    date: "2026-10-18",
    type: "patch-note",
    lang: "fr",
    cover: "/images/news/local/cover.jpg",
    readingTime: 4,
    featured: true,
    home: 2,
    tags: ["classé", "roster"],
    teaser: { title: "Titre court" },
    highlights: ["Premier point", "Second point"],
    cta: { title: "Kaido attend.", href: "https://one-piexel.gg" },
  });
});

test("omits unset optional fields and false flags", () => {
  const { frontmatter } = pageToFrontmatter(fakePage());
  assert.equal("upcoming" in frontmatter, false);
  assert.equal("hero" in frontmatter, false);
  assert.equal("video" in frontmatter, false);
});

test("builds the hero block when its title is set", () => {
  const { frontmatter } = pageToFrontmatter(
    fakePage({
      "Hero titre": richText("12 NOUVEAUX VENUS"),
      "Hero découpes": richText("/images/news/left.png\n/images/news/right.png"),
    }),
  );
  assert.deepEqual(frontmatter.hero, {
    title: "12 NOUVEAUX VENUS",
    cutouts: ["/images/news/left.png", "/images/news/right.png"],
  });
});

test("reports every invalid or missing property at once", () => {
  const page = fakePage({ Slug: richText("Not A Slug"), Jeu: select("zelda"), Type: select("") });
  assert.throws(() => pageToFrontmatter(page), /slug "Not A Slug".*game "zelda"/s);
  assert.throws(() => pageToFrontmatter(fakePage({ Extrait: richText("") })), /"Extrait" is empty/);
});

test("output parses back with gray-matter into the same data, without line folding", () => {
  const { frontmatter } = pageToFrontmatter(
    fakePage({ Extrait: richText(`Un extrait très long : ${"mot ".repeat(40)}avec des "guillemets".`) }),
  );
  const file = renderArticle(frontmatter, "Intro.\n\n## Section\n");
  const parsed = matter(file);
  assert.equal(parsed.data.excerpt, frontmatter.excerpt);
  assert.equal(parsed.data.date.toISOString().slice(0, 10), "2026-10-18"); // bare YAML date, as in the existing files
  assert.deepEqual(parsed.data.tags, ["classé", "roster"]);
  assert.equal(parsed.data.cta.href, "https://one-piexel.gg");
  assert.equal(parsed.content.trim(), "Intro.\n\n## Section");
  assert.equal(file.split("\n").filter((line) => line.startsWith("excerpt:")).length, 1);
});

test("restores rich blocks written as plain-text code blocks", () => {
  const input = "Texte\n\n```plain text\n@roster Les 12 venus\nKaido | Le plus fort\nGarp\n```\n\n```js\nconst a = 1;\n```";
  assert.equal(
    restoreRichBlocks(input),
    "Texte\n\n```roster Les 12 venus\nKaido | Le plus fort\nGarp\n```\n\n```js\nconst a = 1;\n```",
  );
});

test("finds and rewrites remote images only", () => {
  const md = "![a](https://s3.example/x.png?sig=1)\n\n![b](/images/local.png)\n\n![a](https://s3.example/x.png?sig=1)";
  const urls = findRemoteImages(md);
  assert.deepEqual(urls, ["https://s3.example/x.png?sig=1"]);
  const out = rewriteImages(md, new Map([[urls[0], "/images/news/s/abc.png"]]));
  assert.equal(out, "![a](/images/news/s/abc.png)\n\n![b](/images/local.png)\n\n![a](/images/news/s/abc.png)");
});

test("game and type lists match the site code", () => {
  const games = fs.readFileSync("content/games.ts", "utf8").match(/export type GameSlug = ([^;]+);/)[1];
  assert.deepEqual([...games.matchAll(/"([^"]+)"/g)].map((m) => m[1]), GAMES.filter((g) => g !== "studio"));
  const types = fs.readFileSync("src/lib/news.ts", "utf8").match(/NEWS_TYPES = \[([^\]]+)\]/)[1];
  assert.deepEqual([...types.matchAll(/"([^"]+)"/g)].map((m) => m[1]), NEWS_TYPES);
});
