import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  /** Pixel-font kicker above the title ("01 / Jeux à la une"). */
  kicker?: ReactNode;
  /** Title content. Wrap accent words in <em>: they render in Instrument Serif italic. */
  title: ReactNode;
  /** Heading level (visual style is the same). */
  level?: "h1" | "h2" | "h3";
  /** Paint the <em> accents with the iridescent gradient. */
  iris?: boolean;
  /** Optional element on the right (link, filters…). Switches to the two-column header layout. */
  aside?: ReactNode;
  id?: string;
  className?: string;
}

/**
 * Section title with its kicker.
 * With `aside` it renders the full `.sec-hd` row; alone it renders just the kicker + title block.
 */
export function SectionHeading({ kicker, title, level = "h2", iris, aside, id, className }: SectionHeadingProps) {
  const Heading = level;
  const block = (
    <Reveal className={aside ? undefined : className}>
      {kicker && <span className="sec-n">{kicker}</span>}
      <Heading id={id} className={cn("sec-title", iris && "is-iris")}>
        {title}
      </Heading>
    </Reveal>
  );
  if (!aside) return block;
  return (
    <div className={cn("sec-hd", className)}>
      {block}
      {aside}
    </div>
  );
}

/** Standalone iridescent Instrument Serif accent, for use outside headings. */
export function IrisAccent({ children }: { children: ReactNode }) {
  return <em className="iris-text font-serif font-normal italic">{children}</em>;
}
