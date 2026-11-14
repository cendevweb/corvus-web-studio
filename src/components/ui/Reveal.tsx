import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  /** Stagger, in ms. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Any other attribute is forwarded to the element (id, aria-*, data-*…). */
  [attribute: string]: unknown;
}

/**
 * Reveals its content when it scrolls into view (fade + 14px rise, 300ms).
 * - No client JS of its own: the inline head script (src/lib/theme-script.ts) watches every `[data-r]`
 *   element. What is already on screen stays visible (so the LCP element is painted with the first
 *   frame); what is below gets `data-r="wait"`, then `data-r="in"` once it scrolls into view.
 * - Content stays visible without JS (the hidden state needs `html.js`, set by the same script).
 * - With `prefers-reduced-motion` only the opacity animates (handled in CSS).
 */
export function Reveal({ as, delay, className, style, children, ...rest }: RevealProps) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      data-r=""
      // The head script changes `data-r` before React hydrates.
      suppressHydrationWarning
      className={className}
      style={delay ? ({ ...style, "--d": `${delay}ms` } as CSSProperties) : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
