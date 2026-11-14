import type { Element, ElementContent, Properties, Root, RootContent } from "hast";
import { createSlugger, parseHeading } from "./outline";
import { parseVideo } from "./video";

/**
 * Turns the plain HTML tree of a news article (standard Markdown, as exported from Notion)
 * into the article layout, without any custom syntax in the source:
 *
 * - every `## heading` opens a numbered `<section>` with an id (see `parseHeading` for the kicker);
 * - an image alone in its paragraph becomes a framed `<figure>`, its title the caption;
 * - a YouTube / MP4 link alone in its paragraph becomes a video block;
 * - a paragraph entirely in italics becomes a caption;
 * - lists are styled after the shape of their items:
 *     `- **12** fighters…`        → key figures (and the section becomes the "in short" card)
 *     `- **ADDED** 12 fighters…`  → changelog rows, grouped under their `###` headings
 *     `- **Parry.** A counter…`   → definition cards
 *     anything else               → plain bullet list
 *
 * Blocks to reveal on scroll are flagged with `data-reveal` and special blocks with `data-block`;
 * `ArticleBody` maps both to components.
 */

type Node = ElementContent | RootContent;

const el = (tagName: string, properties: Properties = {}, children: ElementContent[] = []): Element => ({
  type: "element",
  tagName,
  properties,
  children,
});

const isElement = (node: Node | undefined, tagName?: string): node is Element =>
  node?.type === "element" && (!tagName || node.tagName === tagName);

const isBlank = (node: Node) => node.type === "text" && !node.value.trim();

const significant = <T extends Node>(nodes: T[]): T[] => nodes.filter((node) => !isBlank(node));

export function textOf(node: Node): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(textOf).join("");
  return "";
}

const classes = (node: Element): string[] =>
  Array.isArray(node.properties.className) ? node.properties.className.map(String) : [];

const hasClass = (node: Node | undefined, name: string) => isElement(node) && classes(node).includes(name);

/* ───────── Paragraphs ───────── */

function transformParagraph(node: Element): Element {
  const children = significant(node.children);
  const only = children.length === 1 ? children[0] : undefined;

  if (isElement(only, "img")) {
    const { title, ...properties } = only.properties;
    const figure = el("figure", {}, [el("div", { className: ["shot"] }, [{ ...only, properties }])]);
    if (typeof title === "string" && title) figure.children.push(el("figcaption", {}, [{ type: "text", value: title }]));
    return figure;
  }

  if (isElement(only, "a")) {
    const href = String(only.properties.href ?? "");
    if (parseVideo(href)) {
      const label = textOf(only).trim();
      return el("div", { dataBlock: "video", dataSrc: href, dataTitle: label && label !== href ? label : undefined });
    }
  }

  if (isElement(only, "em")) return el("p", { className: ["cap"] }, only.children);

  return node;
}

/* ───────── Lists ───────── */

type ListKind = "figures" | "tagged" | "defs" | "rules";

interface ItemParts {
  lead: string;
  rest: ElementContent[];
}

/** Splits `**lead** rest` (the paragraph of a loose list item is unwrapped first). */
function itemParts(item: Element): ItemParts | null {
  let children = significant(item.children);
  if (isElement(children[0], "p")) children = [...significant(children[0].children), ...children.slice(1)];
  const [first, ...rest] = children;
  if (!isElement(first, "strong")) return null;
  const head = rest[0];
  if (head?.type === "text") rest[0] = { ...head, value: head.value.replace(/^\s+/, "") };
  return { lead: textOf(first).trim(), rest };
}

const isFigure = (lead: string) => /^[\d][\d\s.,+%×x/-]*$/.test(lead);
const isTag = (lead: string) => lead.length <= 16 && /\p{L}/u.test(lead) && lead === lead.toUpperCase() && !/[.:]$/.test(lead);
const isTerm = (lead: string) => /[.:]$/.test(lead);

function transformList(list: Element, tagClass: (tag: string) => string): Element {
  const items = list.children.filter((child): child is Element => isElement(child, "li"));
  const parts = items.map(itemParts);
  const every = (test: (lead: string) => boolean) =>
    parts.length > 0 && parts.every((part) => part !== null && test(part.lead) && part.rest.length > 0);

  const kind: ListKind = every(isFigure) ? "figures" : every(isTag) ? "tagged" : every(isTerm) ? "defs" : "rules";

  const children = items.map((item, index) => {
    const part = parts[index];
    if (kind === "rules" || !part) return el("li", {}, [el("span", {}, item.children)]);
    if (kind === "figures") {
      return el("li", {}, [el("b", {}, [{ type: "text", value: part.lead }]), el("span", {}, part.rest)]);
    }
    if (kind === "tagged") {
      return el("li", {}, [
        el("span", { className: ["tg", tagClass(part.lead)] }, [{ type: "text", value: part.lead }]),
        el("span", {}, part.rest),
      ]);
    }
    return el("li", {}, [
      el("span", { className: ["def-n"], ariaHidden: "true" }, [{ type: "text", value: String(index + 1).padStart(2, "0") }]),
      el("b", {}, [{ type: "text", value: part.lead.replace(/[.:]$/, "") }]),
      el("p", {}, part.rest),
    ]);
  });

  return el("ul", { className: [kind] }, children);
}

/* ───────── Sections ───────── */

/** `### group` + tagged list runs become one changelog card. */
function groupChangelog(children: ElementContent[], sectionId: string): ElementContent[] {
  const start = children.findIndex((child, index) => {
    if (hasClass(child, "tagged")) return true;
    return isElement(child, "h3") && hasClass(children[index + 1], "tagged");
  });
  if (start < 0) return children;

  const groups: Element[] = [];
  let index = start;
  while (index < children.length) {
    const child = children[index]!;
    const next = children[index + 1];
    if (isElement(child, "h3") && hasClass(next, "tagged")) {
      groups.push(el("div", { className: ["cl-g"] }, [child, next as Element]));
      index += 2;
    } else if (hasClass(child, "tagged")) {
      groups.push(el("div", { className: ["cl-g"] }, [child]));
      index += 1;
    } else break;
  }

  const id = `changes-${sectionId}`;
  const card = el("div", { className: ["cl"] }, [
    el("div", { dataBlock: "changelog-head", dataTarget: id }),
    el("div", { id }, groups),
  ]);
  return [...children.slice(0, start), card, ...groupChangelog(children.slice(index), `${sectionId}-b`)];
}

const reveal = (node: ElementContent): ElementContent =>
  isElement(node) ? { ...node, properties: { ...node.properties, dataReveal: "" } } : node;

function finishSection(children: ElementContent[], id: string): ElementContent[] {
  const grouped = groupChangelog(children, id);
  if (grouped.some((child) => hasClass(child, "figures"))) {
    return [el("div", { className: ["tldr"], dataReveal: "" }, grouped)];
  }
  return grouped.map(reveal);
}

export function rehypeArticle() {
  return (tree: Root): void => {
    const slug = createSlugger();
    const tags = new Map<string, string>();
    const tagClass = (tag: string) => {
      let name = tags.get(tag);
      if (!name) {
        name = `tg-${tags.size % 3}`;
        tags.set(tag, name);
      }
      return name;
    };

    const blocks = significant(tree.children)
      .filter((node): node is Element => isElement(node))
      .map((node) => {
        if (node.tagName === "p") return transformParagraph(node);
        if (node.tagName === "ul" && !classes(node).includes("contains-task-list")) return transformList(node, tagClass);
        return node;
      });

    const output: ElementContent[] = [];
    let section: { id: string; children: ElementContent[] } | null = null;
    let number = 0;
    const close = () => {
      if (!section) return;
      output.push(
        el("section", { id: section.id, ariaLabelledBy: `h-${section.id}` }, finishSection(section.children, section.id)),
      );
      section = null;
    };

    for (const block of blocks) {
      if (block.tagName !== "h2") {
        if (section) section.children.push(block);
        else output.push(reveal(block));
        continue;
      }
      close();
      number += 1;
      const { kicker, title, short } = parseHeading(textOf(block));
      const id = slug(short ?? title);
      const label = String(number).padStart(2, "0") + (kicker ? ` / ${kicker}` : "");
      const heading = el("h2", { id: `h-${id}` }, [
        el("span", {}, [{ type: "text", value: label }]),
        { type: "text", value: title },
      ]);
      section = { id, children: [heading] };
    }
    close();

    tree.children = output;
  };
}
