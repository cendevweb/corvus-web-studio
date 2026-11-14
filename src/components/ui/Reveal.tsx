"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

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

const callbacks = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  return observer;
}

/**
 * Reveals its content when it scrolls into view (fade + 14px rise, 420ms).
 * - Content stays visible without JS (the hidden state needs `html.js`, set by the inline head script).
 * - With `prefers-reduced-motion` only the opacity animates (handled in CSS).
 */
export function Reveal({ as, delay, className, style, children, ...rest }: RevealProps) {
  const Tag: ElementType = as ?? "div";
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    callbacks.set(el, () => setShown(true));
    io.observe(el);
    return () => {
      callbacks.delete(el);
      io.unobserve(el);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      data-r=""
      className={cn(className, shown && "in")}
      style={delay ? ({ ...style, "--d": `${delay}ms` } as CSSProperties) : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
