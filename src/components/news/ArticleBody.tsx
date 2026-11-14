import type { Element } from "hast";
import Image from "next/image";
import type { ComponentProps, ElementType, ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { highlight } from "@/lib/highlight";
import { publicImageSize } from "@/lib/image-size";
import { rehypeArticle, textOf } from "@/lib/markdown/rehype-article";
import { parseVideo } from "@/lib/markdown/video";
import { renderBlock } from "./article-blocks";
import { CopyAction } from "./CopyAction";
import { VideoFrame } from "./VideoFrame";

export interface ArticleBodyLabels {
  copy: string;
  copied: string;
  copyCode: string;
  copyChanges: string;
  playVideo: string;
  video: string;
  /** Header of the changelog card ("One Piexel · 18 oct. 2026"). */
  changelog: string;
}

type Props<T extends ElementType> = ComponentProps<T> & { node?: Element };

/** Blocks flagged by the rehype plugin fade in on scroll; the others render as plain elements. */
function block<T extends "p" | "h2" | "h3" | "h4" | "ul" | "ol" | "figure" | "blockquote" | "hr">(Tag: T) {
  return function Block({ node, ...props }: Props<T>) {
    const rest = { ...(props as Record<string, unknown>) };
    const revealed = "data-reveal" in rest;
    delete rest["data-reveal"];
    void node;
    const Plain: ElementType = Tag;
    return revealed ? <Reveal as={Tag} {...rest} /> : <Plain {...rest} />;
  };
}

function CodeBlock({ language, source, labels }: { language: string; source: string; labels: ArticleBodyLabels }) {
  return (
    <Reveal className="code night">
      <p className="code-h">
        <span>{language || "code"}</span>
        <CopyAction source={{ text: source }} label={labels.copy} copiedLabel={labels.copied} ariaLabel={labels.copyCode} />
      </p>
      <pre tabIndex={0}>
        <code>{highlight(source)}</code>
      </pre>
    </Reveal>
  );
}

function BodyVideo({ src, title, labels }: { src: string; title?: string; labels: ArticleBodyLabels }) {
  const video = parseVideo(src);
  if (!video) return null;
  const label = title ? `${labels.playVideo} : ${title}` : labels.playVideo;
  return (
    <Reveal as="figure">
      <VideoFrame video={video} label={label} className="vid">
        {video.kind === "youtube" && (
          // eslint-disable-next-line @next/next/no-img-element -- remote thumbnail, unknown to next/image
          <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
        )}
        <span className="vid-play" aria-hidden="true">
          <Icon name="play" />
          {labels.video}
        </span>
      </VideoFrame>
      {title && <figcaption>{title}</figcaption>}
    </Reveal>
  );
}

function components(labels: ArticleBodyLabels): Components {
  return {
    p: block("p"),
    h2: block("h2"),
    h3: block("h3"),
    h4: block("h4"),
    ul: block("ul"),
    ol: block("ol"),
    figure: block("figure"),
    blockquote: block("blockquote"),
    hr: block("hr"),

    div({ node, children, ...props }: Props<"div">) {
      const data = node?.properties ?? {};
      if (data.dataBlock === "video") {
        return <BodyVideo src={String(data.dataSrc)} title={data.dataTitle ? String(data.dataTitle) : undefined} labels={labels} />;
      }
      if (data.dataBlock === "changelog-head") {
        return (
          <p className="cl-h">
            <span>{labels.changelog}</span>
            <CopyAction
              source={{ elementId: String(data.dataTarget) }}
              label={labels.copy}
              copiedLabel={labels.copied}
              ariaLabel={labels.copyChanges}
            />
          </p>
        );
      }
      const rest = { ...(props as Record<string, unknown>) };
      const revealed = "data-reveal" in rest;
      delete rest["data-reveal"];
      return revealed ? <Reveal {...rest}>{children}</Reveal> : <div {...(rest as ComponentProps<"div">)}>{children}</div>;
    },

    img({ node, src, alt, ...props }: Props<"img">) {
      void node;
      const url = typeof src === "string" ? src : "";
      const size = publicImageSize(url);
      if (size) {
        return <Image src={url} alt={alt ?? ""} width={size.width} height={size.height} sizes="(min-width: 1000px) 720px, 100vw" />;
      }
      // eslint-disable-next-line @next/next/no-img-element -- remote or unknown image: no dimensions to give next/image
      return <img src={url} alt={alt ?? ""} loading="lazy" decoding="async" {...props} />;
    },

    a({ node, href, children, ...props }: Props<"a">) {
      void node;
      const external = /^https?:\/\//.test(href ?? "");
      return (
        <a className="in" href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})} {...props}>
          {children}
        </a>
      );
    },

    pre({ node }: Props<"pre">): ReactNode {
      const code = node?.children.find((child): child is Element => child.type === "element" && child.tagName === "code");
      const source = (code ? textOf(code) : "").replace(/\n$/, "");
      const className = Array.isArray(code?.properties.className) ? code.properties.className.map(String) : [];
      const language = className.find((name) => name.startsWith("language-"))?.slice(9) ?? "";
      const meta = typeof code?.data?.meta === "string" ? code.data.meta : undefined;
      return renderBlock(language, source, meta) ?? <CodeBlock language={language} source={source} labels={labels} />;
    },

    table({ node, children, ...props }: Props<"table">) {
      void node;
      return (
        <Reveal className="tbl" tabIndex={0}>
          <table {...props}>{children}</table>
        </Reveal>
      );
    },
  };
}

/**
 * Renders the Markdown body of a news article (GFM: headings, lists, images, links, code, quotes,
 * tables, task lists). Raw HTML in the source is ignored. Layout rules live in `rehypeArticle`,
 * the optional rich blocks in `article-blocks.tsx`.
 */
export function ArticleBody({ markdown, labels }: { markdown: string; labels: ArticleBodyLabels }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeArticle]} components={components(labels)}>
      {markdown}
    </Markdown>
  );
}

/** Inline Markdown (emphasis, links) for the lead paragraph. */
export function InlineMarkdown({ children }: { children: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} allowedElements={["em", "strong", "a", "code", "del"]} unwrapDisallowed>
      {children}
    </Markdown>
  );
}
