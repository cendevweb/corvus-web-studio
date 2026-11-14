import type { ComponentProps, ElementType } from "react";
import { cn } from "@/lib/cn";

type CardProps<T extends ElementType> = {
  as?: T;
  /** Border lights up on hover. */
  hoverable?: boolean;
  /** Lifts by 3px on hover (implies `hoverable`). */
  lift?: boolean;
} & Omit<ComponentProps<T>, "as">;

/** Neutral surface: --bg-2 background, hairline border, 18px radius. */
export function Card<T extends ElementType = "div">({
  as,
  hoverable,
  lift,
  className,
  ...props
}: CardProps<T>) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      className={cn("card", (hoverable || lift) && "is-hoverable", lift && "is-lift", className)}
      {...props}
    />
  );
}
