/**
 * Pure helpers of the Notion -> Markdown news sync: Notion page properties to the frontmatter
 * expected by `src/lib/news.ts`, YAML output, and Markdown post-processing. No network, no disk.
 * Documented in docs/NOTION.md.
 */

/** Must stay in sync with `src/lib/news.ts` and `content/games.ts` (checked by the test). */
export const GAMES = ["one-piexel", "fastr", "iconic", "studio"];
export const NEWS_TYPES = ["patch-note", "devlog", "announcement", "behind-the-scenes", "video"];
export const LOCALES = ["fr", "en"];

/** Names of the Notion properties. Required first, then optional. */
export const PROPS = {
  title: "Titre",
  slug: "Slug",
  lang: "Langue",
  game: "Jeu",
  type: "Type",
  date: "Date",
  excerpt: "Extrait",
  published: "Publié",
  cover: "Couverture",
  coverAlt: "Couverture (texte alt)",
  readingTime: "Temps de lecture",
  upcoming: "À venir",
  featured: "À la une",
  home: "Accueil",
  tags: "Tags",
  video: "Vidéo",
  teaserTitle: "Teaser titre",
  teaserExcerpt: "Teaser extrait",
  highlights: "Points forts",
  ctaLabel: "Bouton principal",
  heroTitle: "Hero titre",
  heroLabel: "Hero label",
  heroAlt: "Hero alt",
  heroCaption: "Hero légende",
  heroCutouts: "Hero découpes",
  ctaTitle: "CTA titre",
  ctaNote: "CTA note",
  ctaButton: "CTA libellé",
  ctaHref: "CTA lien",
};

const joinText = (parts) => (parts ?? []).map((p) => p.plain_text ?? "").join("");

/** Plain value of a Notion property (undefined when empty or absent). */
export function readProperty(page, name) {
  const prop = page?.properties?.[name];
  if (!prop) return undefined;
  switch (prop.type) {
    case "title":
      return joinText(prop.title).trim() || undefined;
    case "rich_text":
      return joinText(prop.rich_text).trim() || undefined;
    case "select":
      return prop.select?.name;
    case "status":
      return prop.status?.name;
    case "multi_select":
      return prop.multi_select.map((o) => o.name);
    case "number":
      return prop.number ?? undefined;
    case "checkbox":
      return prop.checkbox;
    case "url":
      return prop.url ?? undefined;
    case "date":
      return prop.date?.start ?? undefined;
    case "files":
      return prop.files.map((f) => (f.type === "file" ? f.file.url : f.external?.url)).filter(Boolean);
    case "formula":
      return prop.formula?.[prop.formula.type] ?? undefined;
    default:
      return undefined;
  }
}

const first = (value) => (Array.isArray(value) ? value[0] : value);
const lines = (value) =>
  typeof value === "string"
    ? value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
/** Drops undefined values; returns undefined when nothing is left. */
const compact = (obj) => {
  const out = Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
  return Object.keys(out).length ? out : undefined;
};

/**
 * Notion page -> `{ slug, lang, frontmatter }`. Throws an Error listing every problem found.
 * `localize(url)` rewrites an image URL (default: unchanged); the sync passes a function
 * that downloads Notion-hosted files and returns their `/images/news/...` path.
 */
export function pageToFrontmatter(page, localize = (url) => url) {
  const get = (key) => readProperty(page, PROPS[key]);
  const errors = [];
  const required = (key) => {
    const value = first(get(key));
    if (value === undefined || value === "") errors.push(`property "${PROPS[key]}" is empty or missing`);
    return value;
  };

  const title = required("title");
  const slug = required("slug");
  const lang = required("lang");
  const game = required("game");
  const type = required("type");
  const date = required("date");
  const excerpt = required("excerpt");

  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push(`slug "${slug}" must be kebab-case (a-z, 0-9, hyphens)`);
  if (lang && !LOCALES.includes(lang)) errors.push(`lang "${lang}" must be one of ${LOCALES.join(", ")}`);
  if (game && !GAMES.includes(game)) errors.push(`game "${game}" must be one of ${GAMES.join(", ")}`);
  if (type && !NEWS_TYPES.includes(type)) errors.push(`type "${type}" must be one of ${NEWS_TYPES.join(", ")}`);
  if (date && !/^\d{4}-\d{2}-\d{2}/.test(date)) errors.push(`date "${date}" is not an ISO date`);
  if (errors.length) throw new Error(errors.join("; "));

  const flag = (key) => (get(key) === true ? true : undefined);
  const number = (key) => (typeof get(key) === "number" ? get(key) : undefined);
  const cover = first(get("cover"));
  // "Hero découpes": a Files property, or text with one URL / path per line.
  const rawCutouts = get("heroCutouts");
  const cutouts = Array.isArray(rawCutouts) ? rawCutouts : lines(rawCutouts);
  const tags = get("tags");
  const highlights = lines(get("highlights"));
  const heroTitle = get("heroTitle");
  const ctaTitle = get("ctaTitle");

  const frontmatter = {
    title,
    excerpt,
    game,
    date: date.slice(0, 10),
    type,
    lang,
    cover: cover ? localize(cover) : undefined,
    coverAlt: get("coverAlt"),
    readingTime: number("readingTime"),
    upcoming: flag("upcoming"),
    featured: flag("featured"),
    home: number("home"),
    tags: Array.isArray(tags) && tags.length ? tags : undefined,
    video: get("video"),
    teaser: compact({ title: get("teaserTitle"), excerpt: get("teaserExcerpt") }),
    ctaLabel: get("ctaLabel"),
    highlights: highlights.length ? highlights : undefined,
    hero: heroTitle
      ? compact({
          title: heroTitle,
          label: get("heroLabel"),
          alt: get("heroAlt"),
          caption: get("heroCaption"),
          cutouts: cutouts.length ? cutouts.map(localize) : undefined,
        })
      : undefined,
    cta: ctaTitle
      ? compact({ title: ctaTitle, note: get("ctaNote"), label: get("ctaButton"), href: get("ctaHref") })
      : undefined,
  };
  return { slug, lang, frontmatter: Object.fromEntries(Object.entries(frontmatter).filter(([, v]) => v !== undefined)) };
}

const BARE = new Set(["game", "type", "lang", "date"]);

function yamlValue(key, value, indent) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    return `\n${value.map((item) => `${pad}  - ${JSON.stringify(item)}`).join("\n")}`;
  }
  if (value && typeof value === "object") {
    return `\n${Object.entries(value)
      .map(([k, v]) => `${pad}  ${k}:${yamlValue(k, v, indent + 2)}`)
      .join("\n")}`;
  }
  if (typeof value === "string") return ` ${BARE.has(key) && indent === 0 ? value : JSON.stringify(value)}`;
  return ` ${String(value)}`;
}

/** Minimal YAML writer: strings double-quoted (no line folding), arrays in block style. */
export function toYaml(data) {
  return Object.entries(data)
    .map(([key, value]) => `${key}:${yamlValue(key, value, 0)}`)
    .join("\n");
}

/** Full file content: frontmatter + body. */
export function renderArticle(frontmatter, body) {
  return `---\n${toYaml(frontmatter)}\n---\n\n${body.trim()}\n`;
}

/**
 * Notion has no custom code languages, so the site's rich blocks are written as a plain-text code
 * block whose first line is `@roster Label`, `@cards`, `@tiles` or `@ladder`. Rewritten to a real fence.
 */
export function restoreRichBlocks(markdown) {
  return markdown.replace(
    /^```[^\n]*\n@(roster|cards|tiles|ladder)([^\n]*)\n([\s\S]*?)\n```$/gm,
    (_, name, label, content) => `\`\`\`${name}${label.trimEnd()}\n${content}\n\`\`\``,
  );
}

const IMAGE_RE = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

/** Remote image URLs of a Markdown body, deduplicated. */
export function findRemoteImages(markdown) {
  return [...new Set([...markdown.matchAll(IMAGE_RE)].map((m) => m[2]))];
}

/** Rewrites remote image URLs with `map` (url -> local path). */
export function rewriteImages(markdown, map) {
  return markdown.replace(IMAGE_RE, (whole, alt, url) => (map.has(url) ? `![${alt}](${map.get(url)})` : whole));
}
