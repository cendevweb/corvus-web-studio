import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** "Disponible pour missions": green status pill with a pulsing dot. */
export function Availability({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("avail", className)}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

type BadgeTone = "default" | "soon" | "live" | "solid";

/**
 * Small pixel-font label.
 * - `soon`: dashed, for placeholders ("à venir")
 * - `live`: green with a blinking square
 * - `solid`: dark chip that stays readable over images
 */
export function Badge({
  tone = "default",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("badge", tone !== "default" && `badge-${tone}`, className)}>
      {tone === "live" && <i aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Game status chip, styled by the surrounding game skin (see GameSkin). */
export function StatusChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("g-chip", className)}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

/** Row of small technical tags. */
export function Tags({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("tags", className)}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
