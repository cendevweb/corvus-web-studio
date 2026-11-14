#!/usr/bin/env node
/**
 * Notion -> Markdown news sync. See docs/NOTION.md.
 *
 *   npm run news:sync                 write content/news/<locale>/<slug>.md and download images
 *   npm run news:sync -- --dry-run    show what would change, write nothing
 *   npm run news:sync -- --only slug  only the pages with this slug
 *
 * Env: NOTION_TOKEN, NOTION_NEWS_DATABASE_ID (read from the shell, or from .env.local / .env).
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import notionhq from "@notionhq/client";
import notionToMd from "notion-to-md";
import {
  PROPS,
  findRemoteImages,
  pageToFrontmatter,
  renderArticle,
  restoreRichBlocks,
  rewriteImages,
} from "./lib/news-mapping.mjs";

const ROOT = process.cwd();
const NEWS_DIR = path.join(ROOT, "content", "news");
const IMAGES_DIR = path.join(ROOT, "public", "images", "news");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlyIndex = args.indexOf("--only");
const only = onlyIndex >= 0 ? args[onlyIndex + 1] : undefined;

if (args.includes("--help") || args.includes("-h")) {
  console.log("Usage: npm run news:sync -- [--dry-run] [--only <slug>]");
  process.exit(0);
}

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(path.join(ROOT, file));
  } catch {
    // file absent: variables come from the shell
  }
}

const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_NEWS_DATABASE_ID;
if (!token || !databaseId) {
  console.error("Missing NOTION_TOKEN or NOTION_NEWS_DATABASE_ID (see docs/NOTION.md).");
  process.exit(1);
}

const { Client, isFullPage } = notionhq;
const { NotionToMarkdown } = notionToMd;

const notion = new Client({ auth: token });
const n2m = new NotionToMarkdown({ notionClient: notion, config: { parseChildPages: false } });

const EXT_BY_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

const urlExtension = (url) => {
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  return /^\.(jpe?g|png|webp|gif|avif|svg)$/.test(ext) ? ext.replace(".jpeg", ".jpg") : "";
};

/** Notion data sources replaced databases in the API: resolve the first data source of the database. */
async function resolveDataSourceId() {
  try {
    const db = await notion.databases.retrieve({ database_id: databaseId });
    return db.data_sources?.[0]?.id ?? databaseId;
  } catch {
    // The id may already be a data source id.
    return databaseId;
  }
}

async function fetchPublishedPages() {
  const dataSourceId = await resolveDataSourceId();
  const pages = [];
  let cursor;
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: PROPS.published, checkbox: { equals: true } },
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...res.results.filter(isFullPage));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return pages;
}

/** Downloads a remote image into public/images/news/<slug>/ and returns its public path. */
async function downloadImage(url, slug, stats) {
  // The signed query string changes on every call, the pathname (block id + file name) does not.
  const key = createHash("sha1").update(new URL(url).pathname).digest("hex").slice(0, 10);
  const guessed = urlExtension(url) || ".jpg";
  const existing = fs.existsSync(path.join(IMAGES_DIR, slug))
    ? fs.readdirSync(path.join(IMAGES_DIR, slug)).find((name) => name.startsWith(`${key}.`))
    : undefined;
  if (existing) return `/images/news/${slug}/${existing}`;
  if (dryRun) {
    stats.images += 1;
    return `/images/news/${slug}/${key}${guessed}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image download failed (${res.status}): ${new URL(url).pathname}`);
  const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  const name = `${key}${EXT_BY_TYPE[contentType] ?? guessed}`;
  fs.mkdirSync(path.join(IMAGES_DIR, slug), { recursive: true });
  fs.writeFileSync(path.join(IMAGES_DIR, slug, name), Buffer.from(await res.arrayBuffer()));
  stats.images += 1;
  return `/images/news/${slug}/${name}`;
}

async function syncPage(page, stats) {
  // First pass without download to get slug and lang (and validate), second with the real localizer.
  const { slug } = pageToFrontmatter(page);
  if (only && slug !== only) return;

  const cache = new Map();
  const remote = [];
  pageToFrontmatter(page, (url) => (/^https?:\/\//.test(url) ? (remote.push(url), url) : url));
  for (const url of remote) cache.set(url, await downloadImage(url, slug, stats));
  const { lang, frontmatter } = pageToFrontmatter(page, (url) => cache.get(url) ?? url);

  const blocks = await n2m.pageToMarkdown(page.id);
  let body = restoreRichBlocks(n2m.toMarkdownString(blocks).parent ?? "");
  const bodyImages = new Map();
  for (const url of findRemoteImages(body)) bodyImages.set(url, await downloadImage(url, slug, stats));
  body = rewriteImages(body, bodyImages);

  const file = path.join(NEWS_DIR, lang, `${slug}.md`);
  const next = renderArticle(frontmatter, body);
  const previous = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : undefined;
  const status = previous === undefined ? "new" : previous === next ? "unchanged" : "changed";
  stats[status] += 1;
  console.log(`${status.padEnd(9)} ${path.relative(ROOT, file)}`);
  if (status !== "unchanged" && !dryRun) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, next);
  }
}

const stats = { new: 0, changed: 0, unchanged: 0, images: 0, errors: 0 };
console.log(dryRun ? "Dry run: nothing will be written.\n" : "Syncing published news from Notion.\n");

let pages;
try {
  pages = await fetchPublishedPages();
} catch (error) {
  console.error(`Notion query failed: ${error instanceof Error ? error.message : error}`);
  console.error("Check the token, the database id and that the database is shared with the integration.");
  process.exit(1);
}

for (const page of pages) {
  try {
    await syncPage(page, stats);
  } catch (error) {
    stats.errors += 1;
    console.error(`error     page ${page.id}: ${error instanceof Error ? error.message : error}`);
  }
}

console.log(
  `\n${stats.new} new, ${stats.changed} changed, ${stats.unchanged} unchanged, ` +
    `${stats.images} image(s) ${dryRun ? "to download" : "downloaded"}, ${stats.errors} error(s).`,
);
if (!dryRun && stats.new + stats.changed > 0) console.log("Review with `git diff`, then commit.");
process.exit(stats.errors ? 1 : 0);
