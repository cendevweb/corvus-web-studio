"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FINE_POINTER_QUERY, matches, prefersReducedMotion } from "@/lib/media";
import { createSpring, type Spring } from "@/lib/spring";
import { Reveal } from "./Reveal";

interface TiltCardProps {
  as?: "article" | "div" | "li";
  /** Maximum tilt, in degrees. */
  max?: number;
  /** Reveal stagger, in ms. */
  delay?: number;
  className?: string;
  children: ReactNode;
  [attribute: string]: unknown;
}

/**
 * Card that leans towards the pointer (spring) and exposes the pointer position as
 * `--gx` / `--gy` for a glare effect. Mouse only, disabled with reduced motion.
 * Also reveals itself on scroll (it renders a <Reveal>).
 */
export function TiltCard({ as = "article", max = 3, delay, className, children, ...rest }: TiltCardProps) {
  const spring = useRef<Spring | null>(null);

  useEffect(() => () => spring.current?.stop(), []);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!matches(FINE_POINTER_QUERY) || prefersReducedMotion()) return;
    const card = event.currentTarget;
    spring.current ??= createSpring(
      (x, y) => {
        card.style.transform = `perspective(1100px) rotateX(${y}deg) rotateY(${x}deg)`;
      },
      0.1,
      0.74,
    );
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    spring.current.to((px - 0.5) * 2 * max, (0.5 - py) * 2 * max);
    card.style.setProperty("--gx", `${px * 100}%`);
    card.style.setProperty("--gy", `${py * 100}%`);
  };

  return (
    <Reveal
      as={as}
      delay={delay}
      className={cn("tilt", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={() => spring.current?.to(0, 0)}
      {...rest}
    >
      {children}
    </Reveal>
  );
}
